import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ClipboardList,
  Database,
  FlaskConical,
  History,
  ScanSearch,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Panel, { PanelHeader } from "../../components/ui/Panel";
import { SearchInput } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/States";
import { activityLabels } from "../../lib/compliance";
import { formatDateTime } from "../../lib/format";

const icons = {
  change: FlaskConical,
  evidence: ScanSearch,
  oversight: ShieldCheck,
  "review-pack": ClipboardList,
  control: Wrench,
};

const filters = ["All", "Change", "Evidence", "Oversight", "Review pack", "Control"];
const filterTypes = {
  All: null,
  Change: "change",
  Evidence: "evidence",
  Oversight: "oversight",
  "Review pack": "review-pack",
  Control: "control",
};

const routes = {
  change: "changes/new",
  evidence: "evidence",
  oversight: "oversight",
  "review-pack": "review-pack",
  control: "evidence",
};

export default function ActivityHistory() {
  const { bundle } = useOutletContext();
  const { system, activity } = bundle;
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const events = useMemo(() => {
    const activeType = filterTypes[filter];
    const term = query.trim().toLowerCase();
    return activity.filter((event) => {
      const matchesType = !activeType || event.type === activeType;
      const matchesQuery =
        !term ||
        `${event.title} ${event.detail} ${event.actor} ${event.type}`
          .toLowerCase()
          .includes(term);
      return matchesType && matchesQuery;
    });
  }, [activity, filter, query]);

  const demoCount = activity.filter((event) => event.source === "demo").length;
  const persistedCount = activity.filter((event) => event.source === "persisted").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Panel className="p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">Total events</p>
          <p className="mt-1.5 text-xl font-semibold text-ink">{activity.length}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">Demo baseline</p>
          <p className="mt-1.5 text-xl font-semibold text-cyan-300">{demoCount}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">Persisted activity</p>
          <p className="mt-1.5 text-xl font-semibold text-violet-300">{persistedCount}</p>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="System activity history"
          description={`Audit trail for ${system.name}. Demo fixture events and persisted workflow events are labeled separately.`}
          action={<Badge variant="info">{system.code}</Badge>}
        />
        <div className="space-y-3 border-b border-line/70 p-4">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activity, actor, or detail..."
            aria-label="Search activity"
          />
          <div className="flex flex-wrap gap-1.5">
            {filters.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                  filter === option
                    ? "border-accent/25 bg-accent/[0.12] text-accent"
                    : "border-line bg-shell/50 text-slate-500 hover:text-slate-300"
                }`}
                aria-pressed={filter === option}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {events.length ? (
          <ol className="relative p-5">
            <span
              aria-hidden="true"
              className="absolute bottom-8 left-[33px] top-8 w-px bg-gradient-to-b from-accent/40 via-line/70 to-transparent"
            />
            {events.map((event) => {
              const Icon = icons[event.type] ?? History;
              return (
                <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                      event.source === "persisted"
                        ? "border-accent/25 bg-accent/[0.12] text-accent"
                        : "border-line bg-void text-slate-400"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-line bg-shell/50 px-3 py-2.5">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold text-slate-200">{event.title}</p>
                        <Badge variant={event.source === "persisted" ? "violet" : "default"}>
                          {event.source}
                        </Badge>
                        <Badge variant="default">
                          {activityLabels[event.type] ?? event.type}
                        </Badge>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-600">
                        {formatDateTime(event.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {event.detail}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-slate-600">
                      <span>{event.actor}</span>
                      {routes[event.type] ? (
                        <Link
                          to={`../${routes[event.type]}`}
                          className="font-medium text-accent/80 hover:text-accent"
                        >
                          Open related view
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState
            icon={History}
            title="No activity matches this view"
            description="Clear the search or select another activity category."
          />
        )}
      </Panel>

      <Panel className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Database size={16} className="mt-0.5 shrink-0 text-emerald-300" />
            <p className="text-[11px] leading-relaxed text-slate-500">
              Demo fixtures are regenerated from server code. Persisted events are appended to
              the local JSON audit store and survive backend restarts.
            </p>
          </div>
          <Badge variant="success">Audit store active</Badge>
        </div>
      </Panel>
    </div>
  );
}
