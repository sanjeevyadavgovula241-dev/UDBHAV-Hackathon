import React, { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import { DollarSign, TrendingUp, Download, PieChart, Star, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export default function BusinessIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/business-intelligence')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  if (loading) return <div className="flex h-full items-center justify-center text-slate-500">Loading BI Data...</div>;
  if (!data) return <div className="text-red-500">Error loading data.</div>;

  const { summary, popularProducts, profitableClients } = data;
  const productOfTheMonth = popularProducts[0];

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <Download size={18} />
          Report downloaded successfully
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Monthly Intelligence Report</h2>
          <p className="text-sm text-slate-500">Data last synced today</p>
        </div>
        <button onClick={handleDownload} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm opacity-90 hover:opacity-100">
          <Download size={16} /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={`$${summary.revenue.toLocaleString()}`} icon={DollarSign} trend={5.2} subtitle="vs last month" />
        <MetricCard title="Total Expenses" value={`$${summary.expenses.toLocaleString()}`} icon={PieChart} trend={-2.4} subtitle="decrease" />
        <MetricCard title="Net Profit" value={`$${summary.netProfit.toLocaleString()}`} icon={TrendingUp} trend={8.1} subtitle="vs last month" />
        <MetricCard title="Profit Margin" value={`${summary.margin}%`} icon={Activity} trend={1.5} subtitle="pp vs last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Product */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Best Selling Products</h2>
          </div>
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-start gap-4">
            <div className="bg-indigo-500 text-white p-3 rounded-full flex-shrink-0">
              <Star size={24} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">Product of the Month</h3>
              <p className="text-xl font-bold text-slate-800">{productOfTheMonth?.name}</p>
              <p className="text-sm text-slate-600 mt-1">{productOfTheMonth?.unitsSold.toLocaleString()} units sold</p>
              <p className="text-xs text-indigo-500 mt-2 font-medium">Updates automatically after every sale or during festival seasons.</p>
            </div>
          </div>
          <div className="h-48 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularProducts} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="unitsSold" radius={[0, 4, 4, 0]} barSize={20}>
                  {popularProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Profitable Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Most Profitable Clients</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium text-right">Net Profit</th>
                  <th className="px-4 py-3 font-medium text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profitableClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-800">{client.name}</td>
                    <td className="px-4 py-4 text-slate-500">${client.revenue.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-400">${client.costToServe.toLocaleString()}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-600 text-right">${client.netProfit.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                        {client.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
