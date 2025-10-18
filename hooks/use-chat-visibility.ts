'use client';

import { useMemo, useState } from 'react';
import type { VisibilityType } from '@/components/visibility-selector';

export function useChatVisibility({
  chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
}) {
  // Use simple state instead of SWR to avoid infinite loops
  const [localVisibility, setLocalVisibility] = useState<VisibilityType>(initialVisibilityType);

  const visibilityType = useMemo(() => {
    return localVisibility || initialVisibilityType;
  }, [localVisibility, initialVisibilityType]);

  const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
    setLocalVisibility(updatedVisibilityType);
    
    // Dummy update function - no API calls
    console.log('Visibility updated:', { chatId, visibility: updatedVisibilityType });
  };

  return { visibilityType, setVisibilityType };
}
