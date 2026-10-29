import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertOctagon,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Panel, { PanelHeader } from "../../components/ui/Panel";
import { Select, inputStyles } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/States";
import { apiRequest } from "../../lib/api";
import { oversightRoleLabels } from "../../lib/compliance";
import { formatDateTime } from "../../lib/format";
import { statusVariant } from "../../lib/status";

const reviewerRoles = ["analyst", "security_lead", "compliance_manager"];

function CheckRow({ check }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-line/70 bg-shell/50 px-2.5 py-2">
      {check.passed ? (
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-300" />
      ) : (
        <XCircle size={14} className="mt-0.5 shrink-0 text-rose-300" />
      )}
      <div>
        <p className="text-[11px] font-medium text-slate-200">{check.label}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{check.detail}</p>
      </div>
    </div>
  );
}

export default function OversightSandbox() {
  const { bundle, refresh } = useOutletContext();
  const { system } = bundle;
  const actions = bundle.oversight.actions;
  const runs = bundle.oversight.runs;
  const [form, setForm] = useState({
    actionId: actions[0]?.id ?? "",
    actorType: "human",
    actorName: "Compliance reviewer",
    role: "analyst",
    rationale: "",
    acknowledgeRisk: false,
  });
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [approval, setApproval] = useState({
    approverName: "Compliance manager",
    role: "compliance_manager",
    rationale: "",
    acknowledgeRisk: false,
  });
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState(null);

  const selectedAction = actions.find((action) => action.id === form.actionId) ?? actions[0];
  const stats = useMemo(
    () => ({
      approved: runs.filter((run) => run.status === "approved").length,
      blocked: runs.filter((run) => run.status === "blocked").length,
      pending: runs.filter((run) => run.status === "pending").length,
    }),
    [runs],
  );

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setResult(null);
    setFormError(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setApprovalError(null);
    try {
      const run = await apiRequest(
        `/api/compliance/systems/${system.id}/oversight/evaluate`,
        {
          method: "POST",
          body: {
            ...form,
            role: form.actorType === "human" ? form.role : undefined,
          },
        },
      );
      setResult(run);
      setApproval((current) => ({ ...current, rationale: "", acknowledgeRisk: false }));
      await refresh();
    } catch (submitError) {
      setFormError(submitError.message || "Unable to evaluate this synthetic action.");
    } finally {
      setSubmitting(false);
    }
  };

  const onApprove = async (event) => {
    event.preventDefault();
    if (!result) return;
    setApproving(true);
    setApprovalError(null);
    try {
      const run = await apiRequest(
        `/api/compliance/systems/${system.id}/oversight/runs/${result.id}/approve`,
        {
          method: "POST",
          body: approval,
        },
      );
      setResult(run);
      await refresh();
    } catch (submitError) {
      setApprovalError(submitError.message || "Unable to approve this run.");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Sandbox runs", runs.length, "default"],
          ["Approved", stats.approved, "success"],
          ["Blocked", stats.blocked, "danger"],
          ["Pending approval", stats.pending, "warning"],
        ].map(([label, value, tone]) => (
          <Panel key={label} className="p-4">
            <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">{label}</p>
            <p
              className={`mt-1.5 text-xl font-semibold ${
                tone === "danger"
                  ? "text-rose-300"
                  : tone === "success"
                    ? "text-emerald-300"
                    : tone === "warning"
                      ? "text-amber-200"
                      : "text-ink"
              }`}
            >
              {value}
            </p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Human oversight sandbox"
            description="Synthetic actions are checked by server-side policy before approval."
            action={<Badge variant="violet">Policy enforced</Badge>}
          />
          <form className="space-y-4 p-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="oversight-action" className="mb-1.5 block text-xs font-medium text-slate-300">
                Synthetic action
              </label>
              <Select
                id="oversight-action"
                value={form.actionId}
                onChange={(event) => update("actionId", event.target.value)}
              >
                {actions.map((action) => (
                  <option key={action.id} value={action.id}>
                    {action.label} · {action.riskLevel}
                  </option>
                ))}
              </Select>
              {selectedAction ? (
                <div className="mt-2 rounded-xl border border-line bg-shell/50 px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(selectedAction.riskLevel)}>
                      {selectedAction.riskLevel}
                    </Badge>
                    <Badge variant="default">{selectedAction.category}</Badge>
                    <span className="text-[10px] text-slate-600">Synthetic action</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    {selectedAction.description}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-600">
                    Authorized roles:{" "}
                    {selectedAction.allowedRoles
                      .map((role) => oversightRoleLabels[role] ?? role)
                      .join(", ")}
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-300">Actor type</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "human",
                    label: "Human reviewer",
                    description: "Can satisfy approval policy",
                    icon: UserCheck,
                  },
                  {
                    value: "ai",
                    label: "AI agent",
                    description: "Cannot self-approve",
                    icon: Bot,
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const selected = form.actorType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("actorType", option.value)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "border-accent/25 bg-accent/[0.1]"
                          : "border-line bg-shell/50 hover:border-accent/25"
                      }`}
                      aria-pressed={selected}
                    >
                      <span className="flex items-center gap-2 text-[11px] font-medium text-slate-200">
                        <Icon size={14} className={selected ? "text-accent" : "text-slate-500"} />
                        {option.label}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-600">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="actor-name" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Actor name
                </label>
                <input
                  id="actor-name"
                  className={inputStyles}
                  value={form.actorName}
                  onChange={(event) => update("actorName", event.target.value)}
                  maxLength={80}
                  required
                />
              </div>
              <div>
                <label htmlFor="actor-role" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Actor role
                </label>
                <Select
                  id="actor-role"
                  value={form.role}
                  onChange={(event) => update("role", event.target.value)}
                  disabled={form.actorType === "ai"}
                >
                  {reviewerRoles.map((role) => (
                    <option key={role} value={role}>
                      {oversightRoleLabels[role]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="oversight-rationale" className="mb-1.5 block text-xs font-medium text-slate-300">
                Rationale
              </label>
              <textarea
                id="oversight-rationale"
                className={`${inputStyles} h-24 resize-y py-2`}
                value={form.rationale}
                onChange={(event) => update("rationale", event.target.value)}
                placeholder="Explain why the action should be permitted, including compensating controls."
                minLength={8}
                maxLength={1000}
                required
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-shell/50 px-3 py-2.5">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-teal-500"
                checked={form.acknowledgeRisk}
                onChange={(event) => update("acknowledgeRisk", event.target.checked)}
              />
              <span>
                <span className="block text-[11px] font-medium text-slate-300">
                  I acknowledge the residual risk
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-600">
                  Required by the server for critical synthetic actions.
                </span>
              </span>
            </label>

            {formError ? (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2.5 text-xs text-rose-200">
                {formError}
              </div>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              <ShieldCheck size={15} />
              {submitting ? "Evaluating policy..." : "Run server-side oversight check"}
            </Button>
          </form>
        </Panel>

        <Panel className="xl:sticky xl:top-24 xl:self-start">
          <PanelHeader
            title="Oversight decision"
            description="The API records every check and decision in the audit store."
          />
          <div className="p-5">
            {!result ? (
              <EmptyState
                icon={LockKeyhole}
                title="No decision yet"
                description="Run a synthetic action to see whether human oversight policy allows it."
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      result.decision === "approved"
                        ? "success"
                        : result.decision === "escalated"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {result.decision}
                  </Badge>
                  <Badge variant={statusVariant(result.actionRisk)}>{result.actionRisk}</Badge>
                  <span className="text-[10px] text-slate-600">{result.id}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{result.actionLabel}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {result.reason}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-600">
                    {formatDateTime(result.createdAt)} · {result.actorName} ·{" "}
                    {oversightRoleLabels[result.role] ?? result.role}
                  </p>
                </div>

                <div className="space-y-1.5">
                  {result.checks.map((check) => (
                    <CheckRow key={check.id} check={check} />
                  ))}
                </div>

                {result.status === "pending" ? (
                  <form
                    className="space-y-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-3"
                    onSubmit={onApprove}
                  >
                    <div className="flex items-start gap-2">
                      <AlertOctagon size={15} className="mt-0.5 shrink-0 text-amber-300" />
                      <div>
                        <p className="text-[11px] font-semibold text-amber-100">
                          Escalated for compliance manager approval
                        </p>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-amber-100/60">
                          Approval is enforced by the backend and cannot be submitted by the
                          original actor.
                        </p>
                      </div>
                    </div>
                    <input
                      className={inputStyles}
                      value={approval.approverName}
                      onChange={(event) =>
                        setApproval((current) => ({
                          ...current,
                          approverName: event.target.value,
                        }))
                      }
                      placeholder="Approver name"
                      maxLength={80}
                      required
                    />
                    <textarea
                      className={`${inputStyles} h-20 resize-y py-2`}
                      value={approval.rationale}
                      onChange={(event) =>
                        setApproval((current) => ({
                          ...current,
                          rationale: event.target.value,
                        }))
                      }
                      placeholder="Approval rationale"
                      maxLength={800}
                      required
                    />
                    <label className="flex items-start gap-2 text-[10px] text-slate-400">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-3.5 w-3.5 accent-amber-500"
                        checked={approval.acknowledgeRisk}
                        onChange={(event) =>
                          setApproval((current) => ({
                            ...current,
                            acknowledgeRisk: event.target.checked,
                          }))
                        }
                      />
                      Approver acknowledges the residual risk.
                    </label>
                    {approvalError ? (
                      <p className="text-[10px] text-rose-300">{approvalError}</p>
                    ) : null}
                    <Button type="submit" variant="secondary" className="w-full" disabled={approving}>
                      <ClipboardCheck size={14} />
                      {approving ? "Approving..." : "Approve escalated run"}
                    </Button>
                  </form>
                ) : null}

                {result.approval ? (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                      Approved by {result.approval.approverName}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-emerald-100/60">
                      {result.approval.rationale}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Recent sandbox runs"
          description="Persisted policy evaluations for this system."
          action={<Badge variant="default">{runs.length} runs</Badge>}
        />
        {runs.length ? (
          <div className="divide-y divide-line/70">
            {runs.map((run) => (
              <div
                key={run.id}
                className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-200">
                      {run.actionLabel}
                    </span>
                    <Badge variant={statusVariant(run.actionRisk)}>{run.actionRisk}</Badge>
                    <Badge
                      variant={
                        run.decision === "approved"
                          ? "success"
                          : run.decision === "escalated"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {run.decision}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {run.actorName} · {oversightRoleLabels[run.role] ?? run.role} ·{" "}
                    {formatDateTime(run.createdAt)}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-600">
                    {run.invalidationReason ?? run.reason}
                  </p>
                  {run.invalidatedByChangeId ? (
                    <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-rose-300/70">
                      Invalidated by {run.invalidatedByChangeId}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-[9px] uppercase tracking-[0.14em] text-slate-600">
                  {run.source}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="No oversight runs yet"
            description="Evaluate a synthetic action to begin the approval trail."
          />
        )}
      </Panel>
    </div>
  );
}
