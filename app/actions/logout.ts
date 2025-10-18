import { clearAllClientData } from '@/lib/auth';
import { useSessionStore } from '@/stores/session-store';
import { redirect } from 'next/navigation'
import { use } from 'react';
import { toast } from 'sonner';
export  function handleLogout() {
  () => {
    try {
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict";

    } catch (error) {
    }
    clearAllClientData();
    useSessionStore.getState().setNewChatSessionId(null);
    toast.success('Successfully signed out!', {
      position: 'top-right',
    });
    redirect('/login');
  }
}
             
