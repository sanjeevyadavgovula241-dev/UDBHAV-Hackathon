import { Search } from "lucide-react";

export const inputStyles =
  "h-10 w-full rounded-xl border border-line bg-shell/80 px-3 text-sm text-ink placeholder:text-slate-600 transition-colors duration-200 focus:border-accent/50 focus:bg-shell focus:outline-none focus:ring-2 focus:ring-accent/15";

export function SearchInput({ className = "", ...props }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input className={`${inputStyles} pl-9`} {...props} />
    </div>
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`${inputStyles} cursor-pointer appearance-none bg-shell pr-8 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
