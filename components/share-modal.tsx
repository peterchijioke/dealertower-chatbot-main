'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Copy, Link as LinkIcon, Loader } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatTitle?: string;
}

export function ShareModal({ isOpen, onClose, chatId, chatTitle = 'Untitled Chat' }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  
  // Generate share URL
  const generateShareLink = async () => {
    setIsCreatingLink(true);
    try {
      const response = await fetch('/api/chat/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          title: chatTitle,
          messages: [], // In a real app, you'd pass the actual messages
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setShareUrl(data.shareUrl);
        toast.success('Share link created successfully!');
      } else {
      console.log(data.error || 'Failed to create share link')
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to create share link');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share public link to chat</DialogTitle>
          <DialogDescription>
            Your name, custom instructions, and any messages you add after sharing stay private.
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">This conversation may include personal information.</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Take a moment to check the content before sharing the link.</p>
            </div>
          </div>
        </div>

        {/* Share URL Section */}
        {!shareUrl ? (
          <Button
            onClick={generateShareLink}
            disabled={isCreatingLink}
            className="w-full  disabled:bg-slate-400"
          >
            {isCreatingLink ? (
              <>
                <Loader className='animate-spin text-white size-5' />
                Creating link...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Create link
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Generated URL Display */}
            <div className="flex items-center bg-muted rounded-lg px-3 py-2">
              <Input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="ml-2 h-auto p-1"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Copy Button */}
            <Button
              variant="secondary"
              onClick={copyToClipboard}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
