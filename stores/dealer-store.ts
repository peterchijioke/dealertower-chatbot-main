'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Dealer } from '@/lib/types';

interface DealerStore {
  selectedDealer: Dealer | null;
  setSelectedDealer: (dealer: Dealer | null) => void;
  setDealers: (dealers: Dealer[]) => void;
  clearSelectedDealer: () => void;
  clearAllUserData: () => void;
  clearAllClientData: () => Promise<void>;
  isDealerSelected: boolean;
  dealers: Dealer[];
  isLoading: boolean;
  error: string | null;
  initializeForUser: (userId: string) => void;
  currentUserId: string | null;
}

export const useDealerStore = create<DealerStore>()(
  persist(
    (set, get) => ({
      selectedDealer: null,
      isDealerSelected: false,
      dealers: [],
      isLoading: false,
      error: null,
      currentUserId: null,
      mounted: false,

      setSelectedDealer: (dealer) => 
        set({ 
          selectedDealer: dealer,
          isDealerSelected: Boolean(dealer)
        }),
      setDealers: (dealers: Dealer[]) => 
        set({ 
          dealers,
        }),
     

      clearSelectedDealer: () => 
        set({ 
          selectedDealer: null,
          isDealerSelected: false
        }),

      clearAllUserData: () =>
        set({
          selectedDealer: null,
          isDealerSelected: false,
          dealers: [],
          currentUserId: null,
          error: null,
          isLoading: false
        }),

      clearAllClientData: async () => {
        // Clear all state
        set({
          selectedDealer: null,
          isDealerSelected: false,
          dealers: [],
          currentUserId: null,
          error: null,
          isLoading: false
        });
        
        // Clear persisted data from localStorage
        try {
          localStorage.removeItem('dealertower-dealer-selection');
        } catch (error) {
          console.error('Failed to clear localStorage:', error);
        }
      },

      initializeForUser: (userId) => {
        const currentUserId = get().currentUserId;
        if (currentUserId !== userId) {
          // Different user, clear dealer selection but keep dealers
          set({ 
            selectedDealer: null,
            isDealerSelected: false,
            currentUserId: userId,
            error: null
          });
        } else {
          // Same user, just update currentUserId if needed
          set({ currentUserId: userId });
        }
      },

    

     
    }),
    {
      name: 'dealertower-dealer-selection',
      storage: createJSONStorage(() => localStorage), // Explicitly specify localStorage
      partialize: (state) => ({
        selectedDealer: state.selectedDealer,
        isDealerSelected: state.isDealerSelected,
        dealers: state.dealers,
        currentUserId: state.currentUserId,
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure isDealerSelected is computed correctly when rehydrating
        if (state) {
          state.isDealerSelected = Boolean(state.selectedDealer);
        }
      },
      // Add version for migration support if needed in the future
      version: 1,
      // Handle migration errors gracefully
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 to 1 if needed
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

// Export a custom hook that matches the previous API
export const useDealer = () => {
  const store = useDealerStore.getState();

  return {
    selectedDealer: store.selectedDealer,
    setSelectedDealer: store.setSelectedDealer,
    clearSelectedDealer: store.clearSelectedDealer,
    clearAllUserData: store.clearAllUserData,
    clearAllClientData: store.clearAllClientData,
    isDealerSelected: store.isDealerSelected,
    dealers: store.dealers,
    isLoading: store.isLoading,
    error: store.error,
 
    initializeForUser: store.initializeForUser,
    currentUserId: store.currentUserId,
  };
};