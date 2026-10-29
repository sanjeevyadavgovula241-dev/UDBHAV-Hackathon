import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  ClipboardList,
  FlaskConical,
  History,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { ErrorState, LoadingState } from "../../components/ui/States";
import { apiRequest } from "../../lib/api";
import { statusVariant } from "../../lib/status";

const tabs = [
  { to: "changes/new", label: "Change simulator", icon: FlaskConical },
  { to: "evidence", label: "Evidence", icon: ScanSearch },
  { to: "oversight", label: "Oversight sandbox", icon: ShieldCheck },
  { to: "activity", label: "Activity", icon: History },
  { to: "review-pack", label: "Review pack", icon: ClipboardList },
];

function SummaryStat({ label, value, tone = "default" }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-shell/60 px-3 py-2.5">
      <p className="truncate text-[10px] uppercase tracking-[0.16em] text-slate-600">{label}</p>
      <p
        className={`mt-1 truncate text-sm font-semibold ${
          tone === "danger"
            ? "text-rose-300"
            : tone === "warning"
              ? "text-amber-200"
              : "text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ComplianceSystemLayout() {
  const { systemId } = useParams();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/api/compliance/systems/${systemId}`);
      setBundle(data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load the compliance system.");
    } finally {
      setLoading(false);
    }
  }, [systemId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !bundle) return <LoadingState cards={4} />;
  if (error && !bundle) {
    return (
      <ErrorState
        title="Compliance system unavailable"
        description={error}
        onRetry={load}
      />
    );
  }

  const system = bundle?.system;
  const pendingInvalidations = bundle?.invalidations.filter(
    (entry) => entry.status === "pending",
  ).length ?? 0;
  const approvedOversight = bundle?.oversight.runs.filter(
    (run) => run.status === "approved",
  ).length ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="AI compliance copilot"
        title={system.name}
        description={system.description}
        actions={
          <>
            <Badge variant={statusVariant(system.criticality)}>
              {system.criticality} criticality
            </Badge>
            <Badge variant="info">Baseline {system.baselineVersion}</Badge>
            <Link to="/compliance">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={14} />
                All systems
              </Button>
            </Link>
          </>
        }
      />

      <Panel className="animate-fade-up p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[680px]">
            <SummaryStat label="Owner" value={system.owner} />
            <SummaryStat label="Controls" value={system.counts.controls} />
            <SummaryStat
              label="Pending invalidations"
              value={pendingInvalidations}
              tone={pendingInvalidations ? "danger" : "default"}
            />
            <SummaryStat
              label="Approved oversight"
              value={approvedOversight}
              tone={approvedOversight ? "warning" : "default"}
            />
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-2.5 text-[11px] leading-relaxed text-cyan-100/70 xl:max-w-[390px]">
            <BookOpenCheck size={16} className="mt-0.5 shrink-0 text-cyan-300" />
            <span>
              System definitions and baseline evidence are demo fixtures. Simulations,
              revalidations, oversight runs, packs, and activity are persisted by the API.
            </span>
          </div>
        </div>
      </Panel>

      <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
        <nav
          aria-label="Compliance system sections"
          className="flex min-w-max gap-1 rounded-xl border border-line bg-void/75 p-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-accent/[0.12] text-ink shadow-[0_8px_24px_-18px_rgba(85,214,190,0.8)]"
                      : "text-slate-500 hover:bg-raised/50 hover:text-slate-200"
                  }`
                }
              >
                <Icon size={15} />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <Outlet context={{ bundle, refresh: load }} />
    </div>
  );
}
