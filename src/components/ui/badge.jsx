import React from "react";


export function Badge({ className = "", children, ...props }) {
  return (
    <span
      className={"inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none " + className}
      {...props}
    >
      {children}
    </span>
  );
}

