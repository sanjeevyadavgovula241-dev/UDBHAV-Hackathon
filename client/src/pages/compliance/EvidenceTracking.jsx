import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileWarning,
  History,
  Link2,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  User,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Panel, { PanelHeader } from "../../components/ui/Panel";
import { SearchInput, Select, inputStyles } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/States";
import { apiRequest } from "../../lib/api";
import { formatDate, formatDateTime } from "../../lib/format";
import { statusVariant } from "../../lib/status";

const filters = ["All", "Invalidated", "Valid", "Revalidated"];

function EvidenceMeta({ icon: Icon, label, value }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500">
      <Icon size={12} className="shrink-0 text-slate-600" />
      <span className="truncate">
        {label ? `${label}: ` : ""}
        {value}
      </span>
    </span>
  );
}

export default function EvidenceTracking() {
  const { bundle, refresh } = useOutletContext();
  const { system, changes } = bundle;
  const evidence = bundle.system.evidence;
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    version: system.baselineVersion,
    reviewer: "Compliance reviewer",
    rationale: "",
  });

  const counts = useMemo(
    () => ({
      total: evidence.length,
      invalidated: evidence.filter((item) => item.status === "Invalidated").length,
      valid: evidence.filter((item) => item.status === "Valid").length,
      revalidated: evidence.filter((item) => item.status === "Revalidated").length,
    }),
    [evidence],
  );

  const versionOptions = useMemo(
    () => [
      ...new Set([
        system.baselineVersion,
        ...changes.map((change) => change.proposedVersion),
      ]),
    ],
    [changes, system.baselineVersion],
  );

  const visibleEvidence = useMemo(() => {
    const term = query.trim().toLowerCase();
    return evidence.filter((item) => {
      const matchesFilter = filter === "All" || item.status === filter;
      const matchesQuery =
        !term ||
        `${item.id} ${item.title} ${item.owner} ${item.type}`
          .toLowerCase()
          .includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [evidence, filter, query]);

  const selected = evidence.find((item) => item.id === selectedId) ?? null;
  const selectedPending = selected?.invalidations.filter(
    (entry) => entry.status === "pending",
  ) ?? [];

  const openEvidence = (item) => {
    setSelectedId(item.id);
    const pending = item.invalidations.find((entry) => entry.status === "pending");
    setReviewForm((current) => ({
      ...current,
      version: pending?.toVersion ?? item.validForVersion ?? system.baselineVersion,
      rationale: "",
    }));
    setFormError(null);
    setSuccess(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setFormError(null);
    setSuccess(null);
    try {
      const result = await apiRequest(
        `/api/compliance/systems/${system.id}/evidence/${selected.id}/revalidate`,
        {
          method: "POST",
          body: reviewForm,
        },
      );
      setSuccess(
        `${selected.id} revalidated for ${reviewForm.version} by ${result.review.reviewer}.`,
      );
      setReviewForm((current) => ({ ...current, rationale: "" }));
      await refresh();
    } catch (submitError) {
      setFormError(submitError.message || "Unable to revalidate this evidence.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Evidence items", counts.total, "default"],
            ["Valid", counts.valid, "success"],
            ["Invalidated", counts.invalidated, "danger"],
            ["Revalidated", counts.revalidated, "info"],
          ].map(([label, value, tone]) => (
            <Panel key={label} className="p-4">
              <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">{label}</p>
              <p
                className={`mt-1.5 text-xl font-semibold ${
                  tone === "danger"
                    ? "text-rose-300"
                    : tone === "success"
                      ? "text-emerald-300"
                      : tone === "info"
                        ? "text-cyan-300"
                        : "text-ink"
                }`}
              >
                {value}
              </p>
            </Panel>
          ))}
        </div>

        <Panel>
          <PanelHeader
            title="Evidence tracking"
            description="Baseline evidence is demo data. Review decisions and version validity are persisted."
            action={<Badge variant="info">Version-aware</Badge>}
          />
          <div className="space-y-3 border-b border-line/70 p-4">
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search evidence, owner, or ID..."
              aria-label="Search evidence"
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
                  {option !== "All"
                    ? ` · ${evidence.filter((item) => item.status === option).length}`
                    : ""}
                </button>
              ))}
            </div>
          </div>

          {visibleEvidence.length ? (
            <div className="divide-y divide-line/70">
              {visibleEvidence.map((item) => {
                const pending = item.invalidations.filter(
                  (entry) => entry.status === "pending",
                );
                return (
                  <div
                    key={item.id}
                    className={`px-5 py-4 transition-colors ${
                      selected?.id === item.id ? "bg-accent/[0.05]" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <button
                        type="button"
                        onClick={() => openEvidence(item)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                          <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                          <Badge variant="default">{item.type}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                          <EvidenceMeta icon={ScanSearch} label="ID" value={item.id} />
                          <EvidenceMeta icon={User} label="Owner" value={item.owner} />
                          <EvidenceMeta
                            icon={CalendarDays}
                            label="Collected"
                            value={formatDate(item.collectedAt)}
                          />
                          <EvidenceMeta
                            icon={ShieldCheck}
                            label="Valid for"
                            value={item.validForVersion}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Link2 size={12} className="text-slate-600" />
                          {item.controlIds.map((controlId) => (
                            <span
                              key={controlId}
                              className="rounded-md border border-line bg-raised/50 px-1.5 py-0.5 text-[9px] text-slate-500"
                            >
                              {controlId}
                            </span>
                          ))}
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        {pending.length ? (
                          <Button variant="secondary" size="sm" onClick={() => openEvidence(item)}>
                            <RotateCcw size={13} />
                            Revalidate
                          </Button>
                        ) : null}
                        {item.latestReview ? (
                          <span className="text-[10px] text-slate-600">
                            Reviewed {formatDateTime(item.latestReview.createdAt)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {pending.length ? (
                      <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2">
                        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-200">
                          <FileWarning size={12} />
                          Dependency invalidation
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-rose-100/70">
                          {pending.map((entry) => `${entry.fromVersion} → ${entry.toVersion}`).join(", ")}
                          {" · "}
                          {pending[0].reason}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={ScanSearch}
              title="No evidence matches this view"
              description="Clear the search or choose another status filter."
            />
          )}
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel className="xl:sticky xl:top-24">
          <PanelHeader
            title={selected ? "Evidence review" : "Select evidence"}
            description={
              selected
                ? `${selected.id} · ${selected.status}`
                : "Choose an evidence item to inspect dependencies or revalidate it."
            }
          />
          <div className="p-5">
            {!selected ? (
              <EmptyState
                icon={ScanSearch}
                title="No evidence selected"
                description="Select an evidence row to review its control links and version history."
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{selected.title}</h3>
                    <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-lg border border-line bg-shell/50 px-2.5 py-2">
                      <p className="text-slate-600">Baseline validity</p>
                      <p className="mt-1 text-slate-300">{selected.validForVersion}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-shell/50 px-2.5 py-2">
                      <p className="text-slate-600">Owner</p>
                      <p className="mt-1 text-slate-300">{selected.owner}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                    Linked controls
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.controlIds.map((controlId) => (
                      <span
                        key={controlId}
                        className="rounded-lg border border-line bg-raised/50 px-2 py-1 text-[10px] text-slate-400"
                      >
                        {controlId}
                      </span>
                    ))}
                  </div>
                </div>

                {selected.invalidations.length ? (
                  <div>
                    <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                      Version invalidations
                    </p>
                    <div className="space-y-1.5">
                      {selected.invalidations.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-lg border border-line bg-shell/50 px-2.5 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-300">
                              {entry.fromVersion} → {entry.toVersion}
                            </span>
                            <Badge
                              variant={entry.status === "pending" ? "danger" : "success"}
                            >
                              {entry.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[10px] text-slate-500">{entry.reason}</p>
                          {entry.revalidatedBy ? (
                            <p className="mt-1 text-[10px] text-emerald-300/70">
                              Revalidated by {entry.revalidatedBy} ·{" "}
                              {formatDateTime(entry.revalidatedAt)}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedPending.length ? (
                  <form className="space-y-3" onSubmit={onSubmit}>
                    <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-2.5 py-2 text-[10px] leading-relaxed text-amber-100/70">
                      This evidence is invalidated for the selected proposed version. A
                      revalidation is required before the review pack is audit-ready.
                    </div>
                    <div>
                      <label htmlFor="evidence-version" className="mb-1.5 block text-[11px] font-medium text-slate-300">
                        Version under review
                      </label>
                      <Select
                        id="evidence-version"
                        value={reviewForm.version}
                        onChange={(event) =>
                          setReviewForm((current) => ({
                            ...current,
                            version: event.target.value,
                          }))
                        }
                      >
                        {versionOptions.map((version) => (
                          <option key={version} value={version}>
                            {version}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="evidence-reviewer" className="mb-1.5 block text-[11px] font-medium text-slate-300">
                        Reviewer
                      </label>
                      <input
                        id="evidence-reviewer"
                        className={inputStyles}
                        value={reviewForm.reviewer}
                        onChange={(event) =>
                          setReviewForm((current) => ({
                            ...current,
                            reviewer: event.target.value,
                          }))
                        }
                        maxLength={80}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="evidence-rationale" className="mb-1.5 block text-[11px] font-medium text-slate-300">
                        Review rationale
                      </label>
                      <textarea
                        id="evidence-rationale"
                        className={`${inputStyles} h-24 resize-y py-2`}
                        value={reviewForm.rationale}
                        onChange={(event) =>
                          setReviewForm((current) => ({
                            ...current,
                            rationale: event.target.value,
                          }))
                        }
                        placeholder="Explain why this evidence remains valid for the proposed version."
                        maxLength={800}
                        required
                      />
                    </div>
                    {formError ? (
                      <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-2.5 py-2 text-[11px] text-rose-200">
                        {formError}
                      </div>
                    ) : null}
                    <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                      <RotateCcw size={14} />
                      {submitting ? "Persisting review..." : "Revalidate evidence"}
                    </Button>
                  </form>
                ) : (
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-2 text-[11px] text-emerald-200">
                    No pending invalidation for this evidence.
                    {selected.latestReview
                      ? ` Last reviewed by ${selected.latestReview.reviewer}.`
                      : ""}
                  </div>
                )}

                {success ? (
                  <div className="flex items-start gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-2 text-[11px] text-emerald-200">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                ) : null}

                {selected.reviewHistory?.length ? (
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-600">
                      <History size={12} />
                      Review history
                    </p>
                    <div className="space-y-1.5">
                      {selected.reviewHistory.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-lg border border-line bg-shell/50 px-2.5 py-2"
                        >
                          <p className="text-[10px] text-slate-300">
                            {review.version} · {review.reviewer}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">{review.rationale}</p>
                          <p className="mt-1 text-[9px] text-slate-600">
                            {formatDateTime(review.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Link
                  to="../oversight"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-strong"
                >
                  Continue to human oversight
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
