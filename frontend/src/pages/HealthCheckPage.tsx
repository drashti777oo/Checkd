import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, ArrowRight, Upload, AlertCircle, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { healthService } from '../services/health.service';
import { aiService } from '../services/ai.service';
import { useHealthStore } from '../store/useHealthStore';

type Step = 'input' | 'processing';

export default function HealthCheckPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    setActiveRecord,
    setActiveAnalysis,
    setActiveExplanation,
    setActiveRecommendations,
  } = useHealthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid file format. Please upload a PDF medical/laboratory report.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller PDF report.');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!notes.trim() && !selectedFile) {
      setErrorMessage('Please describe how you feel or upload a PDF health report to begin.');
      return;
    }

    setStep('processing');
    setProgress(10);

    try {
      // Step 1: Submit Health Record (Upload PDF if present, or submit symptoms record)
      let record;
      if (selectedFile) {
        record = await healthService.uploadHealthRecord(selectedFile, notes);
      } else {
        record = await healthService.createHealthRecord({
          record_type: 'vitals',
          data: {
            symptoms: notes,
            submitted_at: new Date().toISOString(),
          },
        });
      }

      setActiveRecord(record);
      setProgress(35);

      // Step 2: Trigger ML Analysis
      const analysis = await aiService.createMLAnalysis(record.id);
      setActiveAnalysis(analysis);
      setProgress(60);

      // Explicit Check: If model is not configured, STOP downstream workflow gracefully!
      if (analysis.status === 'model_not_configured') {
        setProgress(100);
        setTimeout(() => {
          navigate(`/history/${record.id}`);
        }, 500);
        return;
      }

      // Step 3: Generate LLM Explanation
      if (analysis.status === 'completed') {
        try {
          const explanation = await aiService.generateExplanation(analysis.id);
          setActiveExplanation(explanation);
        } catch (expError) {
          console.warn('LLM explanation generation skipped or failed', expError);
        }
        setProgress(85);

        // Step 4: Generate Recommendations
        try {
          const recsResponse = await aiService.generateRecommendations(analysis.id);
          setActiveRecommendations(recsResponse.items);
        } catch (recError) {
          console.warn('Recommendations generation skipped or failed', recError);
        }
        setProgress(100);
      }

      setTimeout(() => {
        navigate(`/history/${record.id}`);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during health check processing.');
      setStep('input');
    }
  };

  useEffect(() => {
    if (step === 'processing' && progress < 90) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 5));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step, progress]);

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
              Provide details on how you feel or upload a PDF lab report for automated analysis.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">How are you feeling today?</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Describe any symptoms, energy level, sleep, or how you feel..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload medical / lab PDF report</label>
                {selectedFile ? (
                  <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 rounded-full text-slate-400 hover:bg-blue-100 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                      <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                          <span>Select a PDF report</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-slate-500">PDF Medical Reports (Max 10MB)</p>
                    </div>
                  </div>
                )}
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
            <p className="mt-2 text-slate-600">Please wait while Checkd extracts metrics and processes your results.</p>
          </div>

          <div className="w-full max-w-md space-y-3">
            {[
              { label: selectedFile ? 'Uploading PDF & extracting metrics' : 'Uploading health telemetry', progress: progress >= 30 },
              { label: 'Running ML analysis', progress: progress >= 60 },
              { label: 'Generating AI explanation & recommendations', progress: progress >= 85 },
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
