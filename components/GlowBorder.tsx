import React, { ReactNode } from "react";

interface GlowBorderProps {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

const GlowBorder: React.FC<GlowBorderProps> = ({ className = "", children, style }) => (
  <div
    className={`glow-border ${className}`}
    style={{
      position: "relative",
      display: "inline-block",
      ...style,
    }}
  >
    {children}
  </div>
);

export default GlowBorder;