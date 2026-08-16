import React from 'react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col gap-2 min-h-screen">
      <nav className="flex flex-col gap-1">
        <a href="#dashboard" className="px-3 py-2 rounded-md bg-health-50 text-health-700 font-medium">Dashboard</a>
        <a href="#analysis" className="px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100">AI Analysis</a>
        <a href="#profile" className="px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100">Profile</a>
      </nav>
    </aside>
  );
};
