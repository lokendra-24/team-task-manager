const variants = {
  default: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  primary: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  danger:  "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  blue:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  purple:  "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  // Glass variants
  glass:   "bg-white/40 backdrop-blur-sm text-slate-700 ring-1 ring-slate-200/50",
  "glass-indigo": "bg-indigo-50/40 backdrop-blur-sm text-indigo-700 ring-1 ring-indigo-200/50",
  // Outline variants
  outline: "bg-transparent text-slate-600 ring-1 ring-slate-200",
};

const dotColors = {
  default: "bg-slate-400",
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-rose-500",
  blue:    "bg-blue-500",
  purple:  "bg-purple-500",
};

export function Badge({ children, variant = "default", showDot = false, className = "" }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
        text-[11px] font-bold tracking-tight uppercase
        ${variants[variant] ?? variants.default}
        ${className}
      `}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${dotColors[variant] ?? dotColors.default}`} />
      )}
      {children}
    </span>
  );
}
