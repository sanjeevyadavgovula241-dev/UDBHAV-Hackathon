import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Mail,
  Printer,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { downloadCsv } from "../../lib/download";

export default function ReportPreviewCard({ report }) {
  const [copied, setCopied] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("audit-team@acme-corp.com");
  const [emailSent, setEmailSent] = useState(false);

  const handleDownloadCsv = () => {
    if (!report.rawCsvData) return;
    const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.csv`;
    downloadCsv(filename, report.rawCsvData);
  };

  const handleCopyClipboard = () => {
    const markdown = `# ${report.title}
**Framework:** ${report.framework}
**Generated:** ${report.generatedAt}
**Reference:** ${report.id}
**Prepared by:** ${report.preparedBy}
**Readiness Score:** ${report.score}% (${report.status})

## Executive Summary
${report.executiveSummary}

## Key Metrics
${report.metrics.map((m) => `- ${m.label}: ${m.value} (${m.change})`).join("\n")}

## Domain Breakdown
${report.domains.map((d) => `- ${d.name}: ${d.score}% [${d.status}]`).join("\n")}

## Findings & Deficiencies
${report.findings.map((f) => `- [${f.severity}] ${f.id} (${f.domain}): ${f.issue} -> Action: ${f.remediation}`).join("\n")}

## Actionable Recommendations
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${report.title} - ${report.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      padding: 40px;
      margin: 0;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #0b1120;
    }
    .meta {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #0f172a;
    }
    .score-badge {
      font-size: 18px;
      font-weight: 700;
      color: #0f766e;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      padding: 6px 14px;
      border-radius: 8px;
    }
    h1 {
      font-size: 22px;
      margin: 12px 0 6px 0;
      color: #0f172a;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      font-size: 13px;
      line-height: 1.6;
      color: #334155;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 12px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
    }
    .card-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }
    .card-val {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #334155;
    }
    .severity {
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }
    .severity-High { background: #fee2e2; color: #991b1b; }
    .severity-Medium { background: #fef3c7; color: #92400e; }
    .severity-Low { background: #ecfdf5; color: #065f46; }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">ACME INTELLIGENCE</div>
      <div class="meta">AI Governance & Compliance Copilot System</div>
    </div>
    <div style="text-align: right;">
      <span class="score-badge">Readiness Score: ${report.score}%</span>
      <div class="meta" style="margin-top: 6px;">Ref: ${report.id}</div>
    </div>
  </div>

  <h1>${report.title}</h1>
  <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
    <span class="badge">${report.framework}</span>
    <span class="badge">${report.status}</span>
    <span class="meta">Generated: ${report.generatedAt}</span>
  </div>

  <div class="section-title">1. Executive Summary</div>
  <div class="summary">
    ${report.executiveSummary}
  </div>

  <div class="section-title">2. Key Performance Indicators</div>
  <div class="grid">
    ${report.metrics
      .map(
        (m) => `
      <div class="card">
        <div class="card-label">${m.label}</div>
        <div class="card-val">${m.value}</div>
        <div style="font-size: 10px; color: ${m.positive ? "#059669" : "#dc2626"}; margin-top: 2px;">${m.change}</div>
      </div>
    `,
      )
      .join("")}
  </div>

  <div class="section-title">3. Domain Control Scores</div>
  <table>
    <thead>
      <tr>
        <th>Control Domain</th>
        <th>Compliance Score</th>
        <th>Evaluation Status</th>
      </tr>
    </thead>
    <tbody>
      ${report.domains
        .map(
          (d) => `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td>${d.score}%</td>
          <td>${d.status}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="section-title">4. Deficiencies & Remediation Actions</div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Domain</th>
        <th>Severity</th>
        <th>Finding / Gap Description</th>
        <th>Remediation Action</th>
      </tr>
    </thead>
    <tbody>
      ${report.findings
        .map(
          (f) => `
        <tr>
          <td><code>${f.id}</code></td>
          <td>${f.domain}</td>
          <td><span class="severity severity-${f.severity}">${f.severity}</span></td>
          <td>${f.issue}</td>
          <td>${f.remediation}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="section-title">5. Priority Recommendations</div>
  <ol style="font-size: 12px; color: #334155; line-height: 1.7;">
    ${report.recommendations.map((r) => `<li>${r}</li>`).join("")}
  </ol>

  <div class="footer">
    <span>Acme Intelligence Executive Report · Prepared by ${report.preparedBy}</span>
    <span>Confidential · For Authorized Compliance Personnel Only</span>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
`);
    printWindow.document.close();
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    setEmailSent(true);
    window.setTimeout(() => {
      setEmailSent(false);
      setEmailModalOpen(false);
    }, 2000);
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-2xl border border-accent/25 bg-shell/95 shadow-2xl backdrop-blur-xl">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/80 bg-surface/70 px-5 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent shadow-sm">
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-bold uppercase tracking-wider text-accent">
                {report.framework}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Ref: {report.id}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Compiled {report.generatedAt} · {report.preparedBy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={report.score >= 90 ? "success" : report.score >= 80 ? "info" : "warning"}>
            <Sparkles size={11} />
            {report.score}% Readiness
          </Badge>
          <Badge variant="default">{report.riskLevel} Risk</Badge>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Title */}
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-ink">
            {report.title}
          </h3>
          {report.subtitle ? (
            <p className="mt-1 text-xs text-slate-400">{report.subtitle}</p>
          ) : null}
        </div>

        {/* Executive Summary */}
        <div className="rounded-xl border border-line bg-void/50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Executive Summary
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {report.executiveSummary}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {report.metrics.map((metric, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface/50 p-3 transition-colors hover:bg-surface/80"
            >
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {metric.label}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-ink tabular-nums">
                {metric.value}
              </p>
              <p
                className={`mt-0.5 text-[10px] font-medium ${
                  metric.positive ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {metric.change}
              </p>
            </div>
          ))}
        </div>

        {/* Domain Progress Breakdown */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
            Domain Compliance Breakdown
          </p>
          <div className="space-y-2">
            {report.domains.map((domain, i) => (
              <div key={i} className="rounded-xl border border-line bg-void/30 p-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{domain.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink tabular-nums">{domain.score}%</span>
                    <span className="text-[10px] text-slate-400">({domain.status})</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-void/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      domain.score >= 90
                        ? "bg-emerald-400"
                        : domain.score >= 80
                          ? "bg-accent"
                          : "bg-amber-400"
                    }`}
                    style={{ width: `${domain.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Findings Table */}
        {report.findings && report.findings.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
              Identified Deficiencies & Audit Gaps ({report.findings.length})
            </p>
            <div className="overflow-x-auto rounded-xl border border-line bg-void/40">
              <table className="w-full min-w-[540px] text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-surface/40 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-3.5 py-2.5 font-semibold">ID</th>
                    <th className="px-3.5 py-2.5 font-semibold">Domain</th>
                    <th className="px-3.5 py-2.5 font-semibold">Severity</th>
                    <th className="px-3.5 py-2.5 font-semibold">Finding</th>
                    <th className="px-3.5 py-2.5 font-semibold">Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {report.findings.map((f, i) => (
                    <tr key={i} className="hover:bg-surface/30 transition-colors">
                      <td className="px-3.5 py-2 font-mono text-[11px] text-accent">{f.id}</td>
                      <td className="px-3.5 py-2 text-slate-300 font-medium">{f.domain}</td>
                      <td className="px-3.5 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            f.severity === "Critical" || f.severity === "High"
                              ? "bg-rose-400/15 text-rose-300 border border-rose-400/30"
                              : f.severity === "Medium"
                                ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                                : "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30"
                          }`}
                        >
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-slate-300 leading-snug">{f.issue}</td>
                      <td className="px-3.5 py-2 text-slate-400 leading-snug">{f.remediation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 ? (
          <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              <Sparkles size={14} />
              Actionable Auditor Recommendations
            </div>
            <ul className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-accent">{i + 1}.</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line/80 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" onClick={handlePrintPdf} title="Generate PDF Document / Print">
              <Printer size={14} />
              Download PDF / Print
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownloadCsv} title="Export CSV Data">
              <FileSpreadsheet size={14} />
              Download CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopyClipboard} title="Copy Markdown Summary">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Summary"}
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setEmailModalOpen(true)}>
            <Mail size={14} />
            Email Report
          </Button>
        </div>
      </div>

      {/* Email Dispatch Modal */}
      {emailModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 px-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/80 animate-scale-in">
            <div className="flex items-center justify-between border-b border-line/80 pb-3">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <h4 className="text-sm font-semibold text-ink">Email Compliance Report</h4>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-shell hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            {emailSent ? (
              <div className="py-8 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400 border border-emerald-400/30">
                  <CheckCircle2 size={24} />
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">Report Dispatched!</p>
                <p className="mt-1 text-xs text-slate-400">
                  A cryptographic PDF copy has been sent to <strong>{emailAddress}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-line bg-shell px-3 text-xs text-ink placeholder:text-slate-500 focus:border-accent/60 focus:outline-none"
                    placeholder="auditor@company.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300">Subject</label>
                  <input
                    type="text"
                    readOnly
                    value={`[AUDIT-CONFIDENTIAL] ${report.title} (${report.id})`}
                    className="mt-1.5 h-10 w-full rounded-xl border border-line bg-void/60 px-3 text-xs text-slate-400"
                  />
                </div>
                <div className="rounded-xl border border-line bg-shell/50 p-3 text-[11px] text-slate-400">
                  Includes full executive briefing, domain breakdown, gap matrix, and digital signature seal.
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setEmailModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    <Mail size={14} />
                    Send Dispatch
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

