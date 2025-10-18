'use client';
import { useState, useEffect, useCallback, useRef, useMemo, use } from "react";
import { useMessagesStore } from '@/stores/messages-store';
import { ChatHeader } from '@/components/chat-header';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage, ChatMessageHistory, GPTMessage } from '@/lib/types';
import { isError, isResponse } from '@/lib/types';
import { useDealer } from '@/stores/dealer-store';
import { useSimpleWebSocket } from '@/hooks/use-chat-websocket';
import { getSessionHistory } from '@/lib/auth-server';
import { cn, convertToUIMessages, getUUID } from '@/lib/utils';
import { useSessionStore, useSocketStatus } from '@/stores/session-store';
import { useParams } from "next/navigation";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import AnimatedGradient from "./AnimatedGradient";
import { useFetchChatSessions } from "@/hooks/useFetchChatSessions";


type HandoffOrToolEvent =
  | 'handoff_occured'
  | 'handoff_requested'
  | 'tool_output'
  | 'tool_called'
  | 'reasoning_item_created'

const HANDOFF_OR_TOOL_EVENTS: HandoffOrToolEvent[] = [
  'handoff_occured',
  'handoff_requested',
  'tool_output',
  'tool_called',
  'reasoning_item_created'
];
type ChatProps = {
  id: string;
  initialVisibilityType?: VisibilityType;
  isReadonly?: boolean;
};

export type UserMessageToSocket = {
  session_id?: string;
  message_content: string;
};

export function Chat({
  id,
  initialVisibilityType = 'private',
  isReadonly = false,
}: ChatProps) {
const { selectedDealer } = useDealer();
const { setNewChatSessionId, newSessionId: initSessionId } = useSessionStore();
const { getMoreSessionListIfNewChat } = useFetchChatSessions(selectedDealer?.id);
  // Core UI state
  const [input, setInput] = useState<string>('');
  const messages = useMessagesStore(state => state.messages);
  const setMessages = useMessagesStore(state => state.setMessages);
  const addMessage = useMessagesStore(state => state.addMessage);
  const [attachments, setAttachments] = useState<Array<any>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState<ChatMessage>();
  const [isLoading, setIsLoading] = useState(false);

  // Refs for non-render-driving snapshots
  const inputRef = useRef(input);
  inputRef.current = input;

  const visibilityType = initialVisibilityType; // no need for useMemo
  const votes: any[] = [];                      // no need for useMemo
  const isArtifactVisible = true;               // constant


  const dealerId = selectedDealer?.id ?? null;
const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  // --- Fetch session history (only when dealerId + id available) ---
  const fetchMessages = useCallback(async () => {
    
    if (!dealerId || !id) return;
    // setIsFetchingMessages(true);

    try {
      const fetched = await getSessionHistory({
        session_id: id,
        dealerId,
      });
      if (Array.isArray(fetched)) {
        const converted = convertToUIMessages(fetched);
        setMessages(converted);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      // setIsFetchingMessages(false);
    }
  }, [id, dealerId, setMessages]);

  useEffect(() => {
   if (id || initSessionId) {
     fetchMessages();
   }
  }, [id, fetchMessages]);
const handleWebSocketMessage = useCallback((gptMessage: GPTMessage) => {
  // Handle error messages first
  if (gptMessage?.message_event === 'error_message') {
    setIsLoading(false);
    setIsThinking(false);
    setThinkingMessage(undefined);
    return; // Early return to prevent further processing
  }

  // Update session info
  getMoreSessionListIfNewChat(gptMessage.session_id as any);
  setNewChatSessionId(gptMessage.session_id || null);

  switch (gptMessage?.reply_type) {
    case 'session_info': {
      if (gptMessage.session_id) {
        useSessionStore.getState().setNewChatSessionId(gptMessage.session_id ?? null);
        window.history.replaceState({}, '', `/chat/${gptMessage.session_id}`);
      }
      break;
    }
    
    case 'message': {
      const { message_content, message_event } = gptMessage as any;
      
      // Handle thinking/reasoning states
      if (HANDOFF_OR_TOOL_EVENTS.includes(message_event)) {
        setIsLoading(false);
        setIsThinking(true);
        setThinkingMessage({
          id: getUUID(),
          role: 'assistant',
          parts: [{ type: 'reasoning', text: message_content }],
          metadata: { createdAt: new Date().toISOString(), gptType: gptMessage.reply_type },
        });
        return; // Early return - don't add to messages yet
      } 
      
      // Handle final message output
      if (message_event === 'message_output_created' && message_content) {
        setIsLoading(false);
        setIsThinking(false);
        setThinkingMessage(undefined);
        
        // Add the actual message
        addMessage({
          id: getUUID(),
          role: 'assistant',
          parts: [{ type: 'text', text: message_content }],
          metadata: { createdAt: new Date().toISOString(), gptType: gptMessage.reply_type },
        });
        return; // Early return - message handled
      }
      break;
    }
    
    case 'ping':
      return; // Don't process ping messages further
    
    default:
      break;
  }

  // Only process remaining messages that haven't been handled above
  // Remove the duplicate message_output_created check since it's handled above
  
  // Handle other message types (errors, etc.)
  if (isError(gptMessage)) {
    const errorText = `Error: ${gptMessage.reply_type}`;
    addMessage({
      id: `ws-error-${Date.now()}`,
      role: 'assistant',
      parts: [{ type: 'text', text: errorText }],
      metadata: { createdAt: new Date().toISOString(), gptType: gptMessage.reply_type },
    });
  } else if (isResponse(gptMessage) && gptMessage.reply_type !== 'message') {
    // Handle other response types that aren't regular messages
    let messageText = '';
    if ('message_content' in gptMessage && gptMessage.message_content) {
      messageText = String(gptMessage.message_content);
    } else if ('session_title' in gptMessage && gptMessage.session_title) {
      messageText = `Session: ${gptMessage.session_title}`;
    } else {
      messageText = 'Unknown message.';
    }
    
    if (messageText && messageText !== 'Unknown message.') {
      addMessage({
        id: `ws-${Date.now()}`,
        role: 'assistant',
        parts: [{ type: 'text', text: messageText }],
        metadata: { createdAt: new Date().toISOString(), gptType: gptMessage.reply_type },
      });
    }
  }
}, [addMessage, setNewChatSessionId, getMoreSessionListIfNewChat]);

  const handleWebSocketError = useCallback((error: Event) => {
    console.log('WebSocket error Instance:', error);
  }, []);

  const wsOptions = useMemo(() => ({
    dealerId: dealerId!, 
    onMessage: (msg: unknown) => {
      const gptMsg = msg as GPTMessage;
      handleWebSocketMessage(gptMsg);
    },
    onError: (err: Event) => {
      handleWebSocketError(err);
    }
  }), [dealerId, handleWebSocketMessage, handleWebSocketError]);

  const {
    status: wsStatus,
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendMessage: sendWsMessage
  } = useSimpleWebSocket(wsOptions);

  const status = wsStatus === 'connecting' ? 'streaming' : 'ready';



  useEffect(() => {
    if (!dealerId) return;
    if (!isConnected && wsStatus === 'disconnected') {
      connect();
    }
  
  }, [dealerId]);

  useEffect(() => {
    // Removed disconnect on unmount to prevent unnecessary disconnect/reconnect cycles
    return undefined;
  }, []);

  useEffect(() => {
    if (wsStatus === 'error') {
      // e.g. refresh token & reconnect if desired
    }
  }, [wsStatus]);

  const stop = useCallback(async () => {
    /* no-op for now */
  }, []);

  const regenerate = useCallback(async (_options?: unknown) => {
    /* no-op for now */
  }, []);
  // --- Send message over WS (stable deps only) ---
  const sendMessage = useCallback(
    async (message: any, _options?: any) => {
      if (!isConnected) {
        return;
      }



      interface MessagePart { type: string; text?: string; [k: string]: any; }
      interface UserMessage { parts: MessagePart[]; [k: string]: any; }

      const outboundText =
        Array.isArray((message as UserMessage).parts)
          ? (message as UserMessage).parts
              .map((p: MessagePart) => (typeof p.text === 'string' ? p.text : ''))
              .filter(Boolean)
              .join(' ')
          : '';

      addMessage(message);
    setIsLoading(true);

      const currentInput = inputRef.current;

      try {
        if (initSessionId) {
          const content = outboundText.trim().length > 0 ? outboundText : currentInput.trim();
          if (content) {
            const payload: UserMessageToSocket = { session_id: initSessionId as string, message_content: content };
            sendWsMessage(payload);
          }
          setInput('');
          return;
        }

        const content = outboundText.trim().length > 0 ? outboundText : currentInput.trim();
        if (content) {
          sendWsMessage({ message_content: content });
        }
      } catch (error) {
        console.error('Failed to send WS message:', error);
      }
      setInput('');
    },
    [id, initSessionId, addMessage, sendWsMessage, isConnected]
  );

  // Stable setMessages handler: pass functional updater through when possible
  const handleSetMessages = useCallback((updater: any) => {
    if (typeof updater === 'function') {
      const currentMessages = useMessagesStore.getState().messages;
      setMessages(updater(currentMessages));
    } else {
      setMessages(updater);
    }
  }, []);

  const { containerRef, endRef, scrollToBottom, onViewportEnter, onViewportLeave, isAtBottom, hasSentMessage, autoScrollToBottom } = useScrollToBottom(id);

  const showGradient = messages.length === 0 && !initSessionId && !isThinking && !isLoading;
  return (
    <AnimatedGradient>
    <div
      className={cn(
        "flex flex-col min-w-0 h-dvh w-full",
        !showGradient 
          ? "bg-background"
          : "bg-inherit"
      )}
    >
      <ChatHeader chatId={id} />



      <Messages
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
        thinkingMessage={thinkingMessage}
        hasSentMessage={hasSentMessage}
        thinking={isThinking}
        chatId={id || initSessionId as string}
        isFetchingMessages={isFetchingMessages}
        status={status}
        votes={votes}
        containerRef={containerRef}
        autoScrollToBottom={autoScrollToBottom}
        endRef={endRef}
        isLoading={isLoading}
        messages={messages}
        setMessages={handleSetMessages}
        regenerate={regenerate}
        isReadonly={isReadonly}
        isArtifactVisible={isArtifactVisible}
        sendMessage={sendMessage}
        selectedVisibilityType={visibilityType}
      />

      <form className="flex mx-auto px-4 bg-inherit pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        {!isReadonly && (
          <MultimodalInput

            chatId={id || initSessionId as string}
            showGradient={showGradient}
            input={input}
            setInput={setInput}
            scrollToBottom={scrollToBottom}
            isAtBottom={isAtBottom}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={handleSetMessages}
            sendMessage={sendMessage}
            selectedVisibilityType={visibilityType}
          />
        )}
      </form>
    </div>
     </AnimatedGradient>
  );
}
