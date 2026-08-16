import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while processing your request. Please try again.',
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex flex-col items-center text-center max-w-md mx-auto my-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-2 mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm border border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
