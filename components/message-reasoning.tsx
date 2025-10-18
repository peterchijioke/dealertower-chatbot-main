'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from './markdown';
import { MoreHorizontal } from 'lucide-react';
import { BeatLoader } from "react-spinners";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div className="flex flex-col gap-1 text-white">
    {isLoading&& <BeatLoader
        color={'white'}
        loading={true}
        size={10}
        aria-label="Loading Spinner"
        data-testid="loader"
      />}
      <Markdown>{reasoning}</Markdown>
    </div>
  );
}
