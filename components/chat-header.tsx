'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { use, useState } from 'react';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import { clearAllClientData, logout, type User } from '@/lib/auth';
import { ShareModal } from './share-modal';
import { useSessionStore } from '@/stores/session-store';
import { toast } from 'sonner';
import { useMessagesStore } from '@/stores/messages-store';

function PureChatHeader({
  chatId,
}: {
  chatId: string;

}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const { session } = useSessionStore();

  return (
    <header className="flex sticky top-0 bg-inherit py-1.5 items-center px-2 md:px-2 gap-2">
      <div className='md:hidden flex w-fit text-white'><SidebarToggle /></div>

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2  aspect-square  text-white md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/chat');
              }}
            >
              <PlusIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {/* {!isReadonly && (
        <ModelSelector
          user={user}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )} */}

      {/* {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )} */}

      {/* Share Button */}
      <div className="md:ml-auto flex justify-end flex-1">
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="hidden md:inline">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip> */}
        <DropdownMenu >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2   hover:bg-sidebar focus:outline-none focus:ring-2 focus:ring-primary h-fit rounded-full w-fit bg-sidebar      "
              id="user-menu-button"
            >
              <span className=" flex w-6 h-6 bg-gray-600 rounded-full items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="gray" />
                  <path d="M6 20c0-2 4-3 6-3s6 1 6 3" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              </span>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </DropdownMenuTrigger>
             <DropdownMenuContent className="w-56 p-3 space-y-4 rounded-2xl bg-[#2d343a]" align='end'>
            <DropdownMenuLabel className="flex focus:bg-background items-center gap-2   rounded-t-xl">
              <span className=" flex w-6 h-6 bg-gray-600 rounded-full items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="gray" />
                  <path d="M6 20c0-2 4-3 6-3s6 1 6 3" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              </span>
               <span className="font-bold text-white truncate">{session?.username}</span>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator /> */}
           
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem className="flex cursor-pointer rounded-md items-center gap-2 text-red-500 focus:bg-[#465159] focus:text-red-500" 
            onClick={logout}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
      </div>

      {/* Share Modal
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        chatId={chatId}
        chatTitle="Chat Conversation"
      /> */}

      <div></div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return true; // Always re-render to ensure latest props are used
});
