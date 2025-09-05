import React from "react";

export function Button({ variant = "default", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus-visible:ring";
  const variants = {
    default: "bg-white/10 hover:bg-white/15 text-white",
    outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
    ghost: "bg-transparent hover:bg-white/10 text-white",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-4", icon: "h-10 w-10 p-0" };
  return <button className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`} {...props} />;
}
