"use client";

import type { User } from '@/lib/auth';
import { redirect, useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useDealer, useDealerStore } from '@/stores/dealer-store';
import { ChevronDown } from 'lucide-react';
import { useSession, useSessionStore } from '@/stores/session-store';
import Logo from './Logo';
import { useMessagesStore } from '@/stores/messages-store';
import { setDealerIdServer } from '@/lib/auth-server';

export function AppSidebar() {
  const user = useSession();
    const [hydration, setHydration] = useState(false);
  
  
  // Fix hydration error: only show dynamic content after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { selectedDealer, dealers, isLoading, error, initializeForUser } = useDealer();

  useEffect(() => {
    if (user?.id) {
      initializeForUser(user.id);
    }
  }, [user?.id, initializeForUser]);


useEffect(() => {
  setHydration(true);
}, []);

  const clearMessages = useMessagesStore(state => state.clearMessages);
  const { setNewChatSessionId } = useSessionStore();

  
  const dealerName = useMemo(() => selectedDealer?.name, [selectedDealer]);


  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <Logo />
            </Link>

            <Button
              className="py-2 px-4 h-fit rounded-full w-fit text-sidebar hover:bg-btn bg-btn"
              onClick={(e) => {
                e.preventDefault();
                clearMessages();
                setNewChatSessionId(null);
               router.push('/chat');
              //  window.history.replaceState({}, '', `/chat`);
              }}
            >
              <PlusIcon />
              Start a new chat
            </Button>
          </div>
        </SidebarMenu>

       {hydration && <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={selectedDealer ? "secondary" : "outline"}
              className="w-full mt-4 flex justify-between items-center"
              disabled={isLoading}
            >
              <span className="truncate">
                {isLoading 
                  ? "Loading dealers..." 
                  : (dealerName || "Select a dealer")
                }
              </span>
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
            {error ? (
              <DropdownMenuItem disabled className="text-red-500">
                Failed to load dealers
              </DropdownMenuItem>
            ) : dealers?.length === 0 ? (
              <DropdownMenuItem disabled>
                No dealers available
              </DropdownMenuItem>
            ) : (
              (Array.isArray(dealers) ? dealers : []).map((dealer) => (
                <DropdownMenuItem
                  key={dealer.id}
                  onClick={async () => {
                    
                    useDealerStore.getState().setSelectedDealer(dealer);
                    await setDealerIdServer(dealer?.id!);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="truncate">{dealer.name}</span>
                    {selectedDealer?.id === dealer.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarHistory />
      </SidebarContent>
      
      {/* Uncomment when needed */}
      {/* <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter> */}
    </Sidebar>
  );
}