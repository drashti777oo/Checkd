import React from 'react';
import { Navbar } from '../components/common/Navbar';

export const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
};
