// Placeholder schema file - database functionality removed
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};

export type Dealer = {
  id: string;
  name: string;
  logo?: string;
  isActive: boolean;
};

export type Message = {
  id: string;
  chatId: string;
  role: string;
  content: string;
  createdAt: Date;
};

export type Vote = {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
};

export type Document = {
  id: string;
  title: string;
  content?: string;
  userId: string;
  createdAt: Date;
};

export type Suggestion = {
  id: string;
  documentId: string;
  originalText: string;
  suggestedText: string;
  description?: string;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
};

// For backward compatibility
export type DBMessage = Message;
