import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 focus-visible:ring-indigo-500",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-500",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-slate-400",
  "outline-brand":
    "border border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 focus-visible:ring-indigo-400",
};

const sizes = {
  xs: "h-7 px-2.5 text-xs rounded-lg gap-1",
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-xl gap-2",
  lg: "h-11 px-6 text-sm rounded-xl gap-2",
  xl: "h-12 px-8 text-base rounded-xl gap-2.5",
};

export const Button = forwardRef(
  ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-150 ease-out
          hover:scale-[1.02] active:scale-[0.97]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:pointer-events-none disabled:opacity-50
          ${variants[variant] ?? variants.primary}
          ${sizes[size] ?? sizes.md}
          ${className}
        `}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
