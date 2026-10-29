import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, Banknote, ShieldCheck, TrendingUp, Users, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "../components/MetricCard";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import Panel, { PanelHeader } from "../components/ui/Panel";
import { SearchInput, Select } from "../components/ui/Input";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import {
  chartAxis,
  chartColors,
  chartCursor,
  chartGrid,
  chartTooltipProps,
} from "../lib/chart";
import { formatCurrency, formatNumber } from "../lib/format";
import { statusVariant } from "../lib/status";
import { apiRequest } from "../lib/api";

function EfficiencyBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-void/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 90 ? "bg-emerald-400" : value >= 80 ? "bg-accent" : value >= 70 ? "bg-amber-400" : "bg-rose-400"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-300 tabular-nums">{value}%</span>
    </div>
  );
}

export default function EmployeeManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest("/api/employees");
      setData(payload);
    } catch (loadError) {
      setError(loadError.message || "Unable to load employee data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const employees = useMemo(() => data?.employees ?? [], [data]);

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department))].sort(),
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const term = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesQuery =
        !term ||
        `${employee.name} ${employee.role} ${employee.department}`.toLowerCase().includes(term);
      const matchesDepartment = department === "all" || employee.department === department;
      const matchesStatus = status === "all" || employee.status === status;
      return matchesQuery && matchesDepartment && matchesStatus;
    });
  }, [department, employees, query, status]);

  const totalPayroll = employees.reduce(
    (sum, employee) => sum + employee.baseSalary + employee.bonus,
    0,
  );
  const paidCount = employees.filter((employee) => employee.status === "Paid").length;
  const pendingCount = employees.filter((employee) => employee.status === "Pending").length;
  const averageEfficiency = employees.length
    ? Math.round(
        employees.reduce((sum, employee) => sum + employee.efficiency, 0) / employees.length,
      )
    : 0;
  const topPerformer = [...employees].sort((a, b) => b.efficiency - a.efficiency)[0];

  const deptEfficiency = useMemo(
    () =>
      [...new Set(employees.map((employee) => employee.department))].map((dept) => {
        const departmentEmployees = employees.filter(
          (employee) => employee.department === dept,
        );
        const average =
          departmentEmployees.reduce((sum, employee) => sum + employee.efficiency, 0) /
          departmentEmployees.length;
        return { department: dept, score: Math.round(average) };
      }),
    [employees],
  );

  const hasFilters = Boolean(query.trim()) || department !== "all" || status !== "all";

  const clearFilters = () => {
    setQuery("");
    setDepartment("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People & payroll"
        title="Team performance & payroll"
        description="Monitor staff compensation disbursement, department efficiency benchmarks, and workforce allocation from one centralized workspace."
        actions={
          <Badge variant="info">
            <Users size={12} />
            {formatNumber(employees.length)} Active Headcount
          </Badge>
        }
      />

      {loading ? (
        <LoadingState cards={4} />
      ) : error ? (
        <ErrorState description={error} onRetry={loadData} />
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total annual payroll"
              value={formatCurrency(totalPayroll, true)}
              subtitle="base compensation + bonus pool"
              icon={Banknote}
              accent="violet"
              delay={0}
              badge="Budget"
            />
            <MetricCard
              title="Average efficiency"
              value={`${averageEfficiency}%`}
              subtitle="across all departments"
              icon={TrendingUp}
              accent="cyan"
              delay={60}
              badge="Operations"
            />
            <MetricCard
              title="Salaries disbursed"
              value={paidCount}
              subtitle={`${employees.length ? Math.round((paidCount / employees.length) * 100) : 0}% processed successfully`}
              icon={ShieldCheck}
              accent="emerald"
              delay={120}
              badge="Disbursed"
            />
            <MetricCard
              title="Payments pending"
              value={pendingCount}
              subtitle="awaiting manager sign-off"
              icon={Users}
              accent="amber"
              delay={180}
              badge="Action Required"
            />
          </div>

          {/* Top Performer Spotlight + Department Efficiency Bar Chart */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="min-h-[280px] border-accent/20">
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.14] via-void/40 to-transparent"
                aria-hidden="true"
              />
              <div className="relative flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                    <Award size={15} />
                    Top performer
                  </div>
                  <Badge variant="success">Benchmark Lead</Badge>
                </div>
                <div className="mt-6 flex items-center gap-3.5">
                  <Avatar name={topPerformer?.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-bold tracking-[-0.03em] text-ink">
                      {topPerformer?.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {topPerformer?.role} · {topPerformer?.department}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-8">
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-xs text-slate-400 font-medium">Efficiency Index</span>
                    <span className="font-display text-2xl font-bold tracking-[-0.03em] text-ink tabular-nums">
                      {topPerformer?.efficiency}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-void/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-[#7cb8de]"
                      style={{ width: `${topPerformer?.efficiency ?? 0}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Highest performance and output rating recorded in the current active team.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="lg:col-span-2">
              <PanelHeader
                title="Department efficiency benchmarks"
                description="Average performance output score grouped by department."
                action={
                  <Badge variant="violet">
                    <TrendingUp size={11} />
                    Company Average: {averageEfficiency}%
                  </Badge>
                }
              />
              <div className="p-5">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptEfficiency}
                      margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} stroke={chartGrid} />
                      <XAxis
                        dataKey="department"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartAxis, fontSize: 11 }}
                        tickMargin={10}
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
                        formatter={(value) => [`${value}%`, "Average Efficiency"]}
                      />
                      <Bar
                        dataKey="score"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                        animationDuration={800}
                      >
                        {deptEfficiency.map((entry, index) => (
                          <Cell
                            key={`dept-${index}`}
                            fill={
                              entry.score >= 90
                                ? chartColors.emerald
                                : entry.score >= 85
                                  ? chartColors.violet
                                  : chartColors.indigo
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Panel>
          </div>

          {/* Employee Directory Section with Table and Filters */}
          <Panel>
            <PanelHeader
              title="Employee directory & compensation"
              description={`Displaying ${filteredEmployees.length} of ${employees.length} team members.`}
              action={
                <div className="flex items-center gap-2">
                  <Badge variant="success">{paidCount} Paid</Badge>
                  <Badge variant="warning">{pendingCount} Pending</Badge>
                </div>
              }
            />

            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center bg-shell/40">
              <SearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search staff by name, role, or department..."
                className="flex-1"
                aria-label="Search employees"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  aria-label="Filter by department"
                  className="min-w-[150px]"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
                <Select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Filter by payroll status"
                  className="min-w-[130px]"
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </Select>
                {hasFilters ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    aria-label="Clear filters"
                    title="Clear filters"
                  >
                    <X size={15} />
                  </Button>
                ) : null}
              </div>
            </div>

            {filteredEmployees.length === 0 ? (
              <EmptyState
                title="No employees match your search"
                description="Try adjusting your department filter, status, or search keywords."
                action={
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Reset search filters
                  </Button>
                }
              />
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[10px] uppercase tracking-wider text-slate-400 bg-void/30">
                        <th className="px-5 py-3 font-semibold">Employee</th>
                        <th className="px-5 py-3 font-semibold">Role</th>
                        <th className="px-5 py-3 font-semibold">Department</th>
                        <th className="px-5 py-3 font-semibold">Efficiency score</th>
                        <th className="px-5 py-3 text-right font-semibold">Total compensation</th>
                        <th className="px-5 py-3 text-right font-semibold">Payroll status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/70">
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="transition-colors hover:bg-raised/40"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={employee.name} size="sm" />
                              <span className="font-semibold text-slate-100">{employee.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300">{employee.role}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="default">{employee.department}</Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <EfficiencyBar value={employee.efficiency} />
                          </td>
                          <td className="px-5 py-3.5 text-right tabular-nums">
                            <span className="font-semibold text-slate-100">
                              {formatCurrency(employee.baseSalary + employee.bonus)}
                            </span>
                            <span className="ml-2 text-xs text-slate-400">
                              ({formatCurrency(employee.baseSalary, true)} +{" "}
                              {formatCurrency(employee.bonus, true)})
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Badge variant={statusVariant(employee.status)}>
                              {employee.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="divide-y divide-line/70 md:hidden">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={employee.name} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-100">
                              {employee.name}
                            </p>
                            <Badge variant={statusVariant(employee.status)}>
                              {employee.status}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {employee.role} · {employee.department}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <EfficiencyBar value={employee.efficiency} />
                            <span className="text-xs font-semibold text-slate-200 tabular-nums">
                              {formatCurrency(employee.baseSalary + employee.bonus)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
