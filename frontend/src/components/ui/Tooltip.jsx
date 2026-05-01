import React from "react";

/**
 * A simple CSS-based Tooltip component.
 * Usage: <Tooltip text="Click to save"><Button>Save</Button></Tooltip>
 */
export function Tooltip({ children, text, position = "top", className = "" }) {
  if (!text) return children;

  const positionClasses = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top:    "top-full left-1/2 -translate-x-1/2 border-t-slate-900",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900",
    left:   "left-full top-1/2 -translate-y-1/2 border-l-slate-900",
    right:  "right-full top-1/2 -translate-y-1/2 border-r-slate-900",
  };

  return (
    <div className={`group relative inline-block ${className}`}>
      {children}
      <div
        className={`
          pointer-events-none absolute z-50 whitespace-nowrap rounded-md
          bg-slate-900 px-2 py-1 text-[10px] font-medium text-white
          opacity-0 transition-all duration-200 group-hover:opacity-100
          ${positionClasses[position] || positionClasses.top}
        `}
      >
        {text}
        <div
          className={`
            absolute border-4 border-transparent
            ${arrowClasses[position] || arrowClasses.top}
          `}
        />
      </div>
    </div>
  );
}
