import React from 'react';
import { UploadDropzone } from '../components/health/UploadDropzone';
import { Button } from '../components/ui/button';

export const HealthAnalysis: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">AI Diagnostic Scan & Analysis</h1>
      <UploadDropzone />
      <Button className="w-full">Run AI Assessment</Button>
    </div>
  );
};
