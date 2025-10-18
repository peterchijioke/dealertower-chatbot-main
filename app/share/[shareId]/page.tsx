import { notFound } from 'next/navigation';
import { Chat } from '@/components/chat';
import type { ChatMessage } from '@/lib/types';

// Mock function to get shared chat (in production, fetch from database)
async function getSharedChat(shareId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/chat/share?id=${shareId}`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.chat : null;
  } catch (error) {
    console.error('Error fetching shared chat:', error);
    return null;
  }
}

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const sharedChat = await getSharedChat(shareId);

  if (!sharedChat) {
    notFound();
  }

  // Convert messages to the format expected by Chat component
  const messages: ChatMessage[] = sharedChat.messages || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Shared Chat Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">Shared Chat</h1>
            <span className="text-sm text-muted-foreground">
              {sharedChat.title}
            </span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-xs text-muted-foreground">
              Shared on {new Date(sharedChat.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1">
        <Chat
          id={shareId}
          initialVisibilityType="public"
          isReadonly={true} // Shared chats are read-only
        />
      </div>

      {/* Footer */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 max-w-screen-2xl items-center justify-center">
          <p className="text-xs text-muted-foreground">
            This is a shared chat conversation. You cannot send messages.
          </p>
        </div>
      </div>
    </div>
  );
}
