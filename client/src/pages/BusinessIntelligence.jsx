import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  DollarSign,
  Download,
  PieChart as PieChartIcon,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { SearchInput } from "../components/ui/Input";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import {
  chartAxis,
  chartColors,
  chartCursor,
  chartGrid,
  chartTooltipProps,
} from "../lib/chart";
import { statusVariant } from "../lib/status";
import { downloadCsv } from "../lib/download";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import { apiRequest } from "../lib/api";

const pieColors = [
  chartColors.violet,
  chartColors.cyan,
  chartColors.indigo,
  chartColors.emerald,
  chartColors.rose,
];

function Toggle({ options, value, onChange }) {
  return (
    <div className="flex rounded-lg border border-line bg-shell/80 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            value === option.value
              ? "bg-raised text-ink shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function BusinessIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(false);
  const [productMetric, setProductMetric] = useState("unitsSold");
  const [clientSort, setClientSort] = useState("netProfit");
  const [clientSearch, setClientSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest("/api/business-intelligence");
      setData(payload);
    } catch (loadError) {
      setError(loadError.message || "Unable to load business intelligence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortedClients = useMemo(() => {
    if (!data) return [];
    let list = [...data.profitableClients];
    if (clientSearch.trim()) {
      const term = clientSearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.industry.toLowerCase().includes(term) ||
          c.status.toLowerCase().includes(term),
      );
    }
    return list.sort((a, b) => b[clientSort] - a[clientSort]);
  }, [data, clientSort, clientSearch]);

  const totalNetProfit = useMemo(
    () =>
      data
        ? data.profitableClients.reduce((sum, client) => sum + client.netProfit, 0)
        : 0,
    [data],
  );

  const handleDownload = () => {
    if (!data) return;
    const { summary, popularProducts, profitableClients } = data;
    const rows = [
      ["Acme Intelligence Report"],
      ["Metric", "Value"],
      ["Total revenue", summary.revenue],
      ["Total expenses", summary.expenses],
      ["Net profit", summary.netProfit],
      ["Profit margin", `${summary.margin}%`],
      [],
      ["Client", "Revenue", "Cost to serve", "Net profit", "Margin %"],
      ...profitableClients.map((client) => [
        client.name,
        client.revenue,
        client.costToServe,
        client.netProfit,
        client.profitMargin.toFixed(1),
      ]),
      [],
      ["Product", "Supplier", "Stock", "Status", "Units sold"],
      ...popularProducts.map((product) => [
        product.name,
        product.supplier,
        product.stock,
        product.status,
        product.unitsSold,
      ]),
    ];
    downloadCsv("acme-intelligence-report.csv", rows);
    setToast(true);
    window.setTimeout(() => setToast(false), 3000);
  };

  const summary = data?.summary;
  const popularProducts = data?.popularProducts ?? [];
  const productOfTheMonth = popularProducts[0];

  const pieData = (data?.profitableClients ?? []).map((client) => ({
    name: client.name,
    value: client.netProfit,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytical workspace"
        title="Business intelligence"
        description="Analyze product velocity, client profitability profiles, and operational margins derived directly from verified application records."
        actions={
          <>
            <Badge variant="info">
              <Activity size={12} />
              Live Workspace Data
            </Badge>
            <Button variant="primary" size="sm" onClick={handleDownload}>
              <Download size={14} />
              Export intelligence report
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
          Acme intelligence report downloaded successfully
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
              title="Total revenue"
              value={formatCurrency(summary.revenue, true)}
              subtitle="gross operational receipts"
              icon={DollarSign}
              accent="violet"
              delay={0}
              badge="Current Period"
            />
            <MetricCard
              title="Total expenses"
              value={formatCurrency(summary.expenses, true)}
              subtitle="operating costs + COGS"
              icon={PieChartIcon}
              accent="rose"
              delay={60}
              badge="Expenditure"
            />
            <MetricCard
              title="Net profit"
              value={formatCurrency(summary.netProfit, true)}
              subtitle="post-operating surplus"
              icon={TrendingUp}
              accent="cyan"
              delay={120}
              badge="Net Earnings"
            />
            <MetricCard
              title="Profit margin"
              value={formatPercent(summary.margin)}
              subtitle="net bottom-line efficiency"
              icon={Activity}
              accent="emerald"
              delay={180}
              badge="Efficiency"
            />
          </div>

          {/* Product Performance Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                title="Product catalog performance"
                description="Comparative sell-through units and active inventory volume."
                action={
                  <Toggle
                    value={productMetric}
                    onChange={setProductMetric}
                    options={[
                      { value: "unitsSold", label: "Units sold" },
                      { value: "stock", label: "Current stock" },
                    ]}
                  />
                }
              />
              <div className="p-4 sm:p-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      {productMetric === "unitsSold" ? "Total units sold" : "Total stock volume"}
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                      {formatNumber(
                        popularProducts.reduce((sum, product) => sum + product[productMetric], 0),
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">Across {popularProducts.length} tracked items</p>
                </div>
                <div className="h-[270px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularProducts}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke={chartGrid} />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartAxis, fontSize: 10 }}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartAxis, fontSize: 11 }}
                        width={130}
                      />
                      <Tooltip
                        {...chartTooltipProps}
                        cursor={chartCursor}
                        formatter={(value) => [
                          formatNumber(Number(value)),
                          productMetric === "unitsSold" ? "Units Sold" : "Units In Stock",
                        ]}
                      />
                      <Bar
                        dataKey={productMetric}
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                        animationDuration={800}
                      >
                        {popularProducts.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={index === 0 ? chartColors.violet : chartColors.indigo}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Product of the month"
                description="Highest aggregate sell-through volume."
                action={<Badge variant="violet"><Star size={11} /> Top seller</Badge>}
              />
              <div className="p-5">
                <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.12] via-void/40 to-transparent p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent shadow-sm">
                    <Star size={18} />
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                    {productOfTheMonth?.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Supplier: {productOfTheMonth?.supplier}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-line bg-void/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Sold units</p>
                      <p className="mt-1 font-display text-xl font-semibold text-accent tabular-nums">
                        {formatNumber(productOfTheMonth?.unitsSold ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-void/50 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">In stock</p>
                      <p className="mt-1 font-display text-xl font-semibold text-ink tabular-nums">
                        {formatNumber(productOfTheMonth?.stock ?? 0)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge variant={statusVariant(productOfTheMonth?.status)}>
                      {productOfTheMonth?.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    Secondary Products Run-rate
                  </p>
                  {popularProducts.slice(1).map((product) => (
                    <div key={product.id}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-slate-300">{product.name}</span>
                        <span className="shrink-0 text-slate-400 tabular-nums">
                          {formatNumber(product.unitsSold)} sold
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-void/60">
                        <div
                          className="h-full rounded-full bg-indigo-400/70"
                          style={{
                            width: `${Math.min(
                              100,
                              (product.unitsSold / (productOfTheMonth?.unitsSold || 1)) * 100,
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

          {/* Client Profitability Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader
                title="Client profitability breakdown"
                description="Client accounts ranked by contribution margin after service expenditure."
                action={
                  <Toggle
                    value={clientSort}
                    onChange={setClientSort}
                    options={[
                      { value: "netProfit", label: "Net profit" },
                      { value: "profitMargin", label: "Margin %" },
                    ]}
                  />
                }
              />

              <div className="border-b border-line/80 px-5 py-3 bg-shell/40">
                <SearchInput
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Filter clients by name, industry, or status..."
                  className="max-w-md"
                />
              </div>

              {sortedClients.length === 0 ? (
                <EmptyState
                  title="No clients match your filter"
                  description="Try adjusting your search query."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setClientSearch("")}>
                      Clear filter
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[10px] uppercase tracking-wider text-slate-400 bg-void/30">
                        <th className="px-5 py-3 font-semibold">Client</th>
                        <th className="px-5 py-3 text-right font-semibold">Revenue</th>
                        <th className="px-5 py-3 text-right font-semibold">Cost to serve</th>
                        <th className="px-5 py-3 text-right font-semibold">Net profit</th>
                        <th className="px-5 py-3 text-right font-semibold">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/70">
                      {sortedClients.map((client) => (
                        <tr
                          key={client.id}
                          className="transition-colors hover:bg-raised/40"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-semibold text-slate-100">{client.name}</span>
                              <Badge variant={statusVariant(client.status)}>{client.status}</Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-400">{client.industry}</p>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-300 tabular-nums">
                            {formatCurrency(client.revenue, true)}
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-400 tabular-nums">
                            {formatCurrency(client.costToServe, true)}
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-emerald-300 tabular-nums">
                            {formatCurrency(client.netProfit, true)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="rounded-md border border-line bg-shell px-2 py-0.5 text-xs font-medium text-slate-200 tabular-nums">
                              {formatPercent(client.profitMargin)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            <Panel>
              <PanelHeader
                title="Profit distribution"
                description="Share of total net profit by client account."
                action={<Badge variant="violet"><PieChartIcon size={11} /> Portfolio</Badge>}
              />
              <div className="p-5">
                <div className="relative h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={64}
                        outerRadius={90}
                        paddingAngle={3}
                        stroke="none"
                        animationDuration={800}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...chartTooltipProps}
                        formatter={(value, name) => [formatCurrency(Number(value)), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-medium">
                      Total net
                    </span>
                    <span className="mt-1 font-display text-2xl font-bold text-ink tabular-nums">
                      {formatCurrency(totalNetProfit, true)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2.5 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: pieColors[index % pieColors.length] }}
                      />
                      <span className="min-w-0 flex-1 truncate text-slate-300">{entry.name}</span>
                      <span className="text-slate-400 tabular-nums font-medium">
                        {formatCurrency(entry.value, true)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
