import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  Database,
  FileWarning,
  FlaskConical,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import Panel, { PanelHeader } from "../../components/ui/Panel";
import { EmptyState, ErrorState, LoadingState } from "../../components/ui/States";
import { apiRequest } from "../../lib/api";
import { formatDateTime } from "../../lib/format";
import { statusVariant } from "../../lib/status";

function SystemCard({ system }) {
  const { counts, latestChange, latestActivity } = system;
  return (
    <Panel className="group flex h-full flex-col p-5 transition-colors hover:border-accent/25">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <ShieldCheck size={19} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-ink">{system.name}</h2>
              <Badge variant={statusVariant(system.criticality)}>{system.criticality}</Badge>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {system.code} · {system.owner} · {system.source} system
            </p>
          </div>
        </div>
        <Badge variant="info">{system.baselineVersion}</Badge>
      </div>

      <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-slate-400">
        {system.description}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-line bg-shell/60 px-2.5 py-2">
          <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">Controls</p>
          <p className="mt-1 text-sm font-semibold text-slate-200">{counts.controls}</p>
        </div>
        <div className="rounded-xl border border-line bg-shell/60 px-2.5 py-2">
          <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">Evidence</p>
          <p className="mt-1 text-sm font-semibold text-slate-200">{counts.evidence}</p>
        </div>
        <div
          className={`rounded-xl border px-2.5 py-2 ${
            counts.pendingInvalidations
              ? "border-rose-400/20 bg-rose-400/[0.06]"
              : "border-line bg-shell/60"
          }`}
        >
          <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">Invalidated</p>
          <p
            className={`mt-1 text-sm font-semibold ${
              counts.pendingInvalidations ? "text-rose-300" : "text-slate-200"
            }`}
          >
            {counts.pendingInvalidations}
          </p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-2 text-[11px]">
        <div className="flex items-center gap-2 text-slate-500">
          <FlaskConical size={13} className="text-violet-300/70" />
          <span className="truncate">
            {latestChange
              ? `${latestChange.proposedVersion}: ${latestChange.title}`
              : "No simulated changes yet"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <ClipboardCheck size={13} className="text-cyan-300/70" />
          <span>
            {counts.reviewPacks} review pack{counts.reviewPacks === 1 ? "" : "s"} ·{" "}
            {counts.oversightRuns} oversight run{counts.oversightRuns === 1 ? "" : "s"}
          </span>
        </div>
        {latestActivity ? (
          <p className="truncate text-slate-600">
            Last activity {formatDateTime(latestActivity.createdAt)} · {latestActivity.title}
          </p>
        ) : null}
      </div>

      <Link
        to={`/compliance/systems/${system.id}/changes/new`}
        className="mt-5 inline-flex items-center justify-between rounded-xl border border-line bg-raised/50 px-3 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent/25 hover:bg-accent/[0.06] hover:text-ink"
      >
        Open compliance workspace
        <ArrowRight size={14} />
      </Link>
    </Panel>
  );
}

export default function ComplianceOverview() {
  const [systems, setSystems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/compliance/systems");
      setSystems(data.systems ?? []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load compliance systems.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const list = systems ?? [];
    return {
      systems: list.length,
      controls: list.reduce((total, system) => total + system.counts.controls, 0),
      invalidations: list.reduce(
        (total, system) => total + system.counts.pendingInvalidations,
        0,
      ),
      packs: list.reduce((total, system) => total + system.counts.reviewPacks, 0),
    };
  }, [systems]);

  if (loading && !systems) return <LoadingState cards={3} />;
  if (error && !systems) {
    return (
      <ErrorState
        title="Compliance workspace unavailable"
        description={error}
        onRetry={load}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI compliance copilot"
        title="Compliance workspace"
        description="Simulate system changes, invalidate dependent evidence, exercise human oversight, and generate review packs."
        actions={<Badge variant="violet">Demo systems · persisted records</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Registered systems", value: totals.systems, icon: ShieldCheck },
          { label: "Baseline controls", value: totals.controls, icon: ClipboardCheck },
          { label: "Pending invalidations", value: totals.invalidations, icon: FileWarning },
          { label: "Review packs generated", value: totals.packs, icon: Sparkles },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Panel key={metric.label} className="flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-raised/60 text-accent">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                  {metric.label}
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-ink">{metric.value}</p>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="animate-fade-up p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <Database size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Demo data vs persisted data</h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
                Baseline systems, controls, and evidence are demo fixtures in the server.
                Every simulation, evidence revalidation, oversight decision, review pack,
                and activity event is persisted to a local JSON audit store. No database
                reset or migration is performed.
              </p>
            </div>
          </div>
          <Badge variant="success">No destructive setup</Badge>
        </div>
      </Panel>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Systems in scope</h2>
            <p className="mt-1 text-xs text-slate-500">
              Choose a system to run the connected compliance workflow.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
            {systems.length} systems
          </span>
        </div>

        {systems.length ? (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {systems.map((system) => (
              <SystemCard key={system.id} system={system} />
            ))}
          </div>
        ) : (
          <Panel>
            <EmptyState
              title="No compliance systems"
              description="Add demo fixtures on the server to begin."
              action={
                <Button variant="secondary" onClick={load}>
                  Refresh
                </Button>
              }
            />
          </Panel>
        )}
      </div>

      <Panel>
        <PanelHeader
          title="Workflow coverage"
          description="Each stage writes an audit event and feeds the final review pack."
        />
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["1", "Simulate", "Compare baseline and proposed controls, obligations, and residual risk."],
            ["2", "Invalidate", "Trace evidence dependencies and mark affected proof as needing review."],
            ["3", "Oversee", "Run synthetic actions through server-side approval policy checks."],
            ["4", "Audit", "Read the system-scoped activity timeline, including demo vs persisted."],
            ["5", "Document", "Generate a downloadable change review pack with report content."],
          ].map(([step, title, detail]) => (
            <div
              key={step}
              className="rounded-xl border border-line bg-shell/60 p-3.5"
            >
              <span className="text-[10px] font-semibold text-violet-300">{step}</span>
              <h3 className="mt-2 text-xs font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
