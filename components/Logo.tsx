import Image from "next/image";
import React from "react";

export default function Logo() {
  return (
  <div className="w-full h-8 flex items-center my-4  gap-2">
    <img
      src="/logoG.png"
      alt="Logo"
      className="h-9 w-auto"
      width={32}
      height={32}
    />
   
                
  </div>
  );
}