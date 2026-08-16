import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>
    </div>
  );
}
