import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="w-full">
      <style jsx>{`
        @keyframes dotPulse {
          0%, 20% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .dot-1 {
          animation: dotPulse 1.5s infinite;
          animation-delay: 0s;
        }
        .dot-2 {
          animation: dotPulse 1.5s infinite;
          animation-delay: 0.3s;
        }
        .dot-3 {
          animation: dotPulse 1.5s infinite;
          animation-delay: 0.6s;
        }
        .dot-4 {
          animation: dotPulse 1.5s infinite;
          animation-delay: 0.9s;
        }
        .dot-5 {
          animation: dotPulse 1.5s infinite;
          animation-delay: 1.2s;
        }
      `}</style>
      <div className="space-y-2 w-full">
        <div className="h-7 w-2/3 bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-4 w-full bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-700 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}