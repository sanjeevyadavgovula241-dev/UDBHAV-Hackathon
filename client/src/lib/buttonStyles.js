const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants = {
  primary:
    "border border-accent/80 bg-accent text-[#07131b] shadow-[0_10px_28px_-18px_rgba(85,214,190,0.9)] hover:border-accent hover:bg-[#6de1cc]",
  secondary:
    "border border-line bg-shell/70 text-slate-200 hover:border-slate-500/60 hover:bg-raised/70",
  ghost: "text-slate-400 hover:bg-shell hover:text-ink",
  subtle: "bg-shell text-slate-200 hover:bg-raised",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4",
  lg: "h-11 px-5",
  icon: "h-9 w-9 p-0",
};

export function buttonStyles({ variant = "secondary", size = "md", className = "" } = {}) {
  return `${base} ${variants[variant] ?? variants.secondary} ${sizes[size] ?? sizes.md} ${className}`;
}
