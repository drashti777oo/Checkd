import React from 'react';
import { Button } from '../components/ui/button';

export const Landing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
      <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
        AI-Powered Health Intelligence
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        Monitor vitals, run computer vision diagnostic checks, and get instant privacy-preserving AI explanations.
      </p>
      <div className="mt-8 flex gap-4">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
};
