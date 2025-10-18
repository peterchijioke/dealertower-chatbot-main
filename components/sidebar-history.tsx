'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getChatSessions, type ChatSessionResponse } from '@/lib/auth';
import { useChatSessionsStore } from '@/stores/chat-sessions-store';
import { useDealerStore } from '@/stores/dealer-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChatItem } from './sidebar-history-item';
import { Loader, Loader2, MessageSquare } from 'lucide-react';
import { useSession, useSessionStore } from '@/stores/session-store';
import { Button } from './ui/button';
import { useFetchChatSessions } from '@/hooks/useFetchChatSessions';




export function SidebarHistory( ) {
  const [hydration, setHydration] = useState(false);
  const selectedDealer = useDealerStore((state) => state.selectedDealer);

  const { isLoading, chatSessions, fetchChatSessions} = useFetchChatSessions(selectedDealer?.id);
  const user = useSession();
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const router = useRouter();
  
  // Get selected dealer from store
 useEffect(() => {
   setHydration(true);
 }, []);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isValidating = isLoading;
  const hasReachedEnd = true;
  const hasEmptyChatHistory = chatSessions.length === 0 && !isLoading;

  const handleDelete = async () => {
    // Dummy delete function - just show success message
    toast.promise(
      Promise.resolve('Chat deleted successfully'),
      {
        loading: 'Deleting chat...',
        success: 'Chat deleted successfully',
        error: 'Failed to delete chat',
      }
    );
    setShowDeleteDialog(false);

    // if (deleteId === id) {
    //   router.push('/');
    // }
  };

  const handleRefresh = async () => {
    await fetchChatSessions();
  };

  if (!hydration) {
    return null; 
  }



  if (isLoading) {
    return (
      <SidebarGroup>
        
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-background"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  
  if (!selectedDealer) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="w-full flex flex-col  bg-[#faf9ff] rounded-2xl justify-center gap-4 p-4">
            <div className="flex flex-col gap-3">
              <div className="text-lg font-medium  text-zinc-800">No dealer selected</div>
              <div className="text-xs text-zinc-500 ">Once you select a dealer, you can access your recent chats here.</div>

            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-col justify-center items-center text-sm gap-2">
            <MessageSquare className="h-8 w-8 text-zinc-400" />
            <div className="text-center">
              <p className="font-medium">No chat history yet</p>
              <p className="text-xs text-muted-foreground">
                Start a conversation to see your chats here
              </p>
              <Button className='bg-btn text-background' disabled={isLoading} onClick={handleRefresh}>{isLoading ? <Loader2 className="mr-2 animate-spin size-4" /> : null }Refresh</Button>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

 

  return (
    <>
      <SidebarGroup>
        <SidebarGroup>
        <SidebarGroupContent>
          <div className=" py-3 font-bold text-white w-full text-base gap-2">
          History in <span className="text-zinc-400 text-xs">(Previous 7 days)</span>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {chatSessions.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === id}
                onDelete={(chatId) => {
                  setDeleteId(chatId);
                  setShowDeleteDialog(true);
                }}
                setOpenMobile={setOpenMobile}
              />
            ))}
          </SidebarMenu>

          <motion.div
          />
          {isValidating && (
            <div className="flex items-center justify-center py-4">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
