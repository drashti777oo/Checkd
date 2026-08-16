import React from 'react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      {children}
    </div>
  );
};
