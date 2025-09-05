import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
