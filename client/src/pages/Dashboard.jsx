import React, { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import { Users, DollarSign, Activity, Package, AlertTriangle, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiActions, setAiActions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard');
        const json = await res.json();
        setData(json);

        // Fetch AI insights
        fetch('http://localhost:5000/api/ai/client-insights', { method: 'POST' })
          .then(r => r.json())
          .then(d => setAiInsights(d.text))
          .catch(e => console.error(e));

        fetch('http://localhost:5000/api/ai/sales-actions', { method: 'POST' })
          .then(r => r.json())
          .then(d => setAiActions(d.text))
          .catch(e => console.error(e));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center text-slate-500">Loading Dashboard Data...</div>;
  if (!data) return <div className="text-red-500">Error loading data. Make sure backend is running.</div>;

  const { metrics, clients, pipeline, products } = data;

  // Render markdown bullets for AI
  const formatAIResponse = (text) => {
    if (!text) return <div className="animate-pulse h-12 bg-slate-100 rounded"></div>;
    return (
      <ul className="space-y-2 text-sm text-slate-600">
        {text.split('\n').filter(l => l.trim().startsWith('-')).map((line, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>{line.replace(/^-\s*/, '').replace(/\*\*/g, '')}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Clients" value={metrics.totalClients} icon={Users} trend={12.5} subtitle="vs last month" />
        <MetricCard title="New Clients" value={metrics.newClientsThisMonth} icon={Activity} />
        <MetricCard title="Churn Rate" value={`${metrics.churnRate}%`} icon={AlertTriangle} trend={-1.2} subtitle="decrease" />
        <MetricCard title="Monthly Revenue" value={`$${(metrics.mrr / 1000).toFixed(1)}k`} icon={DollarSign} trend={8.4} subtitle="vs last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Client Roster</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Industry</th>
                  <th className="px-6 py-3 font-medium">Revenue</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{client.name}</td>
                    <td className="px-6 py-4 text-slate-500">{client.industry}</td>
                    <td className="px-6 py-4 text-slate-600">${client.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Client Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-500" size={20} />
              <h2 className="text-lg font-semibold text-slate-800">AI Client Insights</h2>
            </div>
            <div className="flex-1 bg-indigo-50/50 rounded-lg p-4 border border-indigo-50 text-slate-700">
              {formatAIResponse(aiInsights)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Pipeline Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Sales Pipeline</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `$${v/1000}k`} stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Pipeline Value']}
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <Sparkles size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Sales Recommendations</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Suggested actions pipeline conversion:</p>
          <div className="flex-1">
            {formatAIResponse(aiActions)}
          </div>
        </div>
      </div>

      {/* Inventory & Suppliers */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Inventory Status</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> In Stock</span>
            <span className="flex items-center gap-1.5 ml-3"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Low Stock</span>
            <span className="flex items-center gap-1.5 ml-3"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Out of Stock</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                <span className={`w-3 h-3 rounded-full ${p.status === 'In Stock' ? 'bg-emerald-500' : p.status === 'Low Stock' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{p.supplier}</p>
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-600">{p.stock} units</span>
                {p.status !== 'In Stock' && (
                  <span className="text-xs font-medium text-rose-600">Restock Needed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
