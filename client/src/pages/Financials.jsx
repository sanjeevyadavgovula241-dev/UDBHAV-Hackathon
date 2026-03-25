import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

export default function Financials() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/financials')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center text-slate-500">Loading Financial Data...</div>;
  if (!data) return <div className="text-red-500">Error loading data.</div>;

  const { financials, prices } = data;
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const refreshTime = new Date().toLocaleTimeString('short');

  return (
    <div className="space-y-6">
      
      {/* P&L Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Profit & Loss Statement — Monthly View</h2>
            <p className="text-xs text-slate-500 mt-1">Last updated: {currentMonth}</p>
          </div>
        </div>
        
        <div className="p-6 border-b border-slate-200">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financials} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Net Profit']}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="net" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium">Month</th>
                <th className="px-6 py-3 font-medium text-right">Revenue</th>
                <th className="px-6 py-3 font-medium text-right">COGS</th>
                <th className="px-6 py-3 font-medium text-right bg-slate-100/50">Gross Profit</th>
                <th className="px-6 py-3 font-medium text-right">OpEx</th>
                <th className="px-6 py-3 font-medium text-right bg-indigo-50/50 text-indigo-900">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {financials.map(row => (
                <tr key={row.month} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-800">{row.month}</td>
                  <td className="px-6 py-3 text-right text-slate-600">${row.revenue.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-slate-500">${row.cogs.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-medium text-slate-700 bg-slate-50/50">${row.gross.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-slate-500">${row.opex.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-bold text-indigo-700 bg-indigo-50/30">${row.net.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Prices */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Market Commodity Prices</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <RefreshCw size={14} /> Prices update daily — Last refreshed: {refreshTime}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {prices.map(price => {
            const isPos = price.change > 0;
            return (
              <div key={price.item} className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">{price.item}</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-slate-800">{price.current.toLocaleString()}</span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPos ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(price.change)}%
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Prev: {price.yesterday}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
