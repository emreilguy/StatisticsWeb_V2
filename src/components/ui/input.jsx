import React from "react";

export const Input = React.forwardRef(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-xl bg-white/5 border border-white/20 px-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 ${className}`}
      {...props}
    />
  );
});
