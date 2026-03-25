import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Main Dashboard';
      case '/business-intelligence': return 'Business Intelligence';
      case '/financials': return 'Company Financials';
      case '/employees': return 'Employee Management';
      default: return 'Acme BI';
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">{getPageTitle(location.pathname)}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
