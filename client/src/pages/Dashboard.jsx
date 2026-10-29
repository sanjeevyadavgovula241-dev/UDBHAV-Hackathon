import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  LineChart,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Panel, { PanelHeader } from "../components/ui/Panel";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { ErrorState, LoadingState } from "../components/ui/States";
import { buttonStyles } from "../lib/buttonStyles";
import { statusVariant } from "../lib/status";
import {
  chartAxis,
  chartColors,
  chartCursor,
  chartGrid,
  chartTooltipProps,
} from "../lib/chart";
import { formatCurrency, formatDate, formatNumber } from "../lib/format";
import { apiRequest } from "../lib/api";

function RangeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-line bg-shell/80 p-0.5">
      {["6M", "12M"].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            value === option
              ? "bg-raised text-ink shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
          aria-pressed={value === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function InsightList({ text }) {
  if (!text) return null;
  const lines = text
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);

  return (
    <ul className="space-y-3">
      {lines.map((line, index) => (
        <li key={index} className="flex gap-2.5 text-xs leading-relaxed text-slate-300">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [financials, setFinancials] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("12M");
  const [analyticsTab, setAnalyticsTab] = useState("industry"); // "industry" | "departments"
  const [aiTab, setAiTab] = useState("insights");
  const [aiInsights, setAiInsights] = useState(null);
  const [aiActions, setAiActions] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, financialData, employeeData] = await Promise.all([
        apiRequest("/api/dashboard"),
        apiRequest("/api/financials"),
        apiRequest("/api/employees"),
      ]);

      setData(dashboardData);
      setFinancials(financialData.financials ?? []);
      setEmployees(employeeData.employees ?? []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAI = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const [insights, actions] = await Promise.all([
        apiRequest("/api/ai/client-insights", { method: "POST" }),
        apiRequest("/api/ai/sales-actions", { method: "POST" }),
      ]);
      setAiInsights(insights.text);
      setAiActions(actions.text);
    } catch {
      setAiError("AI insights are temporarily unavailable. Core dashboard data is unaffected.");
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadAI();
  }, [loadAI]);

  const visibleFinancials = useMemo(
    () => (range === "6M" ? financials.slice(-6) : financials),
    [financials, range],
  );

  const metrics = data?.metrics ?? {
    totalClients: 0,
    newClientsThisMonth: 0,
    churnRate: 0,
    mrr: 0,
  };
  const clients = useMemo(() => data?.clients ?? [], [data]);
  const pipeline = useMemo(() => data?.pipeline ?? [], [data]);
  const products = useMemo(() => data?.products ?? [], [data]);

  const activeClients = clients.filter((client) => client.status === "Active").length;
  const pipelineDeals = pipeline.reduce((sum, stage) => sum + stage.count, 0);
  const pipelineValue = pipeline.reduce((sum, stage) => sum + stage.value, 0);
  const outOfStock = products.filter((product) => product.status === "Out of Stock").length;
  const maxStock = Math.max(...products.map((product) => product.stock), 1);

  const recentClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        .slice(0, 5),
    [clients],
  );

  const periodRevenue = visibleFinancials.reduce((sum, month) => sum + month.revenue, 0);
  const latestNet = financials[financials.length - 1]?.net ?? 0;
  const previousNet = financials[financials.length - 2]?.net ?? latestNet;
  const netGrowth = previousNet ? ((latestNet - previousNet) / previousNet) * 100 : 0;
  const heroMonths = financials.slice(-8);
  const heroMax = Math.max(...heroMonths.map((month) => month.net), 1);

  // Workforce metrics
  const avgEfficiency = employees.length
    ? Math.round(
        employees.reduce((sum, employee) => sum + employee.efficiency, 0) / employees.length,
      )
    : 0;

  // Industry breakdown
  const industryData = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      map[c.industry] = (map[c.industry] || 0) + c.revenue;
    });
    return Object.entries(map)
      .map(([industry, revenue]) => ({ industry, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [clients]);

  // Department efficiency breakdown
  const departmentData = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      if (!map[emp.department]) map[emp.department] = { sum: 0, count: 0 };
      map[emp.department].sum += emp.efficiency;
      map[emp.department].count += 1;
    });
    return Object.entries(map).map(([dept, data]) => ({
      department: dept,
      score: Math.round(data.sum / data.count),
    }));
  }, [employees]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive overview"
        title="Your business, in motion."
        description="A real-time snapshot of recurring revenue, customer health, sales pipeline, and workforce operations."
        actions={
          <>
            <Link to="/financials" className={buttonStyles({ variant: "secondary", size: "sm" })}>
              <DollarSign size={14} />
              Financials
            </Link>
            <Link
              to="/business-intelligence"
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              Open intelligence
              <ArrowUpRight size={14} />
            </Link>
          </>
        }
      />

      {loading ? (
        <LoadingState cards={4} />
      ) : error ? (
        <ErrorState description={error} onRetry={loadData} />
      ) : (
        <>
          {/* Executive Briefing Hero */}
          <Panel>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_120%_at_8%_0%,rgba(85,214,190,0.14),transparent_65%),radial-gradient(ellipse_40%_90%_at_96%_100%,rgba(143,167,232,0.08),transparent_70%)]"
            />
            <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                  <span className="h-px w-6 bg-accent/70" />
                  Executive briefing
                </div>
                <h2 className="mt-4 max-w-xl font-display text-[28px] font-semibold leading-[1.18] tracking-[-0.03em] text-ink sm:text-[34px]">
                  Clarity for every decision.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                  Revenue, client retention, and operational delivery in one calm, integrated view.
                  Signals reflect verified workspace records and real-time ledger movements.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line/80 pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      Latest net profit
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-ink tabular-nums">
                      {formatCurrency(latestNet, true)}
                    </p>
                  </div>
                  <div className="hidden h-8 w-px bg-line sm:block" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      MoM Profit movement
                    </p>
                    <p
                      className={`mt-1 font-display text-lg font-semibold tabular-nums ${
                        netGrowth >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {netGrowth >= 0 ? "+" : ""}
                      {netGrowth.toFixed(1)}%
                    </p>
                  </div>
                  <div className="hidden h-8 w-px bg-line sm:block" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      Team Efficiency
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-accent tabular-nums">
                      {avgEfficiency}%
                    </p>
                  </div>
                  <Link
                    to="/business-intelligence"
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors duration-200 hover:text-accent-strong"
                  >
                    Deep dive analytics
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="w-full rounded-2xl border border-line bg-void/50 p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                    Monthly recurring revenue
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                    Live stream
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
                  <p className="font-display text-[32px] font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums">
                    {formatCurrency(metrics.mrr, true)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                      netGrowth >= 0
                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                        : "border-rose-400/25 bg-rose-400/10 text-rose-300"
                    }`}
                  >
                    <ArrowUpRight size={13} />
                    {Math.abs(netGrowth).toFixed(1)}% MoM
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Annualized Run Rate (ARR): {formatCurrency(metrics.mrr * 12, true)}
                </p>

                {/* Trailing months mini bar sparkline */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                    <span>Trailing 8 Months Profit</span>
                    <span>Peak: {formatCurrency(heroMax, true)}</span>
                  </div>
                  <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
                    {heroMonths.map((month, index) => (
                      <span
                        key={month.month}
                        title={`${month.month}: ${formatCurrency(month.net)}`}
                        className={`flex-1 rounded-t-sm transition-all duration-200 cursor-pointer hover:opacity-100 ${
                          index === heroMonths.length - 1 ? "bg-accent shadow-[0_0_10px_rgba(85,214,190,0.4)]" : "bg-accent/35"
                        }`}
                        style={{
                          height: `${Math.max(16, (month.net / heroMax) * 100)}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line/80 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Active clients
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200 tabular-nums">
                      {activeClients} of {metrics.totalClients} ({Math.round((activeClients / metrics.totalClients) * 100)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Open pipeline
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200 tabular-nums">
                      {formatCurrency(pipelineValue, true)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      New clients
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200 tabular-nums">
                      +{metrics.newClientsThisMonth} this month
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Pipeline deals
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200 tabular-nums">
                      {formatNumber(pipelineDeals)} active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* 4 Core Executive Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Monthly recurring revenue"
              value={formatCurrency(metrics.mrr, true)}
              subtitle="active customer billings"
              trend={netGrowth}
              icon={DollarSign}
              accent="violet"
              delay={0}
              badge="Finance"
            />
            <MetricCard
              title="Active Pipeline Value"
              value={formatCurrency(pipelineValue, true)}
              subtitle={`${pipelineDeals} opportunities in motion`}
              icon={LineChart}
              accent="indigo"
              delay={60}
              badge="Sales"
            />
            <MetricCard
              title="Client Retention"
              value={`${((activeClients / (metrics.totalClients || 1)) * 100).toFixed(0)}%`}
              subtitle={`${metrics.churnRate}% churn · +${metrics.newClientsThisMonth} new`}
              trend={-metrics.churnRate}
              icon={Users}
              accent="cyan"
              delay={120}
              badge="Accounts"
            />
            <MetricCard
              title="Workforce Health"
              value={`${avgEfficiency}%`}
              subtitle={`${employees.length} staff across ${departmentData.length} departments`}
              icon={Sparkles}
              accent="emerald"
              delay={180}
              badge="People"
            />
          </div>

          {/* Row 1 Analytics: Revenue/Profitability AreaChart + Pipeline Health BarChart */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                title="Revenue & profitability performance"
                description="Monthly gross revenue and bottom-line net profit across the selected period."
                action={<RangeToggle value={range} onChange={setRange} />}
              />
              <div className="p-4 sm:p-5">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Total period revenue</p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                      {formatCurrency(periodRevenue, true)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                      Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#7cb8de]" />
                      Net profit
                    </span>
                  </div>
                </div>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={visibleFinancials}
                      margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartColors.violet} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={chartColors.violet} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dashboardNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartColors.cyan} stopOpacity={0.22} />
                          <stop offset="100%" stopColor={chartColors.cyan} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke={chartGrid} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartAxis, fontSize: 11 }}
                        tickMargin={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartAxis, fontSize: 10 }}
                        tickFormatter={(value) => formatCurrency(value, true)}
                        width={58}
                      />
                      <Tooltip
                        {...chartTooltipProps}
                        cursor={chartCursor}
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          name === "revenue" ? "Gross Revenue" : "Net Profit",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={chartColors.violet}
                        strokeWidth={2.5}
                        fill="url(#dashboardRevenue)"
                        animationDuration={800}
                      />
                      <Area
                        type="monotone"
                        dataKey="net"
                        stroke={chartColors.cyan}
                        strokeWidth={2.5}
                        fill="url(#dashboardNet)"
                        animationDuration={900}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Sales pipeline velocity"
                description="Active deal valuation grouped by progression stage."
                action={
                  <Badge variant="info">
                    {formatNumber(pipelineDeals)} deals total
                  </Badge>
                }
              />
              <div className="p-4">
                <div className="mb-4 rounded-xl border border-line bg-shell/70 p-4">
                  <p className="text-xs text-slate-400">Total pipeline value</p>
                  <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {formatCurrency(pipelineValue, true)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    5 late-stage deals in Negotiation ({formatCurrency(120000, true)})
                  </p>
                </div>
                <div className="h-[238px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pipeline}
                      layout="vertical"
                      margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke={chartGrid} />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartAxis, fontSize: 10 }}
                        tickFormatter={(value) => formatCurrency(value, true)}
                      />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartAxis, fontSize: 11 }}
                        width={82}
                      />
                      <Tooltip
                        {...chartTooltipProps}
                        cursor={chartCursor}
                        formatter={(value, _, item) => [
                          `${formatCurrency(Number(value))} (${item.payload.count} deals)`,
                          "Stage Value",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill={chartColors.indigo}
                        radius={[0, 5, 5, 0]}
                        barSize={16}
                        animationDuration={850}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>
          </div>

          {/* Row 2 Analytics: Category Breakdown (Industry/Department) + AI Copilot */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                title={analyticsTab === "industry" ? "Client revenue by industry" : "Department operational efficiency"}
                description={
                  analyticsTab === "industry"
                    ? "Portfolio concentration across market sectors."
                    : "Workforce performance distribution across business units."
                }
                action={
                  <div className="flex rounded-lg border border-line bg-shell/80 p-0.5">
                    <button
                      type="button"
                      onClick={() => setAnalyticsTab("industry")}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        analyticsTab === "industry" ? "bg-raised text-ink shadow-sm" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Industry Revenue
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsTab("departments")}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        analyticsTab === "departments" ? "bg-raised text-ink shadow-sm" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Department Health
                    </button>
                  </div>
                }
              />
              <div className="p-4 sm:p-5">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {analyticsTab === "industry" ? (
                      <BarChart
                        data={industryData}
                        margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} stroke={chartGrid} />
                        <XAxis
                          dataKey="industry"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartAxis, fontSize: 11 }}
                          tickMargin={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartAxis, fontSize: 10 }}
                          tickFormatter={(value) => formatCurrency(value, true)}
                          width={55}
                        />
                        <Tooltip
                          {...chartTooltipProps}
                          cursor={chartCursor}
                          formatter={(value) => [formatCurrency(Number(value)), "Client Revenue"]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill={chartColors.violet}
                          radius={[5, 5, 0, 0]}
                          barSize={36}
                          animationDuration={800}
                        >
                          {industryData.map((_, index) => (
                            <Cell
                              key={`ind-${index}`}
                              fill={index === 0 ? chartColors.violet : chartColors.indigo}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <BarChart
                        data={departmentData}
                        margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} stroke={chartGrid} />
                        <XAxis
                          dataKey="department"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartAxis, fontSize: 11 }}
                          tickMargin={8}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: chartAxis, fontSize: 10 }}
                          width={40}
                        />
                        <Tooltip
                          {...chartTooltipProps}
                          cursor={chartCursor}
                          formatter={(value) => [`${value}%`, "Efficiency Score"]}
                        />
                        <Bar
                          dataKey="score"
                          fill={chartColors.emerald}
                          radius={[5, 5, 0, 0]}
                          barSize={36}
                          animationDuration={800}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>

            <Panel className="flex flex-col">
              <PanelHeader
                title="AI workspace signals"
                description="Executive insights generated from active pipeline & client data."
                action={
                  <div className="flex rounded-lg border border-line bg-shell/80 p-0.5">
                    {[
                      ["insights", "Insights"],
                      ["actions", "Actions"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAiTab(value)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          aiTab === value
                            ? "bg-raised text-ink shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                        aria-pressed={aiTab === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                }
              />
              <div className="flex flex-1 flex-col p-5">
                {aiLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="skeleton h-12 rounded-xl" />
                    ))}
                  </div>
                ) : aiError ? (
                  <div className="flex flex-1 flex-col items-start justify-center">
                    <p className="text-xs leading-relaxed text-slate-400">{aiError}</p>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={loadAI}>
                      <RefreshCw size={13} />
                      Retry synthesis
                    </Button>
                  </div>
                ) : (
                  <InsightList text={aiTab === "insights" ? aiInsights : aiActions} />
                )}
                <div className="mt-auto pt-5">
                  <div className="flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent/[0.05] p-3 text-xs leading-relaxed text-slate-400">
                    <Sparkles size={15} className="mt-0.5 shrink-0 text-accent" />
                    Continuous model evaluation connected to workspace metrics.
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Row 3 Operations: Recent Activity & Inventory Health */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                title="Recent client activity"
                description="Verified accounts and revenue contributions across the ledger."
                action={
                  <Link
                    to="/business-intelligence"
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-strong"
                  >
                    View all clients
                    <ArrowRight size={13} />
                  </Link>
                }
              />
              <div className="divide-y divide-line/70">
                {recentClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-raised/40"
                  >
                    <Avatar name={client.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-100">
                          {client.name}
                        </p>
                        <Badge variant={statusVariant(client.status)}>{client.status}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {client.industry} · Last activity {formatDate(client.lastActivity)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-200 tabular-nums">
                        {formatCurrency(client.revenue, true)}
                      </p>
                      <p className="text-[10px] text-slate-400">annual value</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Operational stock status"
                description="Inventory readiness & restock indicators."
                action={
                  <Badge variant={outOfStock ? "danger" : "success"}>
                    <Package size={11} />
                    {outOfStock ? `${outOfStock} out of stock` : "Optimal coverage"}
                  </Badge>
                }
              />
              <div className="space-y-3 p-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-line bg-shell/60 p-3.5 transition-all duration-200 hover:border-line hover:bg-raised/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-snug text-slate-200">
                        {product.name}
                      </p>
                      <Badge variant={statusVariant(product.status)}>{product.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">{product.supplier}</p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="font-display text-lg font-semibold text-ink tabular-nums">
                          {product.stock} units
                        </p>
                        <p className="text-[10px] text-slate-400">available stock</p>
                      </div>
                      <p className="text-xs text-slate-300">
                        {formatNumber(product.unitsSold)} sold
                      </p>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-void/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          product.status === "Out of Stock"
                            ? "bg-rose-400"
                            : product.status === "Low Stock"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min(100, (product.stock / maxStock) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Quick Workspaces Launchpad */}
          <Panel>
            <PanelHeader
              title="Integrated workspace modules"
              description="Seamless navigation across executive analytics, financials, workforce, and governance copilot."
              action={
                <Badge variant="default">
                  <Clock size={11} />
                  Connected
                </Badge>
              }
            />
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  to: "/business-intelligence",
                  icon: LineChart,
                  title: "Business Intelligence",
                  description: "Product sell-through, client margins, and profit contribution matrix.",
                  badge: "Analytics",
                },
                {
                  to: "/financials",
                  icon: DollarSign,
                  title: "Financial Analytics",
                  description: "Full P&L statements, monthly OpEx/COGS breakdown, and commodity tracking.",
                  badge: "Ledger",
                },
                {
                  to: "/employees",
                  icon: Users,
                  title: "People & Payroll",
                  description: "Compensation disbursement, department efficiency scores, and team health.",
                  badge: "Operations",
                },
                {
                  to: "/compliance",
                  icon: ShieldCheck,
                  title: "Compliance Copilot",
                  description: "Change impact simulator, evidence trail, and human oversight controls.",
                  badge: "AI Assurance",
                },
              ].map((module) => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.to}
                    to={module.to}
                    className="group flex flex-col justify-between rounded-xl border border-line bg-shell/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-raised/60 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-raised text-accent transition-transform duration-200 group-hover:scale-105">
                          <Icon size={17} />
                        </span>
                        <span className="rounded-md border border-line bg-void/50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-400">
                          {module.badge}
                        </span>
                      </div>
                      <p className="mt-3.5 text-sm font-semibold text-slate-100 group-hover:text-accent transition-colors">
                        {module.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {module.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent">
                      <span>Launch view</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
