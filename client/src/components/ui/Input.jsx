import { ChevronDown, Search } from "lucide-react";

export const inputStyles =
  "h-10 w-full rounded-xl border border-line bg-shell/80 px-3 text-sm text-ink placeholder:text-slate-500 transition-colors duration-200 focus:border-accent/60 focus:bg-shell focus:outline-none focus:ring-2 focus:ring-accent/20";

export function SearchInput({ className = "", ...props }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input className={`${inputStyles} pl-9`} {...props} />
    </div>
  );
}

export function Select({ className = "", containerClassName = "", children, ...props }) {
  return (
    <div className={`relative inline-block ${containerClassName}`}>
      <select
        className={`${inputStyles} cursor-pointer appearance-none bg-shell pr-9 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
