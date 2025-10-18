import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from './icons';
import { memo, useState } from 'react';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { ShareModal } from './share-modal';
import { useSessionStore } from '@/stores/session-store';
import { useMessagesStore } from '@/stores/messages-store';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: {
    id: string;
    title: string;
   
  };
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { setNewChatSessionId } = useSessionStore();
   const clearMessages = useMessagesStore(state => state.setMessages);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className=' text-white bg-inherit hover:bg-[#2d343a] hover:text-white'>
        <Link href={`/chat/${chat.id}`} onClick={() => {
          setNewChatSessionId(chat.id);
          clearMessages([]);
          setOpenMobile(false);
        }}>
          <span className={cn(isActive?" text-sidebar":' text-white')}>{chat.title}</span>
        </Link>

      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon  />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
        

          <DropdownMenuItem
            onSelect={() => setShareModalOpen(true)}
            className="cursor-pointer"
          >
            <ShareIcon />
            <span>Share</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)}
        chatId={chat.id}
      />
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});
