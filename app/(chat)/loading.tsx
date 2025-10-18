import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="p-4 mx-auto space-y-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-10 w-3/4" />
    </div>
  );
}