import React from 'react';

export const UploadDropzone: React.FC<{ onFileSelect?: (file: File) => void }> = () => {
  return (
    <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-health-500">
      <p className="text-sm font-medium text-slate-700">Drag & drop lab report or image scan here</p>
      <span className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 10MB</span>
    </div>
  );
};
