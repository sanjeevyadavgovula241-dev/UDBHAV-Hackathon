import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ClipboardList,
  Download,
  FileText,
  FileWarning,
  Sparkles,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Panel, { PanelHeader } from "../../components/ui/Panel";
import { Select, inputStyles } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/States";
import { apiRequest } from "../../lib/api";
import { downloadText } from "../../lib/download";
import { formatDateTime } from "../../lib/format";
import { statusVariant } from "../../lib/status";

export default function ChangeReviewPack() {
  const { bundle, refresh } = useOutletContext();
  const { system, changes, reviewPacks } = bundle;
  const [selectedChangeId, setSelectedChangeId] = useState(changes[0]?.id ?? "");
  const [preparedBy, setPreparedBy] = useState("Compliance reviewer");
  const [notes, setNotes] = useState("");
  const [pack, setPack] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loadingPack, setLoadingPack] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const selectedChange = changes.find((change) => change.id === selectedChangeId) ?? null;
  const changeInvalidations = useMemo(
    () =>
      bundle.invalidations.filter(
        (entry) => entry.changeId === selectedChangeId,
      ),
    [bundle.invalidations, selectedChangeId],
  );
  const pendingInvalidations = changeInvalidations.filter(
    (entry) => entry.status === "pending",
  );

  const generate = async (event) => {
    event.preventDefault();
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const generated = await apiRequest(
        `/api/compliance/systems/${system.id}/review-packs`,
        {
          method: "POST",
          body: {
            changeId: selectedChangeId,
            preparedBy,
            notes,
          },
        },
      );
      setPack(generated);
      setSuccess(`Review pack ${generated.id} generated and persisted.`);
      await refresh();
    } catch (generateError) {
      setError(generateError.message || "Unable to generate the review pack.");
    } finally {
      setGenerating(false);
    }
  };

  const openPack = async (packId) => {
    setLoadingPack(true);
    setError(null);
    setSuccess(null);
    try {
      const fullPack = await apiRequest(`/api/compliance/review-packs/${packId}`);
      setPack(fullPack);
    } catch (loadError) {
      setError(loadError.message || "Unable to load the review pack.");
    } finally {
      setLoadingPack(false);
    }
  };

  if (!changes.length) {
    return (
      <Panel>
        <EmptyState
          icon={ClipboardList}
          title="Generate a simulation first"
          description="A review pack needs a persisted proposed version. Run the change simulator to create one."
          action={
            <Link to="../changes/new">
              <Button variant="primary">
                <Sparkles size={14} />
                Open change simulator
              </Button>
            </Link>
          }
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]">
        <Panel>
          <PanelHeader
            title="Generate change review pack"
            description="Packages the chosen proposed version, evidence impact, oversight decisions, and audit activity."
            action={<Badge variant="violet">Server-generated report</Badge>}
          />
          <form className="space-y-4 p-5" onSubmit={generate}>
            <div>
              <label htmlFor="review-pack-change" className="mb-1.5 block text-xs font-medium text-slate-300">
                Proposed change
              </label>
              <Select
                id="review-pack-change"
                value={selectedChangeId}
                onChange={(event) => {
                  setSelectedChangeId(event.target.value);
                  setPack(null);
                  setSuccess(null);
                  setError(null);
                }}
              >
                {changes.map((change) => (
                  <option key={change.id} value={change.id}>
                    {change.proposedVersion} · {change.title}
                  </option>
                ))}
              </Select>
            </div>

            {selectedChange ? (
              <div className="rounded-xl border border-line bg-shell/50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">{selectedChange.baselineVersion}</Badge>
                  <span className="text-slate-600">→</span>
                  <Badge variant="violet">{selectedChange.proposedVersion}</Badge>
                  <Badge variant={statusVariant(selectedChange.riskLevel)}>
                    {selectedChange.riskLevel}
                  </Badge>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  {selectedChange.summary}
                </p>
                <p className="mt-2 text-[10px] text-slate-600">
                  {changeInvalidations.length} evidence invalidation
                  {changeInvalidations.length === 1 ? "" : "s"} ·{" "}
                  {pendingInvalidations.length} pending
                </p>
              </div>
            ) : null}

            {pendingInvalidations.length ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2.5">
                <FileWarning size={14} className="mt-0.5 shrink-0 text-amber-300" />
                <div className="text-[10px] leading-relaxed text-amber-100/70">
                  This pack will still generate, but {pendingInvalidations.length} evidence
                  item{pendingInvalidations.length === 1 ? "" : "s"} remain invalidated.{" "}
                  <Link to="../evidence" className="font-medium text-amber-200 hover:text-amber-100">
                    Review evidence
                  </Link>
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="prepared-by" className="mb-1.5 block text-xs font-medium text-slate-300">
                Prepared by
              </label>
              <input
                id="prepared-by"
                className={inputStyles}
                value={preparedBy}
                onChange={(event) => setPreparedBy(event.target.value)}
                maxLength={80}
                required
              />
            </div>

            <div>
              <label htmlFor="pack-notes" className="mb-1.5 block text-xs font-medium text-slate-300">
                Review notes
              </label>
              <textarea
                id="pack-notes"
                className={`${inputStyles} h-24 resize-y py-2`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional context for reviewers and auditors."
                maxLength={2000}
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2.5 text-xs text-rose-200">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2.5 text-xs text-emerald-200">
                {success}
              </div>
            ) : null}

            <Button type="submit" variant="primary" className="w-full" disabled={generating || !selectedChange}>
              <FileText size={15} />
              {generating ? "Generating report..." : "Generate and persist review pack"}
            </Button>
          </form>
        </Panel>

        <Panel>
          <PanelHeader
            title="Review pack preview"
            description={
              pack
                ? `${pack.id} · ${formatDateTime(pack.generatedAt)}`
                : "Generate or select a persisted review pack."
            }
            action={
              pack ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    downloadText(`${pack.id}-change-review.md`, pack.report)
                  }
                >
                  <Download size={13} />
                  Download report
                </Button>
              ) : null
            }
          />
          <div className="p-5">
            {loadingPack ? (
              <div className="flex min-h-[280px] items-center justify-center text-xs text-slate-500">
                Loading persisted pack...
              </div>
            ) : pack ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["Pending evidence", pack.summary.pendingInvalidations, "danger"],
                    ["Invalidations", pack.summary.totalInvalidations, "default"],
                    ["Residual risk", pack.summary.residualRisk, "warning"],
                    ["Oversight runs", pack.summary.oversightRuns, "default"],
                  ].map(([label, value, tone]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-line bg-shell/50 p-3"
                    >
                      <p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                        {label}
                      </p>
                      <p
                        className={`mt-1.5 text-sm font-semibold ${
                          tone === "danger" && value
                            ? "text-rose-300"
                            : tone === "warning"
                              ? "text-amber-200"
                              : "text-slate-200"
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="max-h-[520px] overflow-auto rounded-xl border border-line bg-void p-4">
                  <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-slate-400">
                    {pack.report}
                  </pre>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No pack selected"
                description="Generate a new review pack or open one from the persisted pack history."
              />
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Persisted review packs"
          description="Generated packs retain a snapshot of the change, evidence, oversight, and activity state."
          action={<Badge variant="default">{reviewPacks.length} packs</Badge>}
        />
        {reviewPacks.length ? (
          <div className="divide-y divide-line/70">
            {reviewPacks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openPack(item.id)}
                className={`flex w-full flex-col gap-2 px-5 py-3 text-left transition-colors hover:bg-raised/40 sm:flex-row sm:items-center sm:justify-between ${
                  pack?.id === item.id ? "bg-accent/[0.06]" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-200">{item.id}</span>
                    <Badge variant="info">{item.proposedVersion}</Badge>
                    <Badge variant={statusVariant(item.summary.residualRisk)}>
                      {item.summary.residualRisk} residual
                    </Badge>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {item.changeTitle} · prepared by {item.preparedBy}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-600">
                    {formatDateTime(item.generatedAt)} · {item.summary.pendingInvalidations}{" "}
                    pending evidence · {item.summary.oversightRuns} oversight runs
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-medium text-accent/80">
                  Open pack
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No review packs yet"
            description="Generate a review pack to create a persisted audit artifact."
          />
        )}
      </Panel>
    </div>
  );
}
