import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import Button from "./Button";

export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-hidden="true" />;
}

export function LoadingState({ cards = 4 }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading data</span>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <Skeleton key={index} className="h-[132px]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[360px] lg:col-span-2" />
        <Skeleton className="h-[360px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[260px] lg:col-span-2" />
        <Skeleton className="h-[260px]" />
      </div>
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load this view",
  description = "The data service did not respond. Check that the backend is running on port 5000 and try again.",
  onRetry,
}) {
  return (
    <div className="flex min-h-[360px] animate-fade-up flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 p-3 text-rose-300">
        <AlertTriangle size={22} />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Search,
  title = "Nothing to show yet",
  description = "Try adjusting your filters or search query.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-2xl border border-line bg-shell p-3 text-muted">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 font-display text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
