'use client';

interface ThinkingIndicatorProps {
  message?: string;
}

export function ThinkingIndicator({ message = 'AI is thinking...' }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 p-4 animate-fade-in">
      <div className="shrink-0 size-8 rounded-full bg-blue-100 flex items-center justify-center">
        <svg className="size-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{message}</span>
            <div className="flex gap-1">
              <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="size-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
