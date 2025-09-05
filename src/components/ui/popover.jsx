import React, { useState, useRef, useEffect } from "react";

export function Popover({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

export function PopoverTrigger({ asChild, children }) {
  return children;
}

export function PopoverContent({ children, className }) {
  return (
    <div
      className={`absolute right-0 mt-2 w-80 rounded-md bg-slate-900 text-white border border-white/10 shadow-lg z-50 ${className}`}
    >
      {children}
    </div>
  );
}
