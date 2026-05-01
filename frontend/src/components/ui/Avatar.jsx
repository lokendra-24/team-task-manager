import React from "react";

const COLORS = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-cyan-600",
];

export function Avatar({ name, size = "md", className = "" }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  // Deterministic color based on name
  const charCodeSum = name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  const color = COLORS[charCodeSum % COLORS.length];

  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-14 w-14 text-lg",
  };

  return (
    <div
      title={name}
      className={`
        relative flex shrink-0 items-center justify-center rounded-full border-2 border-white
        bg-gradient-to-br ${color} font-bold text-white shadow-sm transition-transform duration-200
        hover:scale-105 active:scale-95
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {initials}
      {/* Subtle shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 to-white/20 pointer-events-none" />
    </div>
  );
}
