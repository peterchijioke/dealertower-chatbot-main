import React from 'react';
import { Chat } from '@/components/chat';
import { getAuthTokenServer } from '@/lib/auth-server';
import LoadingFallback from './LoadingFallback';

export const dynamic = 'force-dynamic';
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
const token = await getAuthTokenServer();
 if (!token) {
      return null
    }
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Chat
        id={id}
        initialVisibilityType="private"
        isReadonly={false}  
      />
    </React.Suspense>
  );
}
