import { useRef, useEffect, useCallback, useState } from 'react';

type ScrollFlag = ScrollBehavior | false;

export function useScrollToBottom(chatId?: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [scrollBehavior, setScrollBehavior] = useState<ScrollFlag>(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  
  // Debug state to help identify issues
  const [debugInfo, setDebugInfo] = useState<any>({});

  // More robust bottom detection
 const checkIfAtBottom = useCallback(() => {
  if (!containerRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
  const scrollBottom = scrollTop + clientHeight;
  const distanceFromBottom = scrollHeight - scrollBottom;
  const threshold = 10;
  const atBottom = distanceFromBottom <= threshold;

  setDebugInfo({ scrollTop, scrollHeight, clientHeight, distanceFromBottom, atBottom });

  setIsAtBottom(prev => {
    if (prev !== atBottom) {
      return atBottom;
    }
    return prev;
  });
}, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      setScrollBehavior(behavior);
    },
    []
  );

  // Handle the actual scrolling
  useEffect(() => {
    if (scrollBehavior && endRef.current) {
      
      endRef.current.scrollIntoView({ 
        behavior: scrollBehavior,
        block: 'end',
        inline: 'nearest'
      });
      
      setScrollBehavior(false);
      
      // Check status after scroll completes
      const timeoutId = setTimeout(() => {
        checkIfAtBottom();
      }, scrollBehavior === 'smooth' ? 300 : 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [scrollBehavior, checkIfAtBottom]);

  // Handle chat changes
  useEffect(() => {
    if (chatId) {
      console.log(`💬 Chat changed to: ${chatId}`);
      scrollToBottom('instant');
      setHasSentMessage(false);
      setIsAtBottom(true);
    }
  }, [chatId, scrollToBottom]);

  // Set up scroll listeners with multiple event types
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }


    // Multiple scroll events for better coverage
    const events = ['scroll', 'scrollend', 'wheel', 'touchmove'];
    
    const handleScroll = () => {
      checkIfAtBottom();
    };

    // Add all scroll-related event listeners
    events.forEach(event => {
      container.addEventListener(event, handleScroll, { passive: true });
    });

    // ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(() => {
      checkIfAtBottom();
    });
    resizeObserver.observe(container);

    // MutationObserver for DOM changes (new messages)
    const mutationObserver = new MutationObserver(() => {
      // Small delay to let DOM settle
      setTimeout(checkIfAtBottom, 100);
    });
    
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: false
    });

    // Initial check
    checkIfAtBottom();

    // Cleanup
    return () => {
      events.forEach(event => {
        container.removeEventListener(event, handleScroll);
      });
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [checkIfAtBottom]);

  // Auto-scroll when new messages arrive (if user is at bottom)
  const autoScrollToBottom = useCallback(() => {
    if (isAtBottom) {
      scrollToBottom('smooth');
    } else {
    }
  }, [isAtBottom, scrollToBottom]);

  const markMessageSent = useCallback(() => {
    setHasSentMessage(true);
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  // Force scroll to bottom regardless of position
  const forceScrollToBottom = useCallback(() => {
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  const onViewportEnter = useCallback(() => {
    setIsAtBottom(true);
  }, []);

  const onViewportLeave = useCallback(() => {
    setIsAtBottom(false);
  }, []);

  return {
    containerRef,
    endRef,
    isAtBottom,
    hasSentMessage,
    scrollToBottom,
    autoScrollToBottom,
    forceScrollToBottom,
    markMessageSent,
    onViewportEnter,
    onViewportLeave,
    debugInfo, // Export debug info
  };
}