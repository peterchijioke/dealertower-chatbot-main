'use client';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { logout, User } from '@/lib/auth';
import { Dealer } from '@/lib/types';
import { useDealerStore } from '@/stores/dealer-store';
import { useSessionActions, useSessionStore } from '@/stores/session-store';
import { useEffect, useState } from 'react';
import { handleLogout } from '../actions/logout';
import { DealerSelectionOverlay } from '@/components/dealer-selection-overlay';
import { getUserAndDealersImproved, logoutAction } from '@/lib/auth-server';
import { redirect } from 'next/navigation';


interface ChatLayoutClientProps {
  children: React.ReactNode;
  // user: any
  // dealerResponses: Dealer[];
}


export function ChatLayoutClient({ 
  children,

}: ChatLayoutClientProps) {

  const { setSession } = useSessionActions();
  const { mounted } = useSessionStore();
  const { setDealers ,selectedDealer} = useDealerStore();
  const [state,setState] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps



  useEffect(() => {
    setState(true);
   getUserAndDealersImproved().then(async({ user, dealerResponses }) => {
     setSession(user?.data);
     setDealers(dealerResponses);
   }).catch(async (error) => {
    console.log('Error fetching user and dealers:', error);
    if(error.message === 'Unauthorized'){
     await logoutAction();
   }
  });
  }, []);
if(!state){
return null;
}
  return (
    <>
         {!selectedDealer?.id && !mounted && <DealerSelectionOverlay />}

      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
