'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/auth';

export interface Session {
  user: User;
  expires: string;
}

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface SessionState {
  session: User | null;
  newSessionId: string | null;
  isInitialized: boolean;
  mounted: boolean;
  socketStatus: SocketStatus;
}

interface SessionActions {
  setSession: (user: User | null) => void;
  updateSession: (updates: Partial<User>) => void;
  clearSession: () => void;
  clearAllSessionData: () => void;
  setMounted: (mounted: boolean) => void;
  initializeSession: (initialSession: User | null) => void;
  setNewChatSessionId: (newChatSessionId: string | null) => void;
  setSocketStatus: (status: SocketStatus) => void;
}

type SessionStore = SessionState & SessionActions;

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // State
      session: null,
      newSessionId: null,
      isInitialized: false,
      socketStatus: 'disconnected',
      mounted: false,

      // Actions
      setSession: (user: User | null) => {
        set({ session: user, isInitialized: true });
      },

      updateSession: (updates: Partial<User>) => {
        const current = get().session;
        if (current) {
          set({ session: { ...current, ...updates } });
        }
      },

      clearSession: () => {
        set({ session: null, isInitialized: true });
      },

      clearAllSessionData: () => {
        set({
          session: null,
          newSessionId: null,
          mounted: false,
          isInitialized: true,
          socketStatus: 'disconnected', // always reset to disconnected
        });
      },

      setNewChatSessionId: (newChatSessionId: string | null) => {
        set({ newSessionId: newChatSessionId });
      },
 setMounted: (mounted: boolean) => 
        set({ 
          mounted,
        }),
      initializeSession: (initialSession: User | null) => {
        if (!get().isInitialized) {
          set({ session: initialSession, isInitialized: true });
        }
      },

      setSocketStatus: (status: SocketStatus) => set({ socketStatus: status }),
    }),
    {
      name: 'dealertower-session',
      partialize: (state) => ({
        session: state.session,
        // ⚠️ newSessionId and socketStatus are not persisted
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
          // Reset non-persisted values to their defaults
          state.newSessionId = null;
          state.socketStatus = 'disconnected';
        }
      },
      version: 1,
    }
  )
);

// Selectors
export const useSession = () => useSessionStore((s) => s.session);
export const useIsSessionInitialized = () => useSessionStore((s) => s.isInitialized);
export const useSocketStatus = () => useSessionStore((s) => s.socketStatus);

// Action hooks
export const useSessionActions = () => {
  const setSession = useSessionStore((s) => s.setSession);
  const updateSession = useSessionStore((s) => s.updateSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const clearAllSessionData = useSessionStore((s) => s.clearAllSessionData);
  const initializeSession = useSessionStore((s) => s.initializeSession);
  const setNewChatSessionId = useSessionStore((s) => s.setNewChatSessionId);
  const setSocketStatus = useSessionStore((s) => s.setSocketStatus);

  return {
    setSession,
    updateSession,
    clearSession,
    clearAllSessionData,
    initializeSession,
    setNewChatSessionId,
    setSocketStatus,
  };
};