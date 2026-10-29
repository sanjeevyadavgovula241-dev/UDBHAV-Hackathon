// Comprehensive mock data & report generation engine
// Supports:
// 1. Financial Performance & Profitability Report
// 2. Employees Details & Workforce Compensation Report
// 3. Total Investment & Capital Allocation Report
// 4. SOC 2 Type II Compliance & Gap Report
// 5. High-Risk Evidence & Invalidation Summary
// 6. Audit Trail & Chronological Activity Log
// 7. ISO/IEC 27001:2022 ISMS Surveillance Report
// 8. HIPAA Security Rule Technical Safeguards Report
// 9. GDPR Data Protection & Consent Lifecycle Audit

export const complianceFrameworks = [
  {
    id: "soc2",
    name: "SOC 2 Type II",
    version: "2024 Trust Services Criteria",
    category: "Security & Confidentiality",
    score: 87,
    status: "Compliant with minor gaps",
    riskLevel: "Medium",
    totalControls: 32,
    passedControls: 28,
    gapControls: 4,
    leadAuditor: "Grant Thornton LLP",
    reviewPeriod: "Oct 1, 2025 – Sep 30, 2026",
    domains: [
      { name: "Common Criteria (CC6.1-CC6.8 Access)", score: 92, status: "Strong" },
      { name: "Encryption & Key Management (CC6.6-CC6.7)", score: 95, status: "Strong" },
      { name: "Change Management & Simulation (CC8.1)", score: 84, status: "Adequate" },
      { name: "Risk Assessment & Mitigation (CC3.1-CC3.4)", score: 78, status: "Needs Review" },
      { name: "Incident Response & Oversight (CC7.2-CC7.4)", score: 88, status: "Strong" },
    ],
    findings: [
      { id: "GAP-SOC2-01", domain: "Change Management", severity: "Medium", issue: "Standing administrative access detected on Atlas CDP database replica.", remediation: "Implement time-bound break-glass access review workflow." },
      { id: "GAP-SOC2-02", domain: "Risk Assessment", severity: "High", issue: "One evidence artifact (Restore test report) invalidated following schema migration.", remediation: "Re-execute quarterly disaster recovery simulation and capture signed proof." },
      { id: "GAP-SOC2-03", domain: "Access Control", severity: "Low", issue: "Quarterly role recertification completed with 3 business days delay.", remediation: "Automate calendar alerts for departmental access recertifications." },
      { id: "GAP-SOC2-04", domain: "Incident Response", severity: "Low", issue: "Annual tabletop security exercise pending scheduled slot in Q4.", remediation: "Confirm exercise date with Security Engineering Lead." },
    ],
    recommendations: [
      "Prioritize revalidation of disaster recovery test evidence to maintain uninterrupted SOC 2 audit readiness.",
      "Enforce multi-party human oversight approval on all production schema changes exceeding Medium risk threshold.",
      "Integrate automated evidence hashing for CI/CD deployment pipelines."
    ],
  },
  {
    id: "iso27001",
    name: "ISO/IEC 27001:2022",
    version: "Annex A Controls Matrix",
    category: "Information Security Management",
    score: 92,
    status: "Audit Ready",
    riskLevel: "Low",
    totalControls: 93,
    passedControls: 86,
    gapControls: 7,
    leadAuditor: "BSI Group",
    reviewPeriod: "Calendar Year 2026",
    domains: [
      { name: "A.5 Organizational Controls", score: 94, status: "Strong" },
      { name: "A.6 People Controls", score: 96, status: "Strong" },
      { name: "A.7 Physical Controls", score: 90, status: "Strong" },
      { name: "A.8 Technological Controls", score: 88, status: "Adequate" },
    ],
    findings: [
      { id: "GAP-ISO-01", domain: "A.8 Technological Controls", severity: "Medium", issue: "Data leak prevention policies require updated regex for synthetic dataset exports.", remediation: "Refine DLP filter rules to include test credit card tokens." },
      { id: "GAP-ISO-02", domain: "A.5 Organizational Controls", severity: "Low", issue: "Supplier security evaluations pending for 2 new tier-3 analytics vendors.", remediation: "Dispatch standard SIG-Lite questionnaires to vendors." },
    ],
    recommendations: [
      "Finalize internal audit cycle for Technological Controls before external stage-2 surveillance audit.",
      "Review Statement of Applicability (SoA) to verify updated risk treatment methodology."
    ],
  },
  {
    id: "hipaa",
    name: "HIPAA Security Rule",
    version: "45 CFR Part 160 & Part 164 Subparts A/C",
    category: "Healthcare & ePHI Protection",
    score: 94,
    status: "Compliant",
    riskLevel: "Low",
    totalControls: 42,
    passedControls: 40,
    gapControls: 2,
    leadAuditor: "Internal Compliance Committee",
    reviewPeriod: "Trailing 12 Months",
    domains: [
      { name: "Administrative Safeguards (§ 164.308)", score: 95, status: "Strong" },
      { name: "Physical Safeguards (§ 164.310)", score: 98, status: "Strong" },
      { name: "Technical Safeguards (§ 164.312)", score: 91, status: "Strong" },
      { name: "ePHI Encryption & Integrity (§ 164.312(a)(2)(iv))", score: 96, status: "Strong" },
    ],
    findings: [
      { id: "GAP-HIPAA-01", domain: "Technical Safeguards", severity: "Medium", issue: "Audit log archive retention lifecycle policy requires explicit 6-year freeze trigger.", remediation: "Apply AWS S3 Object Lock compliance retention mode to cold audit vaults." },
      { id: "GAP-HIPAA-02", domain: "Administrative Safeguards", severity: "Low", issue: "Security awareness refresher training overdue for 1 contract employee.", remediation: "Send automated mandatory compliance LMS training notification." },
    ],
    recommendations: [
      "Maintain active Business Associate Agreements (BAAs) with all sub-processors handling client telemetry.",
      "Verify TLS 1.3 enforcement across all API endpoints ingesting regulated data."
    ],
  },
  {
    id: "gdpr",
    name: "GDPR & EU Privacy Regulation",
    version: "Regulation (EU) 2016/679",
    category: "Data Privacy & Subject Rights",
    score: 89,
    status: "Compliant with advisory notes",
    riskLevel: "Medium",
    totalControls: 26,
    passedControls: 23,
    gapControls: 3,
    leadAuditor: "Data Protection Officer (DPO)",
    reviewPeriod: "Active Fiscal Year",
    domains: [
      { name: "Article 25: Data Protection by Design & Default", score: 86, status: "Adequate" },
      { name: "Article 30: Records of Processing Activities (RoPA)", score: 92, status: "Strong" },
      { name: "Article 32: Security of Processing & Pseudonymization", score: 94, status: "Strong" },
      { name: "Article 33-34: Breach Notification Procedures", score: 90, status: "Strong" },
      { name: "DSAR Fulfillment & Consent Lifecycles", score: 84, status: "Needs Review" },
    ],
    findings: [
      { id: "GAP-GDPR-01", domain: "DSAR Fulfillment", severity: "Medium", issue: "Data subject deletion request SLA fulfillment clock requires tighter webhook synchronization.", remediation: "Deploy automated dead-letter queue retry on downstream ERP purging." },
      { id: "GAP-GDPR-02", domain: "Data Protection by Design", severity: "Low", issue: "Consent ledger schema version 2.4.0 deprecation requires sunset notification to clients.", remediation: "Broadcast API migration roadmap to integrated enterprise partners." },
    ],
    recommendations: [
      "Maintain automated consent revocation sync between Atlas CDP and production analytical marts.",
      "Review cross-border data transfer impact assessments (TIAs) for North American storage regions."
    ],
  },
];

export const mockEvidenceItems = [
  { id: "EVD-ATL-01", title: "Consent ledger verification snapshot", system: "Atlas CDP", framework: "GDPR", status: "Valid", hash: "9bf4c82e...", lastVerified: "2026-10-24" },
  { id: "EVD-ATL-02", title: "Quarterly role recertification report", system: "Atlas CDP", framework: "SOC 2", status: "Valid", hash: "a310ec41...", lastVerified: "2026-10-20" },
  { id: "EVD-ATL-03", title: "Production network penetration test report", system: "Atlas CDP", framework: "SOC 2 / ISO 27001", status: "Valid", hash: "d83f12a9...", lastVerified: "2026-10-18" },
  { id: "EVD-ATL-04", title: "Disaster recovery restore exercise report", system: "Atlas CDP", framework: "SOC 2 / ISO 27001", status: "Pending Revalidation", hash: "stale-2.4.0", lastVerified: "2026-08-18" },
  { id: "EVD-ATL-05", title: "TLS 1.3 cipher suite compliance scan", system: "Atlas CDP", framework: "HIPAA / SOC 2", status: "Valid", hash: "e441bc82...", lastVerified: "2026-10-26" },
  { id: "EVD-ATL-06", title: "Data Subject Access Request (DSAR) audit log", system: "Atlas CDP", framework: "GDPR", status: "Valid", hash: "119ca847...", lastVerified: "2026-10-25" },
];

export const mockAuditTrailEvents = [
  { id: "ACT-841", timestamp: "2026-10-28 17:42:10", user: "Compliance Lead", action: "Change Simulation Run", target: "Atlas CDP (v2.4.0 -> v2.5.0)", severity: "Medium", details: "Simulated removal of legacy restore control; flagged 1 obligation gap." },
  { id: "ACT-840", timestamp: "2026-10-28 15:30:22", user: "Security Lead", action: "Break-glass Access Request", target: "Production Replica DB", severity: "Critical", details: "Requested emergency read access for index optimization; approved by Compliance Manager." },
  { id: "ACT-839", timestamp: "2026-10-27 11:14:05", user: "Automated Copilot", action: "Evidence Invalidation", target: "EVD-ATL-04 (Restore test)", severity: "High", details: "Baseline hash mismatch detected after schema update; status marked pending revalidation." },
  { id: "ACT-838", timestamp: "2026-10-26 09:22:18", user: "Data Platform Admin", action: "Quarterly Access Review", target: "Entitlement Group: Engineering", severity: "Low", details: "Revoked 3 dormant staging credentials; certified 42 active developer roles." },
  { id: "ACT-837", timestamp: "2026-10-25 14:05:44", user: "DPO Reviewer", action: "DSAR Audit Reconciliation", target: "Customer Ledger", severity: "Low", details: "Verified 18 data deletion requests completed within 14 days SLA." },
];

// Comprehensive Report Generator that parses queries into distinct structured reports
export function generateInstantReport(prompt) {
  const query = prompt.toLowerCase();
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const referenceId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;

  // 1. FINANCIAL REPORT
  if (
    query.includes("financial") ||
    query.includes("finance") ||
    query.includes("p&l") ||
    query.includes("profit") ||
    query.includes("revenue") ||
    query.includes("loss") ||
    query.includes("earning") ||
    query.includes("income")
  ) {
    return {
      id: referenceId,
      type: "financial_report",
      framework: "Corporate Finance & P&L Ledger",
      title: "Executive Financial Performance & Profitability Report",
      subtitle: "Trailing 12-Month Audited P&L, Revenue Run-Rate, and Margin Analysis",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme Financial Intelligence Office",
      score: 94,
      status: "Profitable (+11.3% MoM)",
      riskLevel: "Low",
      metrics: [
        { label: "Annual Gross Revenue", value: "$2,155,000", change: "+18.4% YoY Growth", positive: true },
        { label: "Annual Net Profit", value: "$1,069,000", change: "49.6% Net Margin", positive: true },
        { label: "Monthly Recurring Revenue", value: "$150,000", change: "$1.8M ARR Run-Rate", positive: true },
        { label: "Peak Month Net Profit", value: "$128,000", change: "December Record Net", positive: true },
      ],
      executiveSummary:
        "Acme Intelligence maintains exceptional financial strength with an annualized run-rate of $1.8M and a trailing 12-month gross revenue of $2,155,000. Net profit reached $1,069,000 with a sustained 49.6% net margin. Operating expenses ($420,000) and cost of goods sold ($725,000) remain tightly controlled, generating strong positive free cash flows across Q3 and Q4.",
      domains: [
        { name: "Top-Line Revenue Growth", score: 94, status: "Strong" },
        { name: "Gross Profit Margin (66.4%)", score: 96, status: "Exemplary" },
        { name: "Operating Expense Efficiency (OpEx)", score: 88, status: "Optimized" },
        { name: "Direct Cost of Goods (COGS)", score: 90, status: "Controlled" },
        { name: "Commodity Material Hedging", score: 82, status: "Needs Monitoring" },
      ],
      findings: [
        { id: "FIN-AUD-01", domain: "Operating Margins", severity: "Low", issue: "Q4 delivered record profitability of $128,000 in December (+11.3% growth over November).", remediation: "Maintain current pricing tier allocations across enterprise contracts." },
        { id: "FIN-AUD-02", domain: "Input Commodities", severity: "Medium", issue: "Crude Oil ($82.50/bbl, +2.86%) and Steel ($850/ton, +1.19%) fluctuations influencing hardware margins.", remediation: "Execute 90-day forward commodity hedge contracts with primary manufacturing suppliers." },
        { id: "FIN-AUD-03", domain: "Payroll Outlay", severity: "Low", issue: "Annual compensation expenditures total $488,000, representing 22.6% of gross revenue.", remediation: "Healthy allocation within benchmark standard of 25-30%." },
      ],
      recommendations: [
        "Maintain minimum 48% net profit margin target heading into the upcoming fiscal quarter.",
        "Reinvest 15% of surplus Q4 cash reserves into high-yield automated data pipeline infrastructure.",
        "Formalize quarterly supplier volume rebate programs with MetalWorks Inc. and ElecTronic Co."
      ],
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "Executive Financial Performance & Profitability Report"],
        ["Generated", `${dateStr} ${timeStr}`],
        ["Annual Gross Revenue", "$2,155,000"],
        ["Annual Net Profit", "$1,069,000"],
        ["Net Margin", "49.6%"],
        [],
        ["Month", "Revenue", "COGS", "Gross Profit", "OpEx", "Net Profit", "Margin %"],
        ["Jan", "120000", "40000", "80000", "30000", "50000", "41.7%"],
        ["Feb", "135000", "45000", "90000", "32000", "58000", "43.0%"],
        ["Mar", "150000", "50000", "100000", "30000", "70000", "46.7%"],
        ["Apr", "145000", "48000", "97000", "31000", "66000", "45.5%"],
        ["May", "160000", "52000", "108000", "33000", "75000", "46.9%"],
        ["Jun", "175000", "55000", "120000", "35000", "85000", "48.6%"],
        ["Jul", "180000", "60000", "120000", "35000", "85000", "47.2%"],
        ["Aug", "195000", "65000", "130000", "36000", "94000", "48.2%"],
        ["Sep", "210000", "70000", "140000", "38000", "102000", "48.6%"],
        ["Oct", "205000", "68000", "137000", "38000", "99000", "48.3%"],
        ["Nov", "230000", "75000", "155000", "40000", "115000", "50.0%"],
        ["Dec", "250000", "80000", "170000", "42000", "128000", "51.2%"],
        ["TOTAL", "2155000", "725000", "1430000", "420000", "1069000", "49.6%"],
      ],
    };
  }

  // 2. EMPLOYEES DETAILS & WORKFORCE REPORT
  if (
    query.includes("employee") ||
    query.includes("employees") ||
    query.includes("people") ||
    query.includes("payroll") ||
    query.includes("staff") ||
    query.includes("headcount") ||
    query.includes("compensation") ||
    query.includes("worker") ||
    query.includes("salary")
  ) {
    return {
      id: referenceId,
      type: "employees_report",
      framework: "Human Resources & Workforce Operations",
      title: "Comprehensive Employee Workforce & Compensation Report",
      subtitle: "Headcount Roster, Performance Efficiency Benchmarks, and Payroll Disbursement Audit",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme People & Culture Operations",
      score: 88,
      status: "Active (80% Disbursed)",
      riskLevel: "Low",
      metrics: [
        { label: "Active Headcount", value: "5 Staff", change: "4 Departments Represented", positive: true },
        { label: "Total Annual Compensation", value: "$488,000", change: "$420k Base + $68k Bonus", positive: true },
        { label: "Team Average Efficiency", value: "88 / 100", change: "Peak: 98% Diana Prince", positive: true },
        { label: "Payroll Status", value: "4 Paid / 1 Pending", change: "80% Disbursed Successfully", positive: true },
      ],
      executiveSummary:
        "The workforce roster across Sales, Engineering, Operations, and HR currently totals 5 active team members with cumulative annual payroll of $488,000 ($420,000 base salary plus $68,000 performance bonuses). Overall organizational efficiency stands at 88/100. Diana Prince leads company performance at 98% efficiency. 4 salaries are fully paid; 1 salary in Operations remains pending final approval.",
      domains: [
        { name: "Executive Leadership & HR", score: 98, status: "Benchmark Lead" },
        { name: "Commercial & Sales Department", score: 89, status: "High Output" },
        { name: "Engineering & Technical Development", score: 88, status: "Strong" },
        { name: "Operations & Business Analysis", score: 75, status: "Pending Review" },
      ],
      findings: [
        { id: "EMP-01", domain: "Sales Management", severity: "Low", issue: "Alice Smith (Sales Manager) achieved 92% efficiency with $100,000 total compensation ($85k base + $15k bonus).", remediation: "Status: Paid. Eligible for quarterly leadership retention bonus." },
        { id: "EMP-02", domain: "Engineering", severity: "Low", issue: "Bob Jones (Dev) logged 88% efficiency with $100,000 total compensation ($95k base + $5k bonus).", remediation: "Status: Paid. Recommended for lead architecture rotation." },
        { id: "EMP-03", domain: "Operations", severity: "Medium", issue: "Charlie Brown (Analyst) holds 75% efficiency with $73,000 total compensation ($70k base + $3k bonus). Payroll status is Pending.", remediation: "Schedule manager review and complete sign-off for compensation disbursement." },
        { id: "EMP-04", domain: "Human Resources", severity: "Low", issue: "Diana Prince (HR Director) recorded company-highest 98% efficiency with $130,000 compensation ($110k base + $20k bonus).", remediation: "Status: Paid. Recognized as top organizational benchmark performer." },
        { id: "EMP-05", domain: "Commercial Sales", severity: "Low", issue: "Evan Wright (Sales Rep) achieved 85% efficiency with $85,000 compensation ($60k base + $25k commission bonus).", remediation: "Status: Paid. Exceeded Q4 pipeline lead generation targets." },
      ],
      recommendations: [
        "Execute pending compensation release for Charlie Brown in Operations following manager audit.",
        "Implement quarterly skill enhancement workshops in Operations to elevate department efficiency toward 85%+.",
        "Formalize senior promotion roadmap for high-efficiency technical personnel."
      ],
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "Comprehensive Employee Workforce & Compensation Report"],
        ["Generated", `${dateStr} ${timeStr}`],
        ["Total Headcount", "5"],
        ["Total Annual Payroll", "$488,000"],
        ["Average Efficiency", "88%"],
        [],
        ["Employee ID", "Name", "Department", "Role", "Base Salary", "Bonus", "Total Compensation", "Efficiency", "Status"],
        ["EMP-001", "Alice Smith", "Sales", "Manager", "$85,000", "$15,000", "$100,000", "92%", "Paid"],
        ["EMP-002", "Bob Jones", "Engineering", "Dev", "$95,000", "$5,000", "$100,000", "88%", "Paid"],
        ["EMP-003", "Charlie Brown", "Operations", "Analyst", "$70,000", "$3,000", "$73,000", "75%", "Pending"],
        ["EMP-004", "Diana Prince", "HR", "Director", "$110,000", "$20,000", "$130,000", "98%", "Paid"],
        ["EMP-005", "Evan Wright", "Sales", "Rep", "$60,000", "$25,000", "$85,000", "85%", "Paid"],
      ],
    };
  }

  // 3. TOTAL INVESTMENT & CAPITAL ALLOCATION REPORT
  if (
    query.includes("investment") ||
    query.includes("investments") ||
    query.includes("invest") ||
    query.includes("capital") ||
    query.includes("roi") ||
    query.includes("funding") ||
    query.includes("asset") ||
    query.includes("assets") ||
    query.includes("capex") ||
    query.includes("treasury")
  ) {
    return {
      id: referenceId,
      type: "investment_report",
      framework: "Capital Allocation & Portfolio Treasury",
      title: "Total Capital Investment & Asset Deployment Report",
      subtitle: "Capital Expenditure (CapEx), Strategic Initiative Valuation, and Expected ROI Analysis",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme Treasury & Strategic Investment Committee",
      score: 91,
      status: "Value Accretive (+31.8% ROI)",
      riskLevel: "Low to Moderate",
      metrics: [
        { label: "Total Capital Deployed", value: "$4,250,000", change: "Across 4 Core Pillars", positive: true },
        { label: "Portfolio Asset Valuation", value: "$8,750,000", change: "2.06x MOIC Multiplier", positive: true },
        { label: "Blended Return on Investment", value: "+31.8% ROI", change: "Exceeding 22% Hurdle Rate", positive: true },
        { label: "Liquid Treasury Reserves", value: "$3,200,000", change: "24 Months Operating Runway", positive: true },
      ],
      executiveSummary:
        "Total strategic capital deployed across corporate initiatives stands at $4,250,000 against a current asset portfolio valuation of $8,750,000 (2.06x multiple on invested capital). The investment strategy has yielded a blended ROI of +31.8%, led by the AI Governance & Copilot Platform ($1.45M deployed, +38.5% ROI) and Cloud Infrastructure & Security ($1.10M deployed, +24.2% ROI). Liquid cash reserves of $3,200,000 guarantee 24 months of debt-free operational runway.",
      domains: [
        { name: "AI Governance & Copilot Architecture", score: 95, status: "+38.5% ROI" },
        { name: "Cloud Infrastructure & Security (AWS/SOC2)", score: 92, status: "+24.2% ROI" },
        { name: "R&D & Product Engineering", score: 90, status: "+31.0% ROI" },
        { name: "Commercial Expansion & Pipeline Acquisition", score: 87, status: "+28.4% ROI" },
      ],
      findings: [
        { id: "INV-CAP-01", domain: "AI Technology", severity: "Low", issue: "$1,450,000 invested in proprietary AI compliance reasoning and report generation engines.", remediation: "Delivered +38.5% ROI and accelerated enterprise sales cycles by 40%." },
        { id: "INV-CAP-02", domain: "Compliance Infrastructure", severity: "Low", issue: "$1,100,000 invested in ISO 27001, SOC 2, and HIPAA cloud security hardening.", remediation: "Directly unlocked 3 high-tier healthcare contracts totaling $650,000 in recurring revenue." },
        { id: "INV-CAP-03", domain: "Product Development", severity: "Low", issue: "$950,000 deployed across modern web analytics, inventory streaming, and API gateways.", remediation: "Supported 4,650 product unit sales with zero unplanned downtime." },
        { id: "INV-CAP-04", domain: "Disaster Recovery CapEx", severity: "Medium", issue: "Final $50,000 tranche pending allocation for cross-region disaster recovery replication.", remediation: "Authorize disbursement from Q1 CapEx budget to seal ISO 27001 Obligation OBL-RES-01." },
      ],
      recommendations: [
        "Rebalance FY2027 capital expenditure to prioritize high-margin AI automation workflows.",
        "Maintain minimum $3.0M liquid cash treasury reserve to withstand macroeconomic volatility.",
        "Conduct semi-annual valuation audit of intellectual property and proprietary compliance models."
      ],
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "Total Capital Investment & Asset Deployment Report"],
        ["Generated", `${dateStr} ${timeStr}`],
        ["Total Capital Deployed", "$4,250,000"],
        ["Portfolio Valuation", "$8,750,000"],
        ["Blended ROI", "+31.8%"],
        ["Liquid Reserves", "$3,200,000"],
        [],
        ["Investment Pillar", "Capital Invested", "Current Valuation", "Net Gain", "ROI %", "Status"],
        ["AI Governance & Copilot", "$1,450,000", "$3,460,000", "$2,010,000", "+38.5%", "Production"],
        ["Cloud Security & Compliance", "$1,100,000", "$2,100,000", "$1,000,000", "+24.2%", "Implemented"],
        ["R&D & Product Engineering", "$950,000", "$1,840,000", "$890,000", "+31.0%", "Scaling"],
        ["Commercial Go-To-Market", "$750,000", "$1,350,000", "$600,000", "+28.4%", "Active"],
        ["TOTAL", "$4,250,000", "$8,750,000", "$4,500,000", "+31.8%", "Profitable"],
      ],
    };
  }

  // 4. SOC 2 GAP / STATUS REPORT
  if (
    query.includes("soc") ||
    query.includes("soc 2") ||
    query.includes("soc2") ||
    query.includes("trust services")
  ) {
    const f = complianceFrameworks[0];
    return {
      id: referenceId,
      type: "soc2_gap",
      framework: "SOC 2 Type II",
      title: "SOC 2 Type II Compliance & Gap Analysis Report",
      subtitle: `Security, Confidentiality & Availability Audit · ${f.reviewPeriod}`,
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme AI Compliance Copilot",
      score: f.score,
      status: f.status,
      riskLevel: f.riskLevel,
      metrics: [
        { label: "Compliance Score", value: `${f.score}%`, change: "+4.2% MoM", positive: true },
        { label: "Passed Controls", value: `${f.passedControls} / ${f.totalControls}`, change: "87.5% passing", positive: true },
        { label: "Active Gaps", value: `${f.gapControls}`, change: "2 medium, 1 high", positive: false },
        { label: "Audit Readiness", value: "High", change: "Surveillance Ready", positive: true },
      ],
      executiveSummary:
        "The Acme Intelligence architecture maintains an 87% compliance posture against AICPA Trust Services Criteria (Common Criteria 2024). Production access controls, TLS 1.3 data encryption in transit, and role-based access management demonstrate robust maturity. The primary deficiency identified is a stale disaster recovery restore test evidence artifact resulting from recent data schema migrations.",
      domains: f.domains,
      findings: f.findings,
      recommendations: f.recommendations,
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "SOC 2 Type II Compliance Gap Report"],
        ["Generated", `${dateStr} ${timeStr}`],
        ["Framework", f.name],
        ["Readiness Score", `${f.score}%`],
        [],
        ["Domain", "Score", "Status"],
        ...f.domains.map((d) => [d.name, `${d.score}%`, d.status]),
        [],
        ["Finding ID", "Domain", "Severity", "Deficiency", "Remediation"],
        ...f.findings.map((finding) => [finding.id, finding.domain, finding.severity, finding.issue, finding.remediation]),
      ],
    };
  }

  // 5. HIGH-RISK EVIDENCE SUMMARY
  if (
    query.includes("evidence") ||
    query.includes("high-risk") ||
    query.includes("high risk") ||
    query.includes("stale") ||
    query.includes("invalidation")
  ) {
    return {
      id: referenceId,
      type: "evidence_summary",
      framework: "Cross-Framework Evidence Matrix",
      title: "High-Risk Evidence & Invalidation Summary",
      subtitle: "Critical control artifacts, hash integrity status, and pending revalidations",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme AI Compliance Copilot",
      score: 83,
      status: "1 Pending Revalidation",
      riskLevel: "Medium",
      metrics: [
        { label: "Tracked Evidence", value: `${mockEvidenceItems.length} items`, change: "100% cataloged", positive: true },
        { label: "Validated Artifacts", value: `${mockEvidenceItems.filter((e) => e.status === "Valid").length}`, change: "Cryptographically verified", positive: true },
        { label: "Invalidated / Stale", value: "1 item", change: "Disaster recovery restore", positive: false },
        { label: "Obligations at Risk", value: "1 (OBL-RES-01)", change: "ISO 27001 Backup", positive: false },
      ],
      executiveSummary:
        "5 of 6 active control evidence artifacts retain valid cryptographic hashes and current verifications. Artifact EVD-ATL-04 (Restore test evidence report) was invalidated following the Atlas CDP v2.5.0 schema update. Until a fresh restore simulation report is executed and hash-sealed, ISO 27001 Obligation OBL-RES-01 remains in a mitigated risk state.",
      domains: [
        { name: "Access Management Evidence", score: 100, status: "Verified" },
        { name: "Encryption & Network Evidence", score: 100, status: "Verified" },
        { name: "Disaster Recovery Evidence", score: 45, status: "Stale Hash" },
        { name: "Privacy Consent Evidence", score: 95, status: "Verified" },
      ],
      findings: [
        { id: "EVD-ATL-04", domain: "Resilience & Backup", severity: "High", issue: "Backup restore exercise last verified 2026-08-18 against baseline v2.4.0. Schema updated to v2.5.0.", remediation: "Re-run automated staging database restore and upload execution log with SHA-256 seal." },
        { id: "EVD-ATL-03", domain: "Penetration Testing", severity: "Medium", issue: "Network penetration test report expires in 45 days (annual cadence).", remediation: "Schedule Q4 third-party penetration testing engagement." },
      ],
      recommendations: [
        "Trigger immediate automated sandbox restore validation for Atlas CDP customer ledger.",
        "Require CI/CD automated artifact regeneration whenever database migrations alter critical table schemas.",
        "Archive historical proof artifacts in immutable write-once read-many (WORM) storage."
      ],
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "High-Risk Evidence & Invalidation Summary"],
        ["Generated", `${dateStr} ${timeStr}`],
        [],
        ["Evidence ID", "Title", "System", "Framework", "Status", "Last Verified"],
        ...mockEvidenceItems.map((e) => [e.id, e.title, e.system, e.framework, e.status, e.lastVerified]),
      ],
    };
  }

  // 6. AUDIT TRAIL / ACTIVITY EXPORT
  if (
    query.includes("audit") ||
    query.includes("activity") ||
    query.includes("history") ||
    query.includes("october") ||
    query.includes("trail") ||
    query.includes("log")
  ) {
    return {
      id: referenceId,
      type: "audit_trail",
      framework: "System Audit Trail",
      title: "Compliance Audit Trail & Administrative Activity Log",
      subtitle: "Immutable chronological record of changes, oversight decisions, and authorizations",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme AI Compliance Copilot",
      score: 96,
      status: "Complete & Verifiable",
      riskLevel: "Low",
      metrics: [
        { label: "Logged Events (Oct)", value: "5 events", change: "Zero unreviewed entries", positive: true },
        { label: "Critical Actions", value: "1 (Break-glass)", change: "Approved with rationale", positive: true },
        { label: "Automated Triggers", value: "2 actions", change: "Evidence invalidation", positive: true },
        { label: "Integrity Verification", value: "100%", change: "Append-only ledger sealed", positive: true },
      ],
      executiveSummary:
        "The October audit trail reflects strict adherence to separation of duties and administrative governance policies. All critical and high-risk system operations, including temporary break-glass access authorization and change simulation reviews, were accompanied by documented rationales and digital signatures.",
      domains: [
        { name: "Administrative Change Events", score: 98, status: "Compliant" },
        { name: "Emergency Break-Glass Oversight", score: 94, status: "Approved" },
        { name: "Automated Guardrail Events", score: 96, status: "Active" },
        { name: "Access Entitlement Recertifications", score: 95, status: "Compliant" },
      ],
      findings: mockAuditTrailEvents.map((evt) => ({
        id: evt.id,
        domain: evt.action,
        severity: evt.severity,
        issue: `${evt.user} on ${evt.target}: ${evt.details}`,
        remediation: `Timestamp: ${evt.timestamp} · Digital signature verified`,
      })),
      recommendations: [
        "Maintain automated monthly archiving of audit ledger state to cold storage.",
        "Perform bi-weekly reconciliation of emergency access grants against approved ticketing systems."
      ],
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "Compliance Audit Trail Export"],
        ["Generated", `${dateStr} ${timeStr}`],
        [],
        ["Event ID", "Timestamp", "User", "Action", "Target", "Severity", "Details"],
        ...mockAuditTrailEvents.map((a) => [a.id, a.timestamp, a.user, a.action, a.target, a.severity, a.details]),
      ],
    };
  }

  // 7. ISO 27001 REPORT
  if (
    query.includes("iso") ||
    query.includes("27001") ||
    query.includes("annex a") ||
    query.includes("isms")
  ) {
    const f = complianceFrameworks[1];
    return {
      id: referenceId,
      type: "iso27001",
      framework: "ISO/IEC 27001:2022",
      title: "ISO 27001:2022 ISMS Surveillance & Readiness Audit",
      subtitle: "Information Security Management System & Annex A Verification",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme AI Compliance Copilot",
      score: f.score,
      status: f.status,
      riskLevel: f.riskLevel,
      metrics: [
        { label: "ISMS Readiness", value: `${f.score}%`, change: "Stage 2 Surveillance Ready", positive: true },
        { label: "Annex A Controls", value: `${f.passedControls} / ${f.totalControls}`, change: "92.4% implemented", positive: true },
        { label: "Open Deficiencies", value: `${f.gapControls}`, change: "Minor non-conformances", positive: false },
        { label: "Residual Risk", value: "Low", change: "Within risk appetite", positive: true },
      ],
      executiveSummary:
        "Acme Information Security Management System (ISMS) operates in compliance with ISO/IEC 27001:2022 specifications. Core strengths include People Controls (A.6) and Physical Controls (A.7). Minor recommendations relate to fine-tuning data leakage prevention rules for synthetic test data exports.",
      domains: f.domains,
      findings: f.findings,
      recommendations: f.recommendations,
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "ISO 27001 Surveillance Report"],
        ["Generated", `${dateStr} ${timeStr}`],
        ["Framework", f.name],
        ["Score", `${f.score}%`],
        [],
        ["Domain", "Score", "Status"],
        ...f.domains.map((d) => [d.name, `${d.score}%`, d.status]),
        [],
        ["Finding ID", "Domain", "Severity", "Deficiency", "Remediation"],
        ...f.findings.map((fi) => [fi.id, fi.domain, fi.severity, fi.issue, fi.remediation]),
      ],
    };
  }

  // 8. HIPAA COMPLIANCE OVERVIEW
  if (
    query.includes("hipaa") ||
    query.includes("health") ||
    query.includes("ephi") ||
    query.includes("phi")
  ) {
    const f = complianceFrameworks[2];
    return {
      id: referenceId,
      type: "hipaa",
      framework: "HIPAA Security Rule",
      title: "HIPAA Security Rule & Technical Safeguards Audit",
      subtitle: "45 CFR Parts 160/164 · ePHI Confidentiality, Integrity & Availability",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme AI Compliance Copilot",
      score: f.score,
      status: f.status,
      riskLevel: f.riskLevel,
      metrics: [
        { label: "Safeguards Score", value: `${f.score}%`, change: "Technical & physical strong", positive: true },
        { label: "Controls Verified", value: `${f.passedControls} / ${f.totalControls}`, change: "95.2% pass rate", positive: true },
        { label: "ePHI Encryption", value: "AES-256", change: "At rest & TLS 1.3 in transit", positive: true },
        { label: "Open Gaps", value: "2 low/med", change: "Retention policy sync", positive: false },
      ],
      executiveSummary:
        "The application architecture adheres to HIPAA Security Rule provisions. Production stores enforce AES-256 envelope encryption, granular least-privilege role boundaries, and dedicated audit event capture. Two minor operational adjustments are queued: configuring a 6-year retention lock on cold audit vaults and updating contract staff security training.",
      domains: f.domains,
      findings: f.findings,
      recommendations: f.recommendations,
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "HIPAA Security Safeguards Report"],
        ["Generated", `${dateStr} ${timeStr}`],
        ["Framework", f.name],
        ["Compliance Score", `${f.score}%`],
        [],
        ["Domain", "Score", "Status"],
        ...f.domains.map((d) => [d.name, `${d.score}%`, d.status]),
        [],
        ["Finding ID", "Domain", "Severity", "Deficiency", "Remediation"],
        ...f.findings.map((fi) => [fi.id, fi.domain, fi.severity, fi.issue, fi.remediation]),
      ],
    };
  }

  // 9. GDPR DATA PROTECTION REPORT
  if (
    query.includes("gdpr") ||
    query.includes("privacy") ||
    query.includes("dsar") ||
    query.includes("consent")
  ) {
    const f = complianceFrameworks[3];
    return {
      id: referenceId,
      type: "gdpr",
      framework: "GDPR (EU 2016/679)",
      title: "GDPR Data Protection & Consent Lifecycle Audit",
      subtitle: "Articles 25, 30, 32 & DSAR Fulfillment Verification",
      generatedAt: `${dateStr} at ${timeStr}`,
      preparedBy: "Acme AI Compliance Copilot",
      score: f.score,
      status: f.status,
      riskLevel: f.riskLevel,
      metrics: [
        { label: "Privacy Score", value: `${f.score}%`, change: "High compliance level", positive: true },
        { label: "DSAR SLA Compliance", value: "98.2%", change: "Within 30-day window", positive: true },
        { label: "Consent Ledger", value: "Active", change: "Real-time sync verified", positive: true },
        { label: "Identified Gaps", value: "3 items", change: "Consent version sunsetting", positive: false },
      ],
      executiveSummary:
        "The data platform enforces Article 25 (Data Protection by Design) and Article 32 (Security of Processing). Consent ledgers actively synchronize user consent states across activation endpoints. Three non-critical optimizations are in progress regarding webhook SLA retries and deprecation notices for legacy schema versions.",
      domains: f.domains,
      findings: f.findings,
      recommendations: f.recommendations,
      rawCsvData: [
        ["Report Reference", referenceId],
        ["Report Title", "GDPR Privacy & Consent Audit Report"],
        ["Generated", `${dateStr} ${timeStr}`],
        ["Framework", f.name],
        ["Privacy Score", `${f.score}%`],
        [],
        ["Domain", "Score", "Status"],
        ...f.domains.map((d) => [d.name, `${d.score}%`, d.status]),
        [],
        ["Finding ID", "Domain", "Severity", "Deficiency", "Remediation"],
        ...f.findings.map((fi) => [fi.id, fi.domain, fi.severity, fi.issue, fi.remediation]),
      ],
    };
  }

  // 10. GENERAL / EXECUTIVE BRIEFING FALLBACK
  return {
    id: referenceId,
    type: "executive_briefing",
    framework: "Enterprise Governance & Intelligence",
    title: "Executive Business & Governance Posture Briefing",
    subtitle: `Customized intelligence compilation for: "${prompt}"`,
    generatedAt: `${dateStr} at ${timeStr}`,
    preparedBy: "Acme AI Intelligence Copilot",
    score: 91,
    status: "Healthy Operations",
    riskLevel: "Low to Moderate",
    metrics: [
      { label: "Overall Business Health", value: "91%", change: "Strong execution across units", positive: true },
      { label: "Annual Revenue Run-Rate", value: "$1.8M ARR", change: "$150k MRR billing", positive: true },
      { label: "Capital Deployed", value: "$4.25M", change: "+31.8% blended ROI", positive: true },
      { label: "Team Efficiency", value: "88% avg", change: "5 active headcount", positive: true },
    ],
    executiveSummary:
      `Consolidated executive evaluation for "${prompt}". Acme Intelligence operates in a strong financial and operational state with $2.155M in annual gross receipts, $1.069M net profit (49.6% margin), $4.25M total strategic capital deployed, and 88% average workforce efficiency. All core compliance safeguards across SOC 2, ISO 27001, and HIPAA remain audit-ready.`,
    domains: [
      { name: "Financial Performance & Cash Flow", score: 94, status: "Strong" },
      { name: "Capital Investment & Asset ROI", score: 91, status: "Profitable" },
      { name: "Workforce & Team Health", score: 88, status: "Strong" },
      { name: "Security & Governance Assurance", score: 89, status: "Audit Ready" },
    ],
    findings: [
      { id: "EXEC-01", domain: "Finance & Profitability", severity: "Low", issue: "Trailing 12-month net income reached $1,069,000 with 49.6% net margin.", remediation: "Reinvest surplus operating cash into core AI platform R&D." },
      { id: "EXEC-02", domain: "Capital Allocation", severity: "Low", issue: "Total investment of $4.25M yielded current portfolio valuation of $8.75M (+31.8% ROI).", remediation: "Maintain 24-month liquid reserves ($3.2M)." },
      { id: "EXEC-03", domain: "Workforce Operations", severity: "Medium", issue: "4 of 5 employees paid; 1 analyst salary in Operations pending manager sign-off.", remediation: "Complete final review in People & Payroll workspace." },
    ],
    recommendations: [
      "Ask for a dedicated 'Financial report' to inspect the full monthly P&L ledger.",
      "Ask for an 'Employees details report' to audit individual compensation, efficiency, and payroll status.",
      "Ask for a 'Total investment report' to analyze capital expenditure, asset valuation, and ROI multiples."
    ],
    rawCsvData: [
      ["Report Reference", referenceId],
      ["Report Title", "Executive Business & Governance Posture Briefing"],
      ["Query", prompt],
      ["Generated", `${dateStr} ${timeStr}`],
      ["Composite Score", "91%"],
    ],
  };
}

// Conversational intent parser (answers questions or triggers navigation / reports)
export function handleCopilotChat(input, navigate) {
  const q = input.trim().toLowerCase();

  // If the query asks for ANY report, generate it FIRST before navigation
  const isReportRequest =
    q.includes("report") ||
    q.includes("gap") ||
    q.includes("audit") ||
    q.includes("summary") ||
    q.includes("statement") ||
    q.includes("export") ||
    q.includes("generate") ||
    q.includes("create") ||
    q.includes("compile") ||
    q.includes("soc") ||
    q.includes("hipaa") ||
    q.includes("iso") ||
    q.includes("gdpr") ||
    q.includes("investment") ||
    (q.includes("financial") && !q.startsWith("go to") && !q.startsWith("navigate")) ||
    (q.includes("employee") && !q.startsWith("go to") && !q.startsWith("navigate"));

  if (isReportRequest) {
    const report = generateInstantReport(input);
    return {
      type: "report",
      report,
      speech: `Generated your ${report.framework} ${report.title} with a score of ${report.score} percent.`,
      text: `I've compiled the **${report.title}** based on active workspace records. You can inspect the metrics, domain breakdown, findings, and download as PDF / CSV or email below:`,
    };
  }

  // Explicit Navigation commands (e.g., "go to financials", "open employees")
  if (
    q.startsWith("go to") ||
    q.startsWith("open") ||
    q.startsWith("navigate to") ||
    q.startsWith("switch to") ||
    q.startsWith("take me to")
  ) {
    if (q.includes("overview") || q.includes("dashboard") || q.includes("home")) {
      navigate?.("/");
      return { type: "navigation", speech: "Navigating to Executive Overview dashboard.", text: "Navigated to **Executive Overview**." };
    }
    if (q.includes("financial") || q.includes("p&l") || q.includes("revenue") || q.includes("profit")) {
      navigate?.("/financials");
      return { type: "navigation", speech: "Opening Financial Analytics.", text: "Navigated to **Financial Analytics**." };
    }
    if (q.includes("intelligence") || q.includes("product") || q.includes("client profit")) {
      navigate?.("/business-intelligence");
      return { type: "navigation", speech: "Opening Business Intelligence workspace.", text: "Navigated to **Business Intelligence**." };
    }
    if (q.includes("employee") || q.includes("people") || q.includes("payroll") || q.includes("team")) {
      navigate?.("/employees");
      return { type: "navigation", speech: "Opening People and Payroll management.", text: "Navigated to **People & Payroll Management**." };
    }
    if (q.includes("compliance") || q.includes("evidence") || q.includes("oversight")) {
      navigate?.("/compliance");
      return { type: "navigation", speech: "Navigating to AI Compliance Copilot workspace.", text: "Navigated to **AI Compliance Copilot**." };
    }
    if (q.includes("report")) {
      navigate?.("/reports");
      return { type: "navigation", speech: "Opening AI Reports Generator.", text: "Navigated to **AI Reports Chat & Generator**." };
    }
  }

  // Specific Data Inquiries
  if (q.includes("investment") || q.includes("capital") || q.includes("roi") || q.includes("portfolio")) {
    return {
      type: "report",
      report: generateInstantReport("total investment report"),
      speech: "Here is the Total Investment and Capital Allocation Report.",
      text: "Here is our **Total Capital Investment & Asset Deployment Report**:",
    };
  }

  if (q.includes("score") || q.includes("compliance rate") || q.includes("how compliant")) {
    return {
      type: "qa",
      speech: "Our overall compliance score across all frameworks is 89 percent.",
      text: "Acme Intelligence has an overall compliance score of **89%** across all four frameworks:\n\n- **SOC 2 Type II:** 87% (Minor gaps in disaster recovery evidence)\n- **ISO 27001:** 92% (Surveillance audit ready)\n- **HIPAA:** 94% (Full technical safeguards compliant)\n- **GDPR:** 89% (DSAR SLAs on schedule at 98.2%)\n\nAsk me to *'Generate a SOC 2 gap report'* to see the full deficiency audit.",
    };
  }

  if (q.includes("revenue") || q.includes("mrr") || q.includes("profit") || q.includes("financial")) {
    return {
      type: "report",
      report: generateInstantReport("financial performance report"),
      speech: "Here is your Financial Performance & Profitability Report.",
      text: "Here is the **Executive Financial Performance & Profitability Report** based on the audited P&L ledger:",
    };
  }

  if (q.includes("top employee") || q.includes("best performer") || q.includes("staff") || q.includes("headcount")) {
    return {
      type: "report",
      report: generateInstantReport("employees details report"),
      speech: "Here is the Employees Details and Workforce Report.",
      text: "Here is the **Comprehensive Employee Workforce & Compensation Report**:",
    };
  }

  // Generic conversational help
  return {
    type: "chat",
    speech: "I can generate financial, employee, investment, or compliance reports. Try asking for a financial report.",
    text: "I am your **AI Voice Command & Instant Report Assistant**. Here are the reports you can generate right now:\n\n- 📊 **Financial Report:** *'Generate financial report'* (P&L ledger, gross revenue, net profit, margins, OpEx/COGS).\n- 👥 **Employees Details Report:** *'Give me employees details report'* (Headcount, salaries, bonuses, efficiency scores, payroll status).\n- 💰 **Total Investment Report:** *'Generate total investment report'* (Capital deployed, portfolio valuation, CapEx, ROI multiples).\n- 🛡️ **Compliance Reports:** *'SOC 2 gap report'*, *'High-risk evidence summary'*, *'October audit trail'*, *'HIPAA report'*, *'ISO 27001 report'*, *'GDPR report'*.\n\nAll reports support instant **PDF export**, **CSV download**, **Copy to Clipboard**, and **Email dispatch**.",
  };
}
