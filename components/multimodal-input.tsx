'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
  useEffect,
  Fragment,
  useMemo,
  useCallback,
} from 'react';
import { toast } from 'sonner';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import type { VisibilityType } from './visibility-selector';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDealer, useDealerStore } from '@/stores/dealer-store';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import SuggestionsInnerComponent from './SuggestionsInnerComponent';
import { useParams } from 'next/navigation';
import { MovingBorderDiv } from './MovingBorder';

function PureMultimodalInput({
  chatId,
  isAtBottom,
  scrollToBottom,
  showGradient,
  input,
  setInput,

  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
}: {
  chatId: string | undefined;
  showGradient: boolean;
  isAtBottom: boolean;
  scrollToBottom: () => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
    const { isDealerSelected, selectedDealer } = useDealer();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const width = 1024; // Dummy width instead of useWindowSize
  const [isFocused, setIsFocused] = useState(false);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Set minimum height based on focus state
      const minHeight = isFocused ? 120 : 60; // Expanded when focused
      const maxHeight = Math.min(window.innerHeight * 0.4, 300); // Max 40% of viewport or 300px
      
      const newHeight = Math.max(minHeight, Math.min(scrollHeight + 2, maxHeight));
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '60px'; // Base height when not focused
    }
  };

  const { id: chatIdSessionId } = useParams();

  // Adjust height when focus state changes or input changes
  useEffect(() => {
    adjustHeight();
  }, [isFocused, input]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  interface HandleFocusEvent extends React.FocusEvent<HTMLTextAreaElement> {}

  const handleFocus = useCallback((e: HandleFocusEvent) => {
    if (messages.length > 0) {
      return;
    }
    e.preventDefault();
    setIsFocused(true);
  }, [messages.length]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (messages.length > 0) {
      return;
    }
    e.preventDefault();
    setIsFocused(false);
  }, [messages.length]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = () => {

    if (!selectedDealer?.id) {
     toast.error('No selected dealer');
      return;
    }

    sendMessage({
      role: 'user',
      parts: [
        ...attachments.map((attachment) => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: 'text',
          text: input,
        },
      ],
    });

    setAttachments([]);
    setInput('');
    setIsFocused(false); // Reset focus state after sending

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    setUploadQueue(files.map((file) => file.name));

    try {
      const uploadPromises = files.map((file) => uploadFile(file));
      const uploadedAttachments = await Promise.all(uploadPromises);
      const successfullyUploadedAttachments = uploadedAttachments.filter(
        (attachment) => attachment !== undefined,
      );

      setAttachments((currentAttachments) => [
        ...currentAttachments,
        ...successfullyUploadedAttachments,
      ]);
    } catch (error) {
      console.error('Error uploading files!', error);
    } finally {
      setUploadQueue([]);
    }
  };



  // useEffect(() => {
  //   if (thinking ) {
  //     scrollToBottom();
  //   }
  // }, [thinking, scrollToBottom]);

  const bottomReached = useMemo(() => isAtBottom, [isAtBottom]);

return (
  <div className='w-full space-y-3'>
    {/* Add the pulsing gradient border wrapper */}
    <div className="relative">
      {/* Pulsing Gradient Border - Show when NOT focused */}
      <div className={cn(
        "absolute inset-0 rounded-3xl p-0.5 transition-all duration-300",
        "bg-gradient-to-r from-orange-500 via-yellow-400 via-emerald-400 via-cyan-400 to-purple-500",
        !isFocused ? 'opacity-100 animate-pulse-gradient shadow-gradient' : 'opacity-0'
      )}>
      </div>

      {/* Focused Pulsing Gradient Border - Show when IS focused */}
      <div className={cn(
        "absolute inset-0 rounded-3xl p-0.5 transition-all duration-300",
        "bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-cyan-400 to-blue-500",
        isFocused ? 'opacity-100 animate-pulse-gradient shadow-gradient' : 'opacity-0'
      )}>
      </div>
      
      {/* Your Original Container - Modified */}
      <div className={cn(
        "w-full relative flex flex-col gap-4 transition-all duration-300",
        isFocused && 'z-[2000] rounded-3xl overflow-hidden bg-sidebar shadow-2xl shadow-blue-500/20',
        !isFocused && 'rounded-3xl' // Keep rounded when not focused
      )}
    
      >

        <AnimatePresence>
          {!isAtBottom && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute left-1/2 bottom-28 -translate-x-1/2 pb-9 z-50"
            >
              <Button
                data-testid="scroll-to-bottom-button"
                className="rounded-full bg-btn"
                size="icon"
                variant="outline"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToBottom();
                }}
              >
                <ArrowDown className='text-sidebar' />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated container for the textarea */}
        <motion.div
          animate={{
            height: 'auto',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="relative w-full overflow-hidden"
        >
          <Textarea
            data-testid="multimodal-input"
            ref={textareaRef}
            placeholder="Ask a question..."
            value={input}
            onChange={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cx(
              'min-h-[100px] placeholder:text-btn w-full max-h-[40vh] p-5 outline-none text-btn focus-visible:outline-none bg-inherit focus-visible:ring-transparent resize-none !text-base transition-all duration-300 ease-in-out',
              !isFocused ? 'rounded-3xl border-none overflow-hidden bg-sidebar' : 'rounded-none border-none',
              className,
            )}
            rows={4}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();

                if (status !== 'ready') {
                  toast.error('Please wait for the model to finish its response!');
                } else {
                  submitForm();
                }
              }
            }}
            style={{
              transition: 'height 0.2s ease-in-out, min-height 0.2s ease-in-out',
            }}
          />

          <div className="absolute bottom-2 right-2">
            <SendButton
              input={input}
              submitForm={submitForm}
              uploadQueue={uploadQueue}
            />
          </div>
        </motion.div>

        {isFocused && messages.length === 0 && (
          <div className='px-3 pb-4'>
            <Separator className='mx-3'/>
            {showGradient && (
              <div>
                <SuggestionsInnerComponent handleClick={(suggestion, index) => {
                  sendMessage({
                    role: 'user',
                    parts: [{ type: 'text', text: suggestion }],
                  });
                }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {!isFocused && showGradient && (
      <SuggestedActions
        sendMessage={(suggestion) => {
          setInput(suggestion);
          textareaRef.current?.focus();
        }}
        chatId={chatId!}
        selectedVisibilityType={selectedVisibilityType}
      />
    )}
  </div>
);

// CSS to add to your global styles:
/*
@keyframes pulse-gradient {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(255, 165, 0, 0.2));
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
    filter: drop-shadow(0 0 12px rgba(255, 165, 0, 0.3));
  }
}

.animate-pulse-gradient {
  animation: pulse-gradient 2s ease-in-out infinite;
}

.shadow-gradient {
  filter: drop-shadow(0 0 8px rgba(255, 165, 0, 0.15));
}
*/




}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    for (let i = 0; i < prevProps.messages.length; i++) {
      if (!equal(prevProps.messages[i], nextProps.messages[i])) return false;
    }
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-full p-2 h-fit bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 hover:dark:bg-zinc-700 border-0"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
      size="sm"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  const { selectedDealer } = useDealerStore();
  return (
    <Button
      data-testid="send-button"
      className="rounded-full cursor-pointer p-1.5 h-fit bg-btn text-sidebar border border-zinc-600"
      onMouseDown={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0 || !selectedDealer?.id}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});