import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const accents = {
  violet: {
    icon: "border-accent/30 bg-accent/10 text-accent",
    glow: "group-hover:border-accent/30",
  },
  indigo: {
    icon: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
    glow: "group-hover:border-indigo-400/30",
  },
  cyan: {
    icon: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    glow: "group-hover:border-cyan-400/30",
  },
  emerald: {
    icon: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    glow: "group-hover:border-emerald-400/30",
  },
  amber: {
    icon: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    glow: "group-hover:border-amber-400/30",
  },
  rose: {
    icon: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    glow: "group-hover:border-rose-400/30",
  },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "violet",
  delay = 0,
  badge,
}) {
  const tone = accents[accent] ?? accents.violet;

  let positive = null;
  let trendText = null;

  if (typeof trend === "number") {
    positive = trend >= 0;
    trendText = `${positive ? "+" : ""}${Math.abs(trend)}%`;
  } else if (typeof trend === "string" && trend.trim()) {
    positive = !trend.startsWith("-");
    trendText = trend;
  }

  return (
    <div
      className={`group relative animate-fade-up overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-[0_18px_46px_-32px_rgba(2,6,16,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-raised/70 ${tone.glow}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {title}
        </p>
        <div className="flex items-center gap-1.5">
          {badge ? (
            <span className="rounded-md border border-line bg-shell/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
              {badge}
            </span>
          ) : null}
          {Icon ? (
            <span className={`rounded-xl border p-2.5 transition-transform duration-200 group-hover:scale-105 ${tone.icon}`}>
              <Icon size={17} strokeWidth={1.9} />
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative mt-4">
        <p className="font-display text-2xl sm:text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
          {value}
        </p>
      </div>

      <div className="relative mt-3 flex min-h-5 flex-wrap items-center gap-2 text-xs">
        {trendText !== null ? (
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium text-[11px] ${
              positive
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                : "border-rose-400/25 bg-rose-400/10 text-rose-300"
            }`}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendText}
          </span>
        ) : null}
        {subtitle ? <span className="text-slate-400 text-xs">{subtitle}</span> : null}
      </div>
    </div>
  );
}
