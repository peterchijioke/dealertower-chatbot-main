import { motion } from "framer-motion";
import SkeletonLoader from "./SkeletonLoader";

export const MessageLoading = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
       <div className="w-full">
     
      
      <div className="space-y-2 w-full">
        <div className="h-7 w-2/3 bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-4 w-full bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-700 rounded-2xl animate-pulse" />
      </div>
    </div>
    </motion.div>
  );
};
