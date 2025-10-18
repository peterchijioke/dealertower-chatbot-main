// API Route: /api/chat/share - Create shareable chat link
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Mock shared chats storage (in production, use database)
const sharedChats = new Map<string, {
  chatId: string;
  title: string;
  messages: any[];
  createdAt: Date;
  expiresAt?: Date;
  isPublic: boolean;
}>();

export async function POST(request: NextRequest) {
  try {
    const { chatId, title, messages } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Generate a unique share ID
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the shared chat (in production, save to database)
    sharedChats.set(shareId, {
      chatId,
      title: title || 'Untitled Chat',
      messages: messages || [],
      createdAt: new Date(),
      // Optional: set expiration date
      // expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isPublic: true,
    });

    // Generate the shareable URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const shareUrl = `${protocol}://${host}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      message: 'Chat shared successfully',
    });

  } catch (error) {
    console.error('Share chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get shared chat by ID
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const shareId = url.searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const sharedChat = sharedChats.get(shareId);
    
    if (!sharedChat) {
      return NextResponse.json(
        { success: false, error: 'Shared chat not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (sharedChat.expiresAt && sharedChat.expiresAt < new Date()) {
      sharedChats.delete(shareId);
      return NextResponse.json(
        { success: false, error: 'Shared chat has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      chat: {
        id: sharedChat.chatId,
        title: sharedChat.title,
        messages: sharedChat.messages,
        createdAt: sharedChat.createdAt,
        isPublic: sharedChat.isPublic,
      },
    });

  } catch (error) {
    console.error('Get shared chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
