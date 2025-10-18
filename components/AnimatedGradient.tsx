'use client';
import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
};

/** Allow CSS custom properties on style objects */
type StyleVars = React.CSSProperties & {
  ['--size']?: string;
  ['--duration']?: string;
  ['--delay']?: string;
  ['--offsetX']?: string;
  ['--offsetY']?: string;
};

export default function AnimatedGradient({ children, className = '' }: Props) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-black ${className}`}>
      {/* Floating bubbles cluster (centered, with gentle rotation) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="bubble-cluster">
          {/* Bubble A (orange glow) */}
          <div
            className="bubble-attached bubble-a"
            style={{
              '--size': '70vmin',
            } as StyleVars}
          >
            <div
              className="inner rounded-full"
              style={{
                width: 'var(--size)',
                height: 'var(--size)',
                opacity: 0.6,
                background:
                  'radial-gradient(circle, #d35f35 0%, #bf6428 30%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'blobMorph1 9s ease-in-out infinite',
                willChange: 'transform, border-radius',
              }}
            />
          </div>

          {/* Bubble B (amber glow) */}
          <div
            className="bubble-attached bubble-b"
            style={{
              '--size': '65vmin',
            } as StyleVars}
          >
            <div
              className="inner rounded-full"
              style={{
                width: 'var(--size)',
                height: 'var(--size)',
                opacity: 0.65,
                background:
                  'radial-gradient(circle, #bf6428 0%, #bf6428 30%, transparent 70%)',
                filter: 'blur(35px)',
                animation: 'blobMorph2 10s ease-in-out infinite',
                willChange: 'transform, border-radius',
              }}
            />
          </div>

          {/* Bubble C (warm red glow) */}
          <div
            className="bubble-attached bubble-c"
            style={{
              '--size': '80vmin',
            } as StyleVars}
          >
            <div
              className="inner rounded-full"
              style={{
                width: 'var(--size)',
                height: 'var(--size)',
                opacity: 0.55,
                background:
                  'radial-gradient(circle, #d35f35 0%, #d35f35 30%, transparent 70%)',
                filter: 'blur(45px)',
                animation: 'blobMorph3 11s ease-in-out infinite',
                willChange: 'transform, border-radius',
              }}
            />
          </div>

          {/* Bubble D (teal glow) */}
          <div
            className="bubble-attached bubble-d"
            style={{
              '--size': '40vmin',
            } as StyleVars}
          >
            <div
              className="inner rounded-full"
              style={{
                width: 'var(--size)',
                height: 'var(--size)',
                opacity: 0.7,
                background:
                  'radial-gradient(circle, #0f6a8f 0%, #0f6a8f 30%, transparent 70%)',
                filter: 'blur(38px)',
                animation: 'blobMorph2 12s ease-in-out infinite',
                willChange: 'transform, border-radius',
              }}
            />
          </div>

          {/* Bubble E (light pink glow) */}
          <div
            className="bubble-attached bubble-e"
            style={{
              '--size': '48vmin',
            } as StyleVars}
          >
            <div
              className="inner rounded-full"
              style={{
                width: 'var(--size)',
                height: 'var(--size)',
                opacity: 0.65,
                background:
                  'radial-gradient(circle, #f8a5d8 0%, #fbb9e3 20%, transparent 60%)',
                filter: 'blur(42px)',
                animation: 'blobMorph1 14s ease-in-out infinite',
                willChange: 'transform, border-radius',
              }}
            />
          </div>
        </div>
      </div>

      {/* Your page content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        /* Bubble cluster fixed center with noticeable infinite rotation */
        .bubble-cluster {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 100vmin;
          height: 100vmin;
          animation: infiniteRotate 45s linear infinite;
        }

        /* Infinite rotation animation - more noticeable speed */
        @keyframes infiniteRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Individual bubbles with position switching animations */
        .bubble-attached {
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--size);
          height: var(--size);
        }

        /* Bubble A position switching animation */
        .bubble-a {
          animation: positionSwitchA 60s ease-in-out infinite;
        }

        /* Bubble B position switching animation */
        .bubble-b {
          animation: positionSwitchB 65s ease-in-out infinite;
        }

        /* Bubble C position switching animation */
        .bubble-c {
          animation: positionSwitchC 70s ease-in-out infinite;
        }

        /* Bubble D position switching animation */
        .bubble-d {
          animation: positionSwitchD 55s ease-in-out infinite;
        }

        /* Bubble E position switching animation */
        .bubble-e {
          animation: positionSwitchE 62s ease-in-out infinite;
        }

        /* Position switching keyframes for each bubble - much slower and smoother */
        @keyframes positionSwitchA {
          0%, 40% { transform: translate(-50%, -50%); }
          45%, 85% { transform: translate(calc(-50% + 15vmin), calc(-50% - 10vmin)); }
          90%, 100% { transform: translate(-50%, -50%); }
        }

        @keyframes positionSwitchB {
          0%, 35% { transform: translate(calc(-50% + 15vmin), calc(-50% - 10vmin)); }
          40%, 80% { transform: translate(calc(-50% - 15vmin), calc(-50% + 7vmin)); }
          85%, 100% { transform: translate(calc(-50% + 15vmin), calc(-50% - 10vmin)); }
        }

        @keyframes positionSwitchC {
          0%, 45% { transform: translate(calc(-50% - 15vmin), calc(-50% + 7vmin)); }
          50%, 90% { transform: translate(calc(-50% - 12vmin), calc(-50% - 10vmin)); }
          95%, 100% { transform: translate(calc(-50% - 15vmin), calc(-50% + 7vmin)); }
        }

        @keyframes positionSwitchD {
          0%, 30% { transform: translate(calc(-50% - 12vmin), calc(-50% - 10vmin)); }
          35%, 75% { transform: translate(-50%, -50%); }
          80%, 100% { transform: translate(calc(-50% - 12vmin), calc(-50% - 10vmin)); }
        }

        @keyframes positionSwitchE {
          0%, 35% { transform: translate(calc(-50% + 8vmin), calc(-50% + 12vmin)); }
          40%, 80% { transform: translate(calc(-50% - 8vmin), calc(-50% - 8vmin)); }
          85%, 100% { transform: translate(calc(-50% + 8vmin), calc(-50% + 12vmin)); }
        }

        /* Inner morphing animations for shape changes only */
        @keyframes blobMorph1 {
          0% { transform: scale(1); border-radius: 50%; }
          25% { transform: scale(1.2, 0.85); border-radius: 60% 40% 30% 70%; }
          50% { transform: scale(0.85, 1.25); border-radius: 30% 60% 70% 40%; }
          75% { transform: scale(1.1, 0.95); border-radius: 40% 30% 60% 70%; }
          100% { transform: scale(1); border-radius: 50%; }
        }

        @keyframes blobMorph2 {
          0% { transform: scale(1); border-radius: 50%; }
          30% { transform: scale(0.9, 1.35); border-radius: 70% 30% 40% 60%; }
          60% { transform: scale(1.3, 0.75); border-radius: 40% 70% 30% 60%; }
          100% { transform: scale(1); border-radius: 50%; }
        }

        @keyframes blobMorph3 {
          0% { transform: scale(1); border-radius: 50%; }
          20% { transform: scale(1.1, 0.85); border-radius: 60% 40% 70% 30%; }
          40% { transform: scale(0.75, 1.2); border-radius: 30% 70% 40% 60%; }
          70% { transform: scale(1.35, 0.9); border-radius: 70% 30% 60% 40%; }
          100% { transform: scale(1); border-radius: 50%; }
        }

        /* Accessibility: respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .inner {
            animation: none !important;
          }
          .bubble-cluster {
            animation: none !important;
          }
          .bubble-a, .bubble-b, .bubble-c, .bubble-d, .bubble-e {
            animation: none !important;
            transform: translate(-50%, -50%) !important;
          }
        }
      `}</style>
    </div>
  );
}