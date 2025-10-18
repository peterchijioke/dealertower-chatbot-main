import { Search } from "lucide-react";
import { useCallback, useState } from "react";



export default function SuggestionsInnerComponent({
  handleClick
}: {
  handleClick:  (suggestion: string, index: number)=> void;
}) {
  const [clickedItem, setClickedItem] = useState<number | null>(null);
  
  const suggestions = [
    "find a 2024 Honda Accord with less than 20,000 miles in my area",
    "compare financing options for a $35,000 SUV purchase",
    "what's the trade-in value of my 2019 Toyota Camry with 45,000 miles?",
    "show me all certified pre-owned vehicles under $25,000"
  ];

 const _handleSend = useCallback((suggestion: string, index: number) => {
    handleClick(suggestion, index);
  }, [handleClick]);

  return (
    <div className="w-full mt-2">
      <h2 className="text-white text-base font-semibold mb-6">You might ask</h2>
      
      <div className="">
        {suggestions.map((suggestion, index) => (
          <button
            key={index.toString()}
            onMouseDown={(e) =>{
              e.preventDefault();
              _handleSend(suggestion, index);
            }}
            className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all duration-200 text-left hover:bg-slate-700 `}
          >
            <Search 
              size={20} 
              className="text-slate-400 flex-shrink-0 mt-0.5" 
            />
            <span className="text-btn text-sm leading-relaxed">
              {suggestion}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}