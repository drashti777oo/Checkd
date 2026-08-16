import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, ArrowRight, Upload, AlertCircle, FileText, X, Sparkles, ShieldCheck, FileSpreadsheet, Brain, HeartPulse } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { healthService } from '../services/health.service';
import { aiService } from '../services/ai.service';
import { useHealthStore } from '../store/useHealthStore';

type Step = 'input' | 'processing';

/** Extracts a user-facing error message from an Axios error or a standard Error. */
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
    if (axiosErr.response?.data?.detail) return axiosErr.response.data.detail;
    if (axiosErr.message) return axiosErr.message;
  }
  return 'An unexpected error occurred during health check processing.';
}

export default function HealthCheckPage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>('input');
  const [progress, setProgress] = useState(0);
  const [currentStageText, setCurrentStageText] = useState('Initializing health check...');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Ref guard: prevents double-submission on rapid clicks or slow network
  const isSubmittingRef = useRef(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid file format. Please upload a PDF medical or laboratory report.');
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

    // Double-submit guard
    if (isSubmittingRef.current) return;

    if (!notes.trim() && !selectedFile) {
      setErrorMessage('Please describe how you feel or upload a PDF health report to begin.');
      return;
    }

    isSubmittingRef.current = true;
    setStep('processing');
    setProgress(15);
    setCurrentStageText(selectedFile ? 'Uploading PDF & extracting lab metrics...' : 'Logging health telemetry...');

    try {
      // Step 1: Submit Health Record (Upload PDF or Submit Vitals)
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
      setProgress(40);
      setCurrentStageText('Running automated health analysis...');

      // Step 2: Trigger ML Analysis
      const analysis = await aiService.createMLAnalysis(record.id);
      setActiveAnalysis(analysis);
      setProgress(65);

      // When model is not configured: still try to generate explanation + recs
      // (LLM service has an unconfigured fallback, recs use deterministic rules)
      setCurrentStageText('Generating AI explanation & insights...');
      try {
        const explanation = await aiService.generateExplanation(analysis.id);
        setActiveExplanation(explanation);
      } catch (expError) {
        console.warn('LLM explanation generation skipped or failed', expError);
      }
      setProgress(85);

      // Step 4: Generate Recommendations (deterministic, works regardless of ML status)
      setCurrentStageText('Formulating personalized action recommendations...');
      try {
        const recsResponse = await aiService.generateRecommendations(analysis.id);
        setActiveRecommendations(recsResponse.items);
      } catch (recError) {
        console.warn('Recommendations generation skipped or failed', recError);
      }
      setProgress(100);

      setTimeout(() => {
        navigate(`/history/${record.id}`);
      }, 500);
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err));
      setStep('input');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  useEffect(() => {
    if (step === 'processing' && progress < 90) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 3));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step, progress]);

  const hasValidInput = notes.trim().length > 0 || selectedFile !== null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 font-sans selection:bg-[#ffb800]/30 space-y-10">
      
      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* HEADER SECTION */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Automated Health Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Health Check
            </h1>
            <p className="text-lg font-semibold text-slate-800">
              Understand what your body is telling you.
            </p>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Describe how you're feeling today or upload a PDF medical report. Checkd will extract key metrics and organize the information into clear, understandable insights.
            </p>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-center gap-3 shadow-2xs"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-rose-800">{errorMessage}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* TWO INPUT PATHS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SECTION 1: HOW ARE YOU FEELING */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-bold text-[#0f172a]">How are you feeling?</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Tell us what you're experiencing today.</p>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-xs sm:text-sm text-[#0f172a] placeholder-slate-400 focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 transition-all outline-none resize-none bg-slate-50/50"
                    placeholder="Describe any symptoms, energy levels, sleep patterns, or recent changes in how you feel..."
                  />
                  <div className="flex justify-end text-[11px] font-medium text-slate-400">
                    {notes.length} characters
                  </div>
                </div>
              </div>

              {/* SECTION 2: PDF REPORT UPLOAD */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-bold text-[#0f172a]">Upload Health Report</h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">PDF lab or medical reports up to 10 MB</p>
                </div>

                {selectedFile ? (
                  /* FILE SELECTED STATE */
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex items-center justify-between space-x-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#0f172a] truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 rounded-full text-slate-400 hover:bg-emerald-100 hover:text-slate-700 transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* DRAG & DROP UNSELECTED STATE */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                      isDragging
                        ? 'border-[#ffb800] bg-amber-50/60 scale-[1.01]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform ${isDragging ? 'bg-amber-100 text-amber-700 scale-110' : 'bg-slate-100 text-slate-500'}`}>
                      <Upload className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="file-upload" className="cursor-pointer text-xs font-bold text-[#0f172a] hover:text-blue-600 transition-colors">
                        <span>Drop your PDF here or <span className="text-blue-600 underline">browse files</span></span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 font-medium">Supports PDF bloodwork & lab reports</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* START ANALYSIS BUTTON */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                {hasValidInput
                  ? 'Ready to process your health check.'
                  : 'Enter symptoms or attach a PDF report to begin.'}
              </p>

              <motion.button
                type="submit"
                disabled={!hasValidInput}
                whileHover={shouldReduceMotion || !hasValidInput ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion || !hasValidInput ? {} : { scale: 0.98 }}
                className={`inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-bold shadow-md transition-all ${
                  hasValidInput
                    ? 'bg-[#0f172a] text-white hover:bg-slate-800'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4 text-[#ffb800]" />
              </motion.button>
            </div>

          </form>

          {/* TRUST / EXPLANATION SECTION */}
          <div className="rounded-3xl bg-slate-50 p-6 sm:p-7 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-[#0f172a] text-base">Your Information Stays Organized</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1">
                <p className="font-bold text-[#0f172a] flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" /> Structured Metrics
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Automatic PDF text extraction parses health metrics from your lab reports.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1">
                <p className="font-bold text-[#0f172a] flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-indigo-500" /> ML Analysis
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Trained ML pipeline evaluates metrics against standard reference ranges.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs space-y-1">
                <p className="font-bold text-[#0f172a] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI Explanations
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Clear educational breakdowns and personalized next steps for your health journey.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* PROCESSING STAGE STEP */}
      {step === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center space-y-8 my-8"
        >
          {/* CIRCULAR PROGRESS GAUGE */}
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-blue-50/70">
            <Activity className="h-12 w-12 text-blue-600 animate-pulse" />
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-slate-200 stroke-current"
                strokeWidth="5"
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
              />
              <circle
                className="text-[#ffb800] stroke-current transition-all duration-300 ease-out"
                strokeWidth="5"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="44"
                fill="transparent"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progress) / 100}
              />
            </svg>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-[#0f172a]">Analyzing your health check...</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">{currentStageText}</p>
          </div>

          {/* REAL STAGE PROGRESS CHECKLIST */}
          <div className="w-full max-w-md bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-left">
            {[
              { label: selectedFile ? 'Uploading PDF report & extracting lab metrics' : 'Uploading health telemetry', isDone: progress >= 40 },
              { label: 'Executing ML health analysis pipeline', isDone: progress >= 65 },
              { label: 'Generating AI explanation & recommendations', isDone: progress >= 85 },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-bold">
                {s.isDone ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
                )}
                <span className={s.isDone ? 'text-[#0f172a]' : 'text-slate-400'}>
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
