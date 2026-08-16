import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

type Step = 'input' | 'processing';

export default function HealthCheckPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
  };

  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Navigate to mock result page after processing
            setTimeout(() => navigate('/history/latest'), 500);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step, navigate]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {step === 'input' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Start Health Check</h1>
            <p className="text-slate-600 mt-2">
              Provide your details or upload your health data to begin the analysis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">How are you feeling today?</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Describe any symptoms or how you feel..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload relevant data (optional)</label>
                <div className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-slate-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500">Images, PDFs, or Health Exports</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {step === 'processing' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 space-y-8"
        >
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <Activity className="h-10 w-10 text-blue-600 animate-pulse" />
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-slate-200 stroke-current"
                strokeWidth="4"
                cx="50"
                cy="50"
                r="46"
                fill="transparent"
              ></circle>
              <circle
                className="text-blue-600 stroke-current transition-all duration-300 ease-out"
                strokeWidth="4"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="46"
                fill="transparent"
                strokeDasharray="289.026"
                strokeDashoffset={289.026 - (289.026 * progress) / 100}
              ></circle>
            </svg>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Analyzing your check...</h2>
            <p className="mt-2 text-slate-600">Please wait while Checkd processes your results.</p>
          </div>

          <div className="w-full max-w-md space-y-3">
            {[
              { label: 'Uploading data', progress: progress > 20 },
              { label: 'Running ML analysis', progress: progress > 50 },
              { label: 'Generating AI explanation', progress: progress > 80 },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {s.progress ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                )}
                <span className={s.progress ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
