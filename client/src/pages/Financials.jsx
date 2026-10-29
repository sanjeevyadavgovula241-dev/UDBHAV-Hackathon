import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Download,
  Percent,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "../components/MetricCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import Panel, { PanelHeader } from "../components/ui/Panel";
import { ErrorState, LoadingState } from "../components/ui/States";
import {
  chartAxis,
  chartColors,
  chartCursor,
  chartGrid,
  chartTooltipProps,
} from "../lib/chart";
import { downloadCsv } from "../lib/download";
import {
  formatCurrency,
  formatPercent,
  formatSignedPercent,
} from "../lib/format";
import { apiRequest } from "../lib/api";

const seriesLabels = {
  revenue: "Gross Revenue",
  cogs: "COGS",
  opex: "Operating Expenses",
  net: "Net Profit",
};

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

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export default function Financials() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("12M");
  const [toast, setToast] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest("/api/financials");
      setData(payload);
    } catch (loadError) {
      setError(loadError.message || "Unable to load financial data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const financials = useMemo(() => data?.financials ?? [], [data]);
  const prices = useMemo(() => data?.prices ?? [], [data]);

  const visibleFinancials = useMemo(
    () => (range === "6M" ? financials.slice(-6) : financials),
    [financials, range],
  );

  const totals = useMemo(() => {
    return financials.reduce(
      (accumulator, month) => ({
        revenue: accumulator.revenue + month.revenue,
        cogs: accumulator.cogs + month.cogs,
        gross: accumulator.gross + month.gross,
        opex: accumulator.opex + month.opex,
        net: accumulator.net + month.net,
      }),
      { revenue: 0, cogs: 0, gross: 0, opex: 0, net: 0 },
    );
  }, [financials]);

  const visibleTotals = useMemo(() => {
    return visibleFinancials.reduce(
      (accumulator, month) => ({
        revenue: accumulator.revenue + month.revenue,
        cogs: accumulator.cogs + month.cogs,
        gross: accumulator.gross + month.gross,
        opex: accumulator.opex + month.opex,
        net: accumulator.net + month.net,
      }),
      { revenue: 0, cogs: 0, gross: 0, opex: 0, net: 0 },
    );
  }, [visibleFinancials]);

  const latest = financials[financials.length - 1];
  const previous = financials[financials.length - 2];
  const bestMonth = financials.length
    ? [...financials].sort((a, b) => b.net - a.net)[0]
    : null;
  const averageMargin = totals.revenue ? (totals.net / totals.revenue) * 100 : 0;
  const latestMargin = latest?.revenue ? (latest.net / latest.revenue) * 100 : 0;
  const netChange = previous?.net ? ((latest.net - previous.net) / previous.net) * 100 : 0;

  const refreshTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownload = () => {
    if (!financials.length) return;
    const rows = [
      ["Acme Financial Statement Report"],
      ["Month", "Revenue", "COGS", "Gross profit", "Operating expenses", "Net profit"],
      ...financials.map((month) => [
        month.month,
        month.revenue,
        month.cogs,
        month.gross,
        month.opex,
        month.net,
      ]),
      [],
      ["Commodity", "Current Price", "Yesterday Price", "Change %"],
      ...prices.map((price) => [price.item, price.current, price.yesterday, price.change]),
    ];
    downloadCsv("acme-financial-report.csv", rows);
    setToast(true);
    window.setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financial analytics"
        title="Financial performance"
        description="Comprehensive profit & loss analysis, cost of goods, operating expense ratios, and live market commodity references."
        actions={
          <>
            <Badge variant="info">
              <CalendarDays size={12} />
              12-Month Audited View
            </Badge>
            <Button variant="primary" size="sm" onClick={handleDownload}>
              <Download size={14} />
              Export P&L statement
            </Button>
          </>
        }
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex animate-scale-in items-center gap-2 rounded-xl border border-emerald-400/30 bg-surface px-4 py-3 text-xs font-medium text-emerald-200 shadow-2xl shadow-black/60"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          Financial statement exported to CSV successfully
        </div>
      ) : null}

      {loading ? (
        <LoadingState cards={4} />
      ) : error ? (
        <ErrorState description={error} onRetry={loadData} />
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Annual gross revenue"
              value={formatCurrency(totals.revenue, true)}
              subtitle="cumulative 12-month billings"
              icon={DollarSign}
              accent="violet"
              delay={0}
              badge="Top Line"
            />
            <MetricCard
              title="Annual net profit"
              value={formatCurrency(totals.net, true)}
              subtitle="after COGS and operating costs"
              trend={netChange}
              icon={TrendingUp}
              accent="cyan"
              delay={60}
              badge="Bottom Line"
            />
            <MetricCard
              title="Average margin"
              value={formatPercent(averageMargin)}
              subtitle="annualized net margin"
              icon={Percent}
              accent="emerald"
              delay={120}
              badge="Profitability"
            />
            <MetricCard
              title="Peak month"
              value={bestMonth?.month ?? "—"}
              subtitle={`${formatCurrency(bestMonth?.net ?? 0, true)} record net`}
              icon={CalendarDays}
              accent="amber"
              delay={180}
              badge="High Watermark"
            />
          </div>

          {/* Composed Chart Section + Latest Month Spotlight */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                title="Revenue, costs & profitability"
                description="Comparative monthly revenue and net income alongside COGS and OpEx expenditures."
                action={<RangeToggle value={range} onChange={setRange} />}
              />
              <div className="p-4 sm:p-5">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Total period revenue</p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                      {formatCurrency(visibleTotals.revenue, true)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                      Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#7cb8de]" />
                      Net profit
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-400/80" />
                      COGS
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/80" />
                      OpEx
                    </span>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={visibleFinancials}
                      margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
                    >
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
                          seriesLabels[name] ?? name,
                        ]}
                      />
                      <Bar
                        dataKey="cogs"
                        stackId="costs"
                        fill={chartColors.rose}
                        fillOpacity={0.65}
                        barSize={18}
                        animationDuration={700}
                      />
                      <Bar
                        dataKey="opex"
                        stackId="costs"
                        fill={chartColors.amber}
                        fillOpacity={0.65}
                        radius={[4, 4, 0, 0]}
                        barSize={18}
                        animationDuration={750}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={chartColors.violet}
                        strokeWidth={2.8}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: chartColors.violet }}
                        animationDuration={900}
                      />
                      <Line
                        type="monotone"
                        dataKey="net"
                        stroke={chartColors.cyan}
                        strokeWidth={2.8}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: chartColors.cyan }}
                        animationDuration={1000}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Latest month snapshot"
                description={latest ? `${latest.month} performance audit` : "No records"}
                action={
                  <Badge variant={netChange >= 0 ? "success" : "danger"}>
                    {netChange >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {formatSignedPercent(netChange)} MoM
                  </Badge>
                }
              />
              <div className="p-5">
                <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-void/40 to-transparent p-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
                    Net profit this month
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-ink tabular-nums">
                    {formatCurrency(latest?.net ?? 0, true)}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-void/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-accent"
                      style={{ width: `${Math.min(100, Math.max(0, latestMargin))}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                    <span>Net Margin Rate</span>
                    <span className="font-semibold text-slate-200 tabular-nums">
                      {formatPercent(latestMargin)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Gross Revenue", latest?.revenue ?? 0, "bg-accent"],
                    ["Gross Profit", latest?.gross ?? 0, "bg-indigo-400"],
                    ["COGS (Direct Costs)", latest?.cogs ?? 0, "bg-rose-400"],
                    ["Operating Expenses (OpEx)", latest?.opex ?? 0, "bg-amber-400"],
                  ].map(([label, value, color]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-medium text-slate-200 tabular-nums">
                          {formatCurrency(value, true)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-void/60">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{
                            width: `${Math.min(
                              100,
                              latest?.revenue ? (value / latest.revenue) * 100 : 0,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* Full Profit & Loss Table with Totals Summary */}
          <Panel>
            <PanelHeader
              title="Profit & loss ledger"
              description={`Detailed financial ledger breakdown for ${visibleFinancials.length} months.`}
              action={<Badge variant="default">{visibleFinancials.length} Months Displayed</Badge>}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[10px] uppercase tracking-wider text-slate-400 bg-void/30">
                    <th className="px-5 py-3 font-semibold">Month</th>
                    <th className="px-5 py-3 text-right font-semibold">Gross Revenue</th>
                    <th className="px-5 py-3 text-right font-semibold">COGS</th>
                    <th className="px-5 py-3 text-right font-semibold">Gross Profit</th>
                    <th className="px-5 py-3 text-right font-semibold">OpEx</th>
                    <th className="px-5 py-3 text-right font-semibold">Net Profit</th>
                    <th className="px-5 py-3 text-right font-semibold">Net Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {visibleFinancials.map((month) => (
                    <tr key={month.month} className="transition-colors hover:bg-raised/40">
                      <td className="px-5 py-3.5 font-medium text-slate-200">{month.month}</td>
                      <td className="px-5 py-3.5 text-right text-slate-300 tabular-nums">
                        {formatCurrency(month.revenue)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-rose-300/80 tabular-nums">
                        {formatCurrency(month.cogs)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-200 tabular-nums">
                        {formatCurrency(month.gross)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-amber-300/80 tabular-nums">
                        {formatCurrency(month.opex)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-emerald-300 tabular-nums">
                        {formatCurrency(month.net)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="rounded-md border border-line bg-shell px-2 py-0.5 text-xs text-slate-200 tabular-nums">
                          {formatPercent((month.net / month.revenue) * 100)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-line bg-shell/70 font-semibold text-slate-100">
                    <td className="px-5 py-4">Total ({visibleFinancials.length}M)</td>
                    <td className="px-5 py-4 text-right tabular-nums text-accent">
                      {formatCurrency(visibleTotals.revenue)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-rose-300">
                      {formatCurrency(visibleTotals.cogs)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-slate-100">
                      {formatCurrency(visibleTotals.gross)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-amber-300">
                      {formatCurrency(visibleTotals.opex)}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-emerald-300">
                      {formatCurrency(visibleTotals.net)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-300 tabular-nums">
                        {formatPercent((visibleTotals.net / visibleTotals.revenue) * 100)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Panel>

          {/* Commodity Market Reference Section */}
          <Panel>
            <PanelHeader
              title="Market commodity references"
              description="Daily benchmark prices for key material inputs influencing cost of goods."
              action={
                <div className="flex items-center gap-2">
                  <Badge variant="success">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                    Live Feed
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <RefreshCw size={11} />
                    {refreshTime}
                  </span>
                </div>
              }
            />
            <div className="grid grid-cols-1 divide-y divide-line/70 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
              {prices.map((price) => {
                const positive = price.change > 0;
                return (
                  <div
                    key={price.item}
                    className="group p-5 transition-colors hover:bg-raised/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-slate-300">{price.item}</p>
                      <Badge variant={positive ? "success" : "danger"}>
                        {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {positive ? "+" : ""}
                        {price.change}%
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink tabular-nums">
                        ${formatPrice(price.current)}
                      </span>
                      <span className="text-xs text-slate-400 tabular-nums">
                        Prev: ${formatPrice(price.yesterday)}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-void/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${positive ? "bg-emerald-400/80" : "bg-rose-400/80"}`}
                        style={{ width: `${Math.min(100, Math.abs(price.change) * 15)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
