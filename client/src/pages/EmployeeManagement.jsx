import React, { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import { Users, Banknote, ShieldCheck, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function EmployeeManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/employees')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center text-slate-500">Loading Employee Data...</div>;
  if (!data) return <div className="text-red-500">Error loading data.</div>;

  const { employees } = data;
  
  // Salary calculations
  const totalPayroll = employees.reduce((sum, e) => sum + e.baseSalary + e.bonus, 0);
  const paidCount = employees.filter(e => e.status === 'Paid').length;
  const pendingCount = employees.filter(e => e.status === 'Pending').length;

  // Efficiency data
  const topPerformer = [...employees].sort((a,b) => b.efficiency - a.efficiency)[0];
  
  const deptEfficiency = Array.from(new Set(employees.map(e => e.department))).map(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const avg = deptEmps.reduce((sum, e) => sum + e.efficiency, 0) / deptEmps.length;
    return { department: dept, score: Math.round(avg) };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Payroll" value={`$${(totalPayroll/1000).toFixed(1)}k`} icon={Banknote} subtitle="this month" />
        <MetricCard title="Salaries Paid" value={paidCount} icon={ShieldCheck} trend={100} subtitle="completion" />
        <MetricCard title="Payments Pending" value={pendingCount} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Performer */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-sm border border-indigo-500 p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 mb-6 uppercase tracking-wider text-xs font-bold">
              <Award size={16} /> Top Performer
            </div>
            <h3 className="text-2xl font-bold">{topPerformer.name}</h3>
            <p className="text-indigo-200 mt-1">{topPerformer.role}, {topPerformer.department}</p>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-indigo-100">Efficiency Score</span>
              <span className="text-3xl font-bold">{topPerformer.efficiency}<span className="text-lg text-indigo-300">/100</span></span>
            </div>
            <div className="w-full bg-indigo-900/50 rounded-full h-3">
              <div className="bg-white h-3 rounded-full" style={{ width: `${topPerformer.efficiency}%` }}></div>
            </div>
          </div>
        </div>

        {/* Dept Efficiency Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Department Efficiency Average</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptEfficiency} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Employee Directory & Salary Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Efficiency</th>
                <th className="px-6 py-3 font-medium">Compensation (Base + Bonus)</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{emp.name}</td>
                  <td className="px-6 py-4 text-slate-500">{emp.role}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs">{emp.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${emp.efficiency > 85 ? 'bg-emerald-500' : emp.efficiency > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${emp.efficiency}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600">{emp.efficiency}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    ${(emp.baseSalary + emp.bonus).toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal ml-1">
                      (${emp.baseSalary/1000}k + ${emp.bonus/1000}k)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
