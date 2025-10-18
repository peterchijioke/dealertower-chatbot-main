import { ChatSessionResponse, getChatSessions } from '@/lib/auth';
import { useChatSessionsStore } from '@/stores/chat-sessions-store';
import { useDealerStore } from '@/stores/dealer-store';
import { useState, useCallback, useEffect } from 'react';


export const useFetchChatSessions = (selectedDealerId: string | undefined) => {
  
  // Chat sessions store
  const {chatSessions,setChatSessions} = useChatSessionsStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchChatSessions = useCallback(async () => {
    if (!selectedDealerId) {
      return;
    }
    setIsLoading(true);
    try {
      const sessions = await getChatSessions(selectedDealerId);
      if (Array.isArray(sessions)) {
        const transformedSessions: ChatSessionResponse[] = sessions.map(session => ({
          id: session.id,
          title: session.title,
        }));
        setChatSessions(transformedSessions);
      } else {
        setChatSessions([]);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [selectedDealerId, setChatSessions, getChatSessions]);
  useEffect(() => {
    fetchChatSessions();
  }, [fetchChatSessions, selectedDealerId]);


  const getMoreSessionListIfNewChat = useCallback((sessionId: string | null) => {
    if (!sessionId) return;
    if (chatSessions.findIndex(session => session.id === sessionId) === -1) {
      fetchChatSessions();
    }
  }, [fetchChatSessions, chatSessions]);

  return { fetchChatSessions, isLoading, chatSessions, getMoreSessionListIfNewChat };
};