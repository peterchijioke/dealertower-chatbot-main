'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';
import { Package, Tag, Users, Building2, Settings, Code } from 'lucide-react';
import { toast } from 'sonner';

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: (message: string) => void;
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Inventory',
    },
    {
      icon: <Tag className="w-6 h-6" />,
      title: 'Specials',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Leads',
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Dealer Info',
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'VLP Settings',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'External Scripts',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className=" hidden md:flex flex-row justify-center  flex-wrap gap-3 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            delay: 0.1 * index,
            duration: 0.5,
            ease: "easeOut"
          }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 3 ? 'hidden lg:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async (e) => {
              e.preventDefault();
              sendMessage(suggestedAction.title );
            }}
            className="text-left border rounded-full px-5 py-2 text-sm flex-1 gap-3 flex-row w-fit h-auto justify-start items-center  backdrop-blur-sm text-white bg-[#262d31] group transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-white group-hover:text-blue-300 transition-colors flex-shrink-0">
              {suggestedAction.icon}
            </div>
            <span className="font-semibold text-sm">{suggestedAction.title}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);