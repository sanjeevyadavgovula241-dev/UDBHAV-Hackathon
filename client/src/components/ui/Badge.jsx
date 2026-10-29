const variants = {
  default: "border-line bg-shell/70 text-slate-300",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  info: "border-accent/25 bg-accent/10 text-accent",
  violet: "border-indigo-400/25 bg-indigo-400/10 text-indigo-300",
};

export default function Badge({ variant = "default", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
