import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 font-bold text-xl text-health-700">
        <span>Checkd Health</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">Hackathon Mode</span>
      </div>
    </header>
  );
};
