import { Search } from "lucide-react";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";

export default function SuggestionsBaseChatComponent({
  handleClick
}: {
  handleClick: (suggestion: string, index: number) => void;
}) {
  const [clickedItem, setClickedItem] = useState<number | null>(null);

  const suggestions = [
    "find a 2024 Honda Accord with less than 20,000 miles in my area",
    "compare financing options for a $35,000 SUV purchase",
    "what's the trade-in value of my 2019 Toyota Camry with 45,000 miles?",
    "show me all certified pre-owned vehicles under $25,000"
  ];

  const _handleSend = useCallback(
    (suggestion: string, index: number) => {
      handleClick(suggestion, index);
    },
    [handleClick]
  );

  return (
    <div className="w-full mx-auto max-w-3xl px-4 text-btn group/message">
      <h2 className="  font-semibold mb-5">
        Common questions are…
      </h2>
      <div className="flex-col w-full gap-3 flex">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onMouseDown={(e) => {
              e.preventDefault();
              _handleSend(suggestion, index);
            }}
            className="w-full flex items-center gap-2 px-5 py-2 rounded-full transition-all bg-[#262d31] duration-200 text-left hover:bg-[#465159]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1, // staggered animation
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className=" text-sm leading-relaxed">
              {suggestion}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
