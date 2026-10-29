import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileWarning,
  FlaskConical,
  GitCompareArrows,
  Layers,
  MinusCircle,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Panel, { PanelHeader } from "../../components/ui/Panel";
import { inputStyles, Select } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/States";
import { apiRequest } from "../../lib/api";
import { formatDate, formatDateTime } from "../../lib/format";
import { statusVariant } from "../../lib/status";

const changeTypes = [
  "Control update",
  "Architecture change",
  "Vendor onboarding",
  "Model update",
  "Access change",
];
const riskLevels = ["Low", "Medium", "High", "Critical"];

function nextVersion(version) {
  const parts = String(version || "v1.0.0")
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return `v${parts[0]}.${parts[1] + 1}.0`;
}

function defaultEffectiveDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function Metric({ label, value, tone = "default", icon: Icon }) {
  return (
    <div className="rounded-xl border border-line bg-shell/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">{label}</p>
        {Icon ? <Icon size={14} className="text-slate-600" /> : null}
      </div>
      <p
        className={`mt-2 text-lg font-semibold ${
          tone === "danger"
            ? "text-rose-300"
            : tone === "warning"
              ? "text-amber-200"
              : tone === "success"
                ? "text-emerald-300"
                : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SimulationDetail({ change, system }) {
  const simulation = change.simulation;
  const added = simulation.controlsAdded ?? [];
  const removed = simulation.controlsRemoved ?? [];
  const impacted = simulation.impactedEvidence ?? [];
  const impactedObligations = simulation.impactedObligations ?? [];
  const uncovered = simulation.uncoveredObligations ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="violet">{change.proposedVersion}</Badge>
            <Badge variant={statusVariant(change.riskLevel)}>{change.riskLevel} risk</Badge>
            <Badge variant={statusVariant(change.status)}>
              {change.status === "simulated" ? "Simulated" : change.status}
            </Badge>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-ink">{change.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{change.summary}</p>
        </div>
        <div className="shrink-0 text-right text-[10px] text-slate-600">
          <p>{formatDateTime(change.simulatedAt)}</p>
          <p className="mt-1">
            {change.baselineVersion} → {change.proposedVersion}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Controls added" value={added.length} icon={PlusCircle} />
        <Metric label="Controls removed" value={removed.length} icon={MinusCircle} />
        <Metric
          label="Evidence invalidated"
          value={impacted.length}
          tone={impacted.length ? "danger" : "default"}
          icon={FileWarning}
        />
        <Metric
          label="Residual risk"
          value={simulation.risk.residualRisk}
          tone={
            simulation.risk.residualRisk === "Critical" ||
            simulation.risk.residualRisk === "High"
              ? "danger"
              : simulation.risk.residualRisk === "Elevated"
                ? "warning"
                : "success"
          }
          icon={ShieldAlert}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-shell/50 p-4">
          <h4 className="flex items-center gap-2 text-xs font-semibold text-ink">
            <GitCompareArrows size={15} className="text-accent" />
            Control diff
          </h4>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-emerald-300/80">
                Added
              </p>
              {added.length ? (
                <ul className="mt-1.5 space-y-1.5">
                  {added.map((control) => (
                    <li
                      key={control.id}
                      className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] px-2.5 py-2"
                    >
                      <p className="text-[11px] font-medium text-slate-200">{control.title}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {control.id} · {control.risk} · {control.obligationIds.join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[11px] text-slate-600">No new controls.</p>
              )}
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-rose-300/80">
                Removed
              </p>
              {removed.length ? (
                <ul className="mt-1.5 space-y-1.5">
                  {removed.map((control) => (
                    <li
                      key={control.id}
                      className="rounded-lg border border-rose-400/15 bg-rose-400/[0.04] px-2.5 py-2"
                    >
                      <p className="text-[11px] font-medium text-slate-200">{control.title}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {control.id} · {control.risk} · {control.obligationIds.join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[11px] text-slate-600">No controls retired.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-shell/50 p-4">
          <h4 className="flex items-center gap-2 text-xs font-semibold text-ink">
            <Layers size={15} className="text-cyan-300" />
            Obligation impact
          </h4>
          <p className="mt-1 text-[10px] text-slate-600">
            Proposed controls cover {system.baseline.obligations.length - uncovered.length} of{" "}
            {system.baseline.obligations.length} obligations.
          </p>
          <div className="mt-3 space-y-1.5">
            {impactedObligations.length ? (
              impactedObligations.map((obligation) => (
                <div
                  key={obligation.id}
                  className="rounded-lg border border-line bg-shell/60 px-2.5 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium text-slate-200">{obligation.title}</p>
                    <Badge variant={statusVariant(obligation.risk)}>{obligation.risk}</Badge>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {obligation.id} · {obligation.framework}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-600">No obligation coverage changes.</p>
            )}
          </div>
          {uncovered.length ? (
            <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-200">
                Uncovered
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-rose-100/70">
                {uncovered.map((item) => item.id).join(", ")}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-shell/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 text-xs font-semibold text-ink">
            <FileWarning size={15} className="text-rose-300" />
            Simulator findings
          </h4>
          {impacted.length ? (
            <Link
              to="../evidence"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-strong"
            >
              Review evidence
              <ArrowRight size={12} />
            </Link>
          ) : null}
        </div>
        <ul className="mt-3 space-y-2">
          {simulation.findings.map((finding) => (
            <li
              key={`${finding.title}-${finding.detail}`}
              className="flex items-start gap-2.5 rounded-lg border border-line/70 bg-shell/50 px-2.5 py-2"
            >
              <span
                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                  finding.severity === "Critical" || finding.severity === "High"
                    ? "bg-rose-400"
                    : finding.severity === "Info"
                      ? "bg-cyan-400"
                      : "bg-emerald-400"
                }`}
              />
              <div>
                <p className="text-[11px] font-medium text-slate-200">{finding.title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                  {finding.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ChangeSimulator() {
  const { bundle, refresh } = useOutletContext();
  const { system, changes } = bundle;
  const [selectedChangeId, setSelectedChangeId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState(() => ({
    title: "",
    summary: "",
    proposedVersion: nextVersion(system.baselineVersion),
    effectiveDate: defaultEffectiveDate(),
    changeType: "Control update",
    riskLevel: "High",
    author: "Compliance workspace",
    retireControlIds: [],
    newControlTitle: "",
    newControlDescription: "",
    newControlObligationIds: [system.baseline.obligations[0]?.id].filter(Boolean),
  }));

  const activeChange = useMemo(() => {
    const selected = changes.find((change) => change.id === selectedChangeId);
    return selected ?? changes[0] ?? null;
  }, [changes, selectedChangeId]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess(null);
  };

  const toggleRetired = (controlId) => {
    setForm((current) => ({
      ...current,
      retireControlIds: current.retireControlIds.includes(controlId)
        ? current.retireControlIds.filter((id) => id !== controlId)
        : [...current.retireControlIds, controlId],
    }));
    setSuccess(null);
  };

  const toggleObligation = (obligationId) => {
    setForm((current) => ({
      ...current,
      newControlObligationIds: current.newControlObligationIds.includes(obligationId)
        ? current.newControlObligationIds.filter((id) => id !== obligationId)
        : [...current.newControlObligationIds, obligationId],
    }));
    setSuccess(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccess(null);
    try {
      const result = await apiRequest(`/api/compliance/systems/${system.id}/changes`, {
        method: "POST",
        body: {
          title: form.title,
          summary: form.summary,
          proposedVersion: form.proposedVersion,
          effectiveDate: form.effectiveDate,
          changeType: form.changeType,
          riskLevel: form.riskLevel,
          author: form.author,
          retireControlIds: form.retireControlIds,
          newControl: form.newControlTitle
            ? {
                title: form.newControlTitle,
                description: form.newControlDescription,
                obligationIds: form.newControlObligationIds,
              }
            : null,
        },
      });
      setSelectedChangeId(result.change.id);
      setSuccess(
        `Simulation ${result.change.id} persisted with ${result.invalidations.length} evidence invalidation${result.invalidations.length === 1 ? "" : "s"}.`,
      );
      setForm((current) => ({
        ...current,
        title: "",
        summary: "",
        proposedVersion: nextVersion(result.change.proposedVersion),
        retireControlIds: [],
        newControlTitle: "",
        newControlDescription: "",
      }));
      await refresh();
    } catch (submitError) {
      setFormError(submitError.message || "Unable to simulate this change.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Panel>
          <PanelHeader
            title="Compliance change simulator"
            description="Create a proposed system version and calculate control, obligation, risk, and evidence impact."
            action={<Badge variant="info">Baseline {system.baselineVersion}</Badge>}
          />
          <form className="space-y-5 p-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="change-title" className="mb-1.5 block text-xs font-medium text-slate-300">
                Change title
              </label>
              <input
                id="change-title"
                className={inputStyles}
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Retire quarterly access review and add continuous review"
                maxLength={120}
                required
              />
            </div>

            <div>
              <label htmlFor="change-summary" className="mb-1.5 block text-xs font-medium text-slate-300">
                Change summary
              </label>
              <textarea
                id="change-summary"
                className={`${inputStyles} h-24 resize-y py-2`}
                value={form.summary}
                onChange={(event) => update("summary", event.target.value)}
                placeholder="Explain what changes in the proposed version and why."
                maxLength={1200}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="proposed-version" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Proposed version
                </label>
                <input
                  id="proposed-version"
                  className={inputStyles}
                  value={form.proposedVersion}
                  onChange={(event) => update("proposedVersion", event.target.value)}
                  maxLength={40}
                  required
                />
              </div>
              <div>
                <label htmlFor="effective-date" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Effective date
                </label>
                <input
                  id="effective-date"
                  type="date"
                  className={inputStyles}
                  value={form.effectiveDate}
                  onChange={(event) => update("effectiveDate", event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="change-type" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Change type
                </label>
                <Select
                  id="change-type"
                  value={form.changeType}
                  onChange={(event) => update("changeType", event.target.value)}
                >
                  {changeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="risk-level" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Risk rating
                </label>
                <Select
                  id="risk-level"
                  value={form.riskLevel}
                  onChange={(event) => update("riskLevel", event.target.value)}
                >
                  {riskLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="author" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Author
                </label>
                <input
                  id="author"
                  className={inputStyles}
                  value={form.author}
                  onChange={(event) => update("author", event.target.value)}
                  maxLength={80}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-300">Retire baseline controls</p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Removing a control invalidates evidence linked through its obligations.
                  </p>
                </div>
                <Badge variant={form.retireControlIds.length ? "danger" : "default"}>
                  {form.retireControlIds.length} selected
                </Badge>
              </div>
              <div className="space-y-2">
                {system.baseline.controls.map((control) => (
                  <label
                    key={control.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                      form.retireControlIds.includes(control.id)
                        ? "border-rose-400/25 bg-rose-400/[0.06]"
                        : "border-line bg-shell/50 hover:border-accent/25"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-rose-500"
                      checked={form.retireControlIds.includes(control.id)}
                      onChange={() => toggleRetired(control.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-200">
                          {control.title}
                        </span>
                        <Badge variant={statusVariant(control.risk)}>{control.risk}</Badge>
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-500">
                        {control.id} · {control.owner} · {control.obligationIds.join(", ")}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-shell/50 p-4">
              <div className="flex items-center gap-2">
                <PlusCircle size={15} className="text-emerald-300" />
                <p className="text-xs font-medium text-slate-300">Add a proposed control</p>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Optional. Add a new control and map it to the obligations it covers.
              </p>
              <div className="mt-3 space-y-3">
                <input
                  className={inputStyles}
                  value={form.newControlTitle}
                  onChange={(event) => update("newControlTitle", event.target.value)}
                  placeholder="New control title"
                  maxLength={120}
                />
                <textarea
                  className={`${inputStyles} h-20 resize-y py-2`}
                  value={form.newControlDescription}
                  onChange={(event) => update("newControlDescription", event.target.value)}
                  placeholder="Control description"
                  maxLength={500}
                />
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                    Obligations covered
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {system.baseline.obligations.map((obligation) => {
                      const selected = form.newControlObligationIds.includes(obligation.id);
                      return (
                        <button
                          key={obligation.id}
                          type="button"
                          onClick={() => toggleObligation(obligation.id)}
                          className={`rounded-lg border px-2 py-1.5 text-[10px] transition-colors ${
                            selected
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                              : "border-line bg-shell/50 text-slate-500 hover:text-slate-300"
                          }`}
                          aria-pressed={selected}
                        >
                          {obligation.id} · {obligation.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {formError ? (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2.5 text-xs text-rose-200">
                {formError}
              </div>
            ) : null}
            {success ? (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2.5 text-xs text-emerald-200">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            ) : null}

            <Button type="submit" variant="primary" disabled={submitting}>
              <FlaskConical size={15} />
              {submitting ? "Running simulation..." : "Simulate and persist change"}
            </Button>
          </form>
        </Panel>

        <Panel>
          <PanelHeader
            title="Simulation history"
            description="Persisted proposed versions for this system."
            action={<Badge variant="default">{changes.length} records</Badge>}
          />
          {changes.length ? (
            <div className="divide-y divide-line/70">
              {changes.map((change) => (
                <button
                  key={change.id}
                  type="button"
                  onClick={() => setSelectedChangeId(change.id)}
                  className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-raised/40 ${
                    activeChange?.id === change.id ? "bg-accent/[0.06]" : ""
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-raised/60 text-accent">
                    <GitCompareArrows size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-200">{change.title}</span>
                      <Badge variant={statusVariant(change.riskLevel)}>{change.riskLevel}</Badge>
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      {change.id} · {change.baselineVersion} → {change.proposedVersion} ·{" "}
                      {formatDateTime(change.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FlaskConical}
              title="No simulated changes yet"
              description="Create a proposed version to populate the simulator and evidence invalidation workflow."
            />
          )}
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel className="xl:sticky xl:top-24">
          <PanelHeader
            title="Active simulation"
            description={
              activeChange
                ? `Effective ${formatDate(activeChange.effectiveDate)} · ${activeChange.changeType}`
                : "The latest simulation result appears here."
            }
          />
          <div className="p-5">
            {activeChange ? (
              <SimulationDetail change={activeChange} system={system} />
            ) : (
              <EmptyState
                icon={FlaskConical}
                title="Simulation results pending"
                description="Submit the form to compare baseline and proposed system versions."
              />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
