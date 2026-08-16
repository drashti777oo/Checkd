import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-health-500 border-t-transparent"></div>
    </div>
  );
};
