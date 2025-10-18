import { useSessionStore } from '@/stores/session-store';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface GreetingProps {
  chatId?: string;
  sendMessage?: any;
  selectedVisibilityType?: any;
}

export const Greeting = ({
  chatId ,
  sendMessage = () => {},
  selectedVisibilityType = 'private'
}: GreetingProps) => {
  // Animation variants for the text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.5
      }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.6, 0.01, 0.05, 0.95]
      }
    }
  };

  const text =  `Hi ${useSessionStore.getState().session?.username || 'there'},|I am here to help!`;

  const { newSessionId } = useSessionStore();
  const [hydrate, setHydrate] = useState(false);
  React.useEffect(() => {
    setHydrate(true);
  }, []);
  if (!hydrate || newSessionId || chatId) {
    return null;
  }
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-64 px-8 size-full flex flex-col justify-center gap-8"
    >
      <div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:text-6xl text-3xl font-bold text-center"
          style={{
            filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.15))'
          }}
        >
          <span className="cursor-pointer inline-block">
            {text.split('|').map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {line.split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="inline-block bg-clip-text text-btn drop-shadow-md"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                    }}
                    transition={{
                      backgroundPosition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.1
                      }
                    }}
                    style={{
                      backgroundSize: "200% 200%"
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
                {lineIdx < text.split('|').length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default Greeting;