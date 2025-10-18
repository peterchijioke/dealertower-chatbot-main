import { create } from 'zustand';
import type { ChatSessionResponse } from '@/lib/auth';

interface ChatSessionsStore {
  chatSessions: ChatSessionResponse[];
  setChatSessions: (sessions: ChatSessionResponse[]) => void;
  clearChatSessions: () => void;
}

export const useChatSessionsStore = create<ChatSessionsStore>((set) => ({
  chatSessions: [],
  setChatSessions: (sessions) => set({ chatSessions: sessions }),
  clearChatSessions: () => set({ chatSessions: [] }),
}));
