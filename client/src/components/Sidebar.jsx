import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, DollarSign, Users } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Main Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/business-intelligence', label: 'Business Intelligence', icon: <LineChart size={20} /> },
  { path: '/financials', label: 'Company Financials', icon: <DollarSign size={20} /> },
  { path: '/employees', label: 'Employee Management', icon: <Users size={20} /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 relative z-20 shadow-xl">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-white text-lg font-bold tracking-wider">ACME DATA</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-sm flex flex-col gap-1 items-center justify-center text-slate-500">
        <span>v1.0.0</span>
        <span>Internal BI Tool</span>
      </div>
    </aside>
  );
}
