import React from 'react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-4xl font-bold text-slate-800">404</h1>
      <p className="text-slate-500 mt-2">Page Not Found</p>
    </div>
  );
};
