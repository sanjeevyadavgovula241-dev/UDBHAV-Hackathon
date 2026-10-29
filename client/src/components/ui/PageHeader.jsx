export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
            <span className="h-px w-6 bg-accent/80" />
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
