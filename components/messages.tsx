import { LoadingMessage, PreviewMessage, ThinkingMessage } from './message';
import { Greeting } from './greeting';
import { Fragment, memo } from 'react';
import { useEffect } from 'react';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { m, motion } from 'framer-motion';
import { useMessages } from '@/hooks/use-messages';
import type { ChatMessage } from '@/lib/types';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { cn } from '@/lib/utils';
import SuggestionsBaseChatComponent from './SuggestionsBaseChatComponent';
import { MessageLoading } from './MessageLoading';
import { th } from 'zod/v4/locales';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessagesProps {
  chatId: string;
  onViewportEnter: () => void;
  thinkingMessage: ChatMessage|undefined;
  onViewportLeave: () => void;
  status: UseChatHelpers<ChatMessage>['status'];
  votes: Array<any> | undefined;
  messages: ChatMessage[];
  sendMessage: (message: ChatMessage) => Promise<void>;
  thinking: boolean;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedVisibilityType?: any;
  autoScrollToBottom: () => void; 
  containerRef: React.RefObject<HTMLDivElement>;
  endRef: React.RefObject<HTMLDivElement>;
  hasSentMessage: boolean;
  isLoading: boolean;
  isFetchingMessages: boolean;
}

function PureMessages({
  chatId,
  status,
  isFetchingMessages,
  thinkingMessage,
  votes,
  messages,
  thinking,
  isLoading,
  setMessages,
  regenerate,
  onViewportEnter,
  onViewportLeave,
  isReadonly,
  autoScrollToBottom,
  containerRef,
  hasSentMessage,
  sendMessage,
  endRef,
  selectedVisibilityType,
}: MessagesProps) {


  // useEffect(() => {
  //   if (messages.length > 0) {
  //     autoScrollToBottom();
  //   }
  // }, [messages, autoScrollToBottom]);

  const isMobile=useIsMobile()

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col min-w-0 gap-6  overflow-y-scroll pt-4 relative",messages.length>0 ||chatId?
        "flex-1":""
      )}
    >
    {
      isFetchingMessages  ? (
       <LoadingMessage />
      ) : (
        <Fragment>
          {messages.length === 0 && !chatId && (
            <Greeting
              chatId={chatId}
          sendMessage={sendMessage}
          selectedVisibilityType={selectedVisibilityType}
        />
      )}

      {messages.map((message, index) => (
        <PreviewMessage
          key={`${message.id}+${index}`}
          chatId={chatId}
          message={message}
          isLoading={isLoading}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          isReadonly={isReadonly}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}
       {
        !thinking&&!isLoading&&messages.length > 0 && (<SuggestionsBaseChatComponent  handleClick={
            (suggestion, index) => {
              sendMessage({
                id: `${Date.now()}-${Math.random()}`,
                role: 'user',
                parts: [{ type: 'text', text: suggestion }],
              });
            }
          }/>
        )}
        {thinking && thinkingMessage  && <ThinkingMessage isLoading={thinking} message={thinkingMessage} />}

      {isLoading && <LoadingMessage />}

    <motion.div
        ref={endRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        aria-hidden="true"
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
      />
    </Fragment>
      )
    }
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return equal(prevProps, nextProps);
});
