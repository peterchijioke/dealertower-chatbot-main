import { z } from 'zod';
import { type CoreMessage, type UIMessage } from 'ai';

// User and system types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Session {
  user: User;
  expires: string;
}

export interface Dealer {
  id: string;
  name: string;
  logo?: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  role: string;
  content: string;
  parts?: any[]; // For UIMessage compatibility
  createdAt: Date;
}

export interface Vote {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  kind?: 'text' | 'code' | 'image' | 'sheet';
  userId: string;
  createdAt: Date;
}

export interface Suggestion {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
}

// For backward compatibility
export type DBMessage = Message;

// Chat types
export type ChatRequestOptions = {
  data?: Record<string, string>;
};

export type ChatMessage = UIMessage & {
  id: string;
};

// Metadata types
export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

// Data types
export type DataPart = { type: 'append-message'; message: string };

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: any; // Placeholder for ArtifactKind
  clear: null;
  finish: null;
};

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}

// WebSocket Chat Types
export type GPTMessageType = "processing" | "response" | "error";

// State payloads
export type GPTProcessing = {
  type: "processing";
  sessionId: string;           // str(session_id)
  reply: string;               // e.g. "<assistant> has been started..."
  event?: string;              // e.g. "handoff_occurred"
};

export type GPTResponse = {
  type: "response";
  sessionId: string;
  reply: string;               // final answer
  title?: string;              // optional session/title
};

export type GPTError = {
  type: "error";
  sessionId: string;
  reply: string;               // user-friendly error text
  event?: string;              // e.g. "processing_failed"
  code?: string;               // optional machine code
  retryable?: boolean;         // UI can show a retry button
};


export type MessageEvent =
  | "tool_called"
  | "tool_output"
  | "handoff_requested"
  | "handoff_occured"
  | "reasoning_item_created"
  | "message_output_created"
  | "error_message";

export enum WsReplyType {
  SessionInfo = "session_info",
  Message = "message",
  Ping = "ping",
}




     export type ChatMessageHistory = {
  reply_type: "message";
  role: "user" | "assistant";
  message_event: MessageEvent;
  message_content: string; // JSON string
};

export type WsReply =
  {
      reply_type: WsReplyType;
      session_id?: string | null;
      session_title?: string | null;
      message_event: MessageEvent | null;
      message_content: string | null;
    }
  

// Union type for switching
export type GPTMessage = WsReply

// Type guards (handy in reducers/components)
export const isProcessing = (m: GPTMessage) => m.reply_type === WsReplyType.Ping;
export const isResponse   = (m: GPTMessage): boolean => m.reply_type === WsReplyType.Message;
export const isError      = (m: GPTMessage): boolean => false
