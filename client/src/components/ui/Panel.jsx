export default function Panel({ className = "", children, ...props }) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_46px_-32px_rgba(2,6,16,0.95)] ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function PanelHeader({ title, description, action, className = "" }) {
  return (
    <div
      className={`flex flex-col gap-3 border-b border-line/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
