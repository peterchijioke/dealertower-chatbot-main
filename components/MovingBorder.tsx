import React, { useState } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility function

interface MovingBorderDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const MovingBorderDiv = ({ children, className, ...props }: MovingBorderDivProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full space-y-3">
      <div 
        className={cn(
          "w-full relative flex flex-col gap-4",
          // Base styles
          "rounded-3xl transition-all duration-300",
          // Conditional styles based on focus
          isFocused && [
            'shadow-lg z-[2000] bg-sidebar overflow-hidden',
            // Moving gradient border styles
            'moving-gradient-border'
          ],
          className
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => setIsFocused(false)}
        {...props}
      >
        {/* Content goes here */}
        <div className="relative z-10 p-4">
          {children}
        </div>
        
        {/* Alternative: Manual gradient border implementation */}
        {isFocused && (
          <div 
            className="absolute inset-0 rounded-3xl p-[2px] animate-spin"
            style={{
              background: `conic-gradient(
                from 0deg,
                #ff6b35,
                #f7931e,
                #ffd700,
                #32cd32,
                #00bfff,
                #8a2be2,
                #ff1493,
                #ff6b35
              )`,
              animationDuration: '3s'
            }}
          >
            <div className="w-full h-full bg-sidebar rounded-3xl" />
          </div>
        )}
      </div>
    </div>
  );
};

// Alternative implementation with Tailwind utilities
const MovingBorderDivTailwind = ({
  children,
  className,
  isFocused,
}: {
  children: React.ReactNode;
  className?: string;
  isFocused: boolean;
}) => {
  return (
    <div className="w-full space-y-3">
      <div className="relative">
        {/* Rotating gradient background */}
        {isFocused && (
          <div 
            className="absolute inset-0 rounded-3xl animate-spin"
            style={{
              background: `conic-gradient(
                from 0deg,
                #ff6b35 0deg,
                #f7931e 51deg,
                #ffd700 102deg,
                #32cd32 153deg,
                #00bfff 204deg,
                #8a2be2 255deg,
                #ff1493 306deg,
                #ff6b35 360deg
              )`,
              animationDuration: '3s',
              padding: '2px'
            }}
          />
        )}
        
        {/* Main content container */}
        <div
          className={cn(
            "w-full relative flex flex-col gap-4 rounded-3xl",
            isFocused && [
              'shadow-lg z-[2000] bg-sidebar overflow-hidden',
              'relative' // Ensure content is above the gradient
            ],
            className
          )}
          style={{
            margin: isFocused ? '2px' : '0', // Account for gradient border
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export { MovingBorderDiv, MovingBorderDivTailwind };