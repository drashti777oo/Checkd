import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Activity,
  RefreshCw,
  Loader2,
  Info,
  Calendar,
  Clock,
  Sparkles,
  Brain,
  HeartPulse,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import RecommendationCard from '../components/shared/RecommendationCard';
import { healthService } from '../services/health.service';
import { aiService } from '../services/ai.service';
import { useHealthStore } from '../store/useHealthStore';
import { HealthRecordResponse } from '../types/health';
import { MLAnalysisResponse, ExplanationResponse, RecommendationResponse } from '../types/ai';

/** Extracts user-facing error message from an Axios error or standard Error. */
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
    if (axiosErr.response?.data?.detail) return axiosErr.response.data.detail;
    if (axiosErr.message) return axiosErr.message;
  }
  return 'An unexpected error occurred loading this result.';
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [record, setRecord] = useState<HealthRecordResponse | null>(null);
  const [analysis, setAnalysis] = useState<MLAnalysisResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);

  const [loadingRecord, setLoadingRecord] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [loadingExplanation, setLoadingExplanation] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recordError, setRecordError] = useState<string | null>(null);

  const { activeRecord, activeAnalysis, activeExplanation, activeRecommendations } = useHealthStore();

  // ─── Load Record ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadRecord() {
      setLoadingRecord(true);
      setRecordError(null);

      if (id && id !== 'latest') {
        try {
          const recData = await healthService.getHealthRecord(id);
          setRecord(recData);
        } catch (err: unknown) {
          setRecordError(extractErrorMessage(err));
        }
      } else if (activeRecord) {
        setRecord(activeRecord);
      } else {
        setRecordError('No health record ID provided. Please navigate from your history.');
      }
      setLoadingRecord(false);
    }

    loadRecord();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load Analysis (after record is known) ────────────────────────────────
  useEffect(() => {
    async function loadAnalysis() {
      if (loadingRecord) return;
      setLoadingAnalysis(true);

      // 1. Prefer Zustand store
      if (activeAnalysis && activeAnalysis.health_record_id === id) {
        setAnalysis(activeAnalysis);
        setLoadingAnalysis(false);
        return;
      }

      // 2. Cold-load: search in list
      if (id && id !== 'latest') {
        try {
          const analyses = await aiService.listMLAnalyses(1, 100);
          const match = analyses.items.find((a) => a.health_record_id === id);
          if (match) setAnalysis(match);
        } catch (aErr) {
          console.warn('Failed to load ML analysis for record', aErr);
        }
      } else if (activeAnalysis) {
        setAnalysis(activeAnalysis);
      }

      setLoadingAnalysis(false);
    }

    loadAnalysis();
  }, [loadingRecord, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load Explanation ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadExplanation() {
      if (loadingAnalysis) return;
      setLoadingExplanation(true);

      if (analysis?.id) {
        if (activeExplanation && activeExplanation.analysis_id === analysis.id) {
          setExplanation(activeExplanation);
        } else {
          try {
            const expData = await aiService.getExplanationByAnalysisId(analysis.id);
            setExplanation(expData);
          } catch (expErr) {
            console.warn('No explanation found for analysis ID', expErr);
          }
        }
      } else if (activeExplanation) {
        setExplanation(activeExplanation);
      }

      setLoadingExplanation(false);
    }

    loadExplanation();
  }, [loadingAnalysis, analysis?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load Recommendations ─────────────────────────────────────────────────
  useEffect(() => {
    async function loadRecommendations() {
      if (loadingAnalysis) return;
      setLoadingRecs(true);

      if (analysis?.id) {
        if (activeRecommendations.length > 0 && activeRecommendations[0].analysis_id === analysis.id) {
          setRecommendations(activeRecommendations);
        } else {
          try {
            const recsData = await aiService.listRecommendations(undefined, 1, 100);
            const matching = recsData.items.filter((r) => r.analysis_id === analysis.id);
            setRecommendations(matching);
          } catch (recErr) {
            console.warn('Failed to load recommendations for analysis ID', recErr);
          }
        }
      } else if (activeRecommendations.length > 0) {
        setRecommendations(activeRecommendations);
      }

      setLoadingRecs(false);
    }

    loadRecommendations();
  }, [loadingAnalysis, analysis?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Recommendation Status Update ─────────────────────────────────────────
  const handleRecommendationStatusChange = async (
    recId: string,
    newStatus: 'active' | 'dismissed' | 'completed',
  ) => {
    try {
      const updated = await aiService.updateRecommendationStatus(recId, newStatus);
      setRecommendations((prev) => prev.map((r) => (r.id === recId ? updated : r)));
    } catch (e) {
      console.error('Failed to update recommendation status:', e);
    }
  };

  // ─── Derived Values ────────────────────────────────────────────────────────
  const formattedDate = record
    ? new Date(record.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Check';

  const formattedTime = record
    ? new Date(record.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const isModelNotConfigured = analysis?.status === 'model_not_configured';
  const extractedMetrics: any[] = record?.data?.metrics || [];
  const symptomsText = record?.data?.symptoms;
  const reportFilename = record?.data?.report_filename;
  const isPdfReport = record?.record_type === 'pdf_report';

  // ─── Motion Variants ───────────────────────────────────────────────────────
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // ─── Error State ───────────────────────────────────────────────────────────
  if (!loadingRecord && recordError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6 font-sans">
        <Link to="/history" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Health Journey
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center space-y-4 shadow-2xs">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertCircle className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-rose-900">Unable to Load Health Check</h2>
          <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">{recordError}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(0)}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Outer Loading ─────────────────────────────────────────────────────────
  if (loadingRecord) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 font-sans">
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-500 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
          <Loader2 className="h-8 w-8 animate-spin text-[#ffb800]" />
          <p className="text-sm font-semibold text-slate-600">Loading health check result...</p>
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans selection:bg-[#ffb800]/30"
    >
      {/* ── BACK NAVIGATION ───────────────────────────────────────────────── */}
      <motion.div variants={sectionVariants}>
        <Link
          to="/history"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-[#0f172a] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Health Journey
        </Link>
      </motion.div>

      {/* ── 1. RESULT HEADER BANNER ───────────────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        className="bg-gradient-to-r from-[#fffcf8] via-amber-50/40 to-blue-50/30 p-6 sm:p-8 rounded-[2rem] border border-amber-100/80 shadow-2xs relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Health Check Result
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                {isPdfReport ? 'PDF Health Report' : 'Vitals Entry'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              {reportFilename ? reportFilename : 'Health Check Summary'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formattedDate}
              </span>
              {formattedTime && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formattedTime}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-200/80 self-start sm:self-auto shrink-0 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">Record Saved</span>
          </div>
        </div>
      </motion.div>

      {/* ── 2. TWO-COLUMN CONTENT GRID ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT COLUMN (2 Cols) ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* ── 3. HEALTH SUMMARY & EXTRACTED METRICS ── */}
          <motion.section
            variants={sectionVariants}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
                    Extracted Laboratory Metrics
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {extractedMetrics.length > 0
                      ? `${extractedMetrics.length} health ${extractedMetrics.length === 1 ? 'metric' : 'metrics'} parsed from your document`
                      : 'Overview of health telemetry parsed from this check'}
                  </p>
                </div>
              </div>

              {extractedMetrics.length > 0 && (
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                  {extractedMetrics.length} total
                </span>
              )}
            </div>

            {/* If no metrics extracted */}
            {isPdfReport && !loadingAnalysis && extractedMetrics.length === 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex items-start gap-3 shadow-2xs">
                <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-amber-900">
                    No recognizable laboratory metrics extracted
                  </p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Your PDF report was uploaded and securely preserved, but standard biomarker values (e.g. glucose, cholesterol, HbA1c) could not be parsed from this specific document format.
                  </p>
                </div>
              </div>
            )}

            {/* Extracted Metrics Cards Grid */}
            {extractedMetrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {extractedMetrics.map((m: any, i: number) => {
                  const isNormal = m.status === 'normal';
                  const isAttention = m.status === 'attention' || m.status === 'abnormal';

                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0f172a] truncate">{m.label}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            isNormal
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isAttention
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {m.status === 'normal' ? 'Normal' : m.status || 'Recorded'}
                        </span>
                      </div>

                      <div>
                        <p className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                          {m.value}{' '}
                          <span className="text-xs font-bold text-slate-500">{m.unit}</span>
                        </p>
                      </div>

                      {m.reference_range && (
                        <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                          Reference: <span className="font-semibold text-slate-700">{m.reference_range}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!isPdfReport && extractedMetrics.length === 0 && (
              <p className="text-xs text-slate-500 font-medium py-2">
                This check was submitted as a subjective wellness check-in without an attached laboratory report.
              </p>
            )}
          </motion.section>

          {/* ── 4. HOW YOU WERE FEELING (SYMPTOM CONTEXT) ── */}
          <motion.section
            variants={sectionVariants}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <HeartPulse className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
                How You Were Feeling
              </h2>
            </div>

            {symptomsText ? (
              <div className="rounded-2xl bg-amber-50/40 p-4 border border-amber-100/80 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "{symptomsText}"
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-500 font-medium">
                No additional symptoms were recorded for this check.
              </div>
            )}
          </motion.section>

          {/* ── 5. HEALTH ANALYSIS (ML FINDINGS) ── */}
          <motion.section
            variants={sectionVariants}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Brain className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
                  Health Analysis
                </h2>
              </div>

              {analysis?.model_version && (
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Model v{analysis.model_version}
                </span>
              )}
            </div>

            {loadingAnalysis ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#ffb800]" />
                Checking automated analysis pipeline...
              </div>
            ) : isModelNotConfigured ? (
              /* Analysis model unavailable state */
              <div className="rounded-2xl bg-amber-50/70 p-5 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  Analysis model unavailable
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Your report was successfully processed and preserved, but the automated predictive analysis model is not currently configured in this environment. No artificial estimates or arbitrary risk scores are shown.
                </p>
              </div>
            ) : analysis && analysis.status === 'completed' ? (
              /* Completed real analysis */
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                    Health check ({record?.record_type || 'vitals'}) evaluated successfully. Structured metrics have been compared against baseline reference thresholds.
                  </div>
                </div>

                {extractedMetrics.length > 0 && (
                  <ul className="space-y-2 pt-1">
                    {extractedMetrics.map((m: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-[#0f172a]">{m.label}</strong>: {m.value} {m.unit}
                          {m.reference_range ? ` (Ref: ${m.reference_range})` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium py-2">
                No automated ML evaluation record exists for this health check.
              </p>
            )}
          </motion.section>

          {/* ── 6. UNDERSTANDING YOUR RESULTS (AI EDUCATIONAL EXPLANATION) ── */}
          <motion.section
            variants={sectionVariants}
            className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 rounded-3xl p-6 sm:p-7 border border-indigo-100/80 shadow-2xs space-y-4"
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/70 text-indigo-800 text-[11px] font-bold border border-indigo-200">
                <Sparkles className="h-3 w-3 text-indigo-600" />
                Educational Guidance
              </div>
              <h2 className="text-lg font-bold text-[#0f172a]">
                Understanding Your Results
              </h2>
            </div>

            {loadingExplanation ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                Loading educational insights...
              </div>
            ) : explanation ? (
              <div className="space-y-4">
                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {explanation.summary}
                </p>

                {/* Details List */}
                {explanation.details && explanation.details.length > 0 && (
                  <div className="bg-white/80 rounded-2xl p-4 border border-indigo-100 space-y-2">
                    <p className="text-xs font-bold text-[#0f172a]">Key Highlights</p>
                    <ul className="space-y-2">
                      {explanation.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span className="leading-relaxed">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Limitations */}
                {explanation.limitations && explanation.limitations.length > 0 && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-indigo-100/80 space-y-1">
                    {explanation.limitations.map((l, i) => (
                      <p key={i} className="flex items-start gap-1.5">
                        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{l}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-white/70 p-4 border border-indigo-100 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">
                  {isModelNotConfigured
                    ? 'Educational AI breakdown is not available while the model is unconfigured.'
                    : 'No educational explanation was generated for this health check.'}
                </p>
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="pt-3 border-t border-indigo-100/80 text-[10px] text-slate-400 font-medium leading-relaxed">
              This explanation is generated for educational purposes only. It is not professional medical advice, a clinical diagnosis, or a substitute for consultation with a certified healthcare provider.
            </div>
          </motion.section>

        </div>

        {/* ── RIGHT COLUMN (1 Col): ACTIONABLE RECOMMENDATIONS ── */}
        <div className="space-y-6">
          <motion.section
            variants={sectionVariants}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ffb800]" />
                Actionable Next Steps
              </h2>
              {recommendations.length > 0 && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {recommendations.length}
                </span>
              )}
            </div>

            {loadingRecs ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-[#ffb800]" />
                Loading recommendations...
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3.5">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onStatusChange={handleRecommendationStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700">
                  No recommendations generated
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  No specific recommendations were generated for this health check. The absence of recommendations does not indicate the report is medically normal.
                </p>
              </div>
            )}
          </motion.section>

          {/* Quick Help Card with Character Illustration */}
          <motion.div
            variants={sectionVariants}
            className="rounded-3xl bg-gradient-to-br from-amber-50/70 via-rose-50/30 to-blue-50/30 p-5 border border-amber-100/80 shadow-2xs flex items-center gap-4"
          >
            <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-white shadow-2xs bg-white">
              <img
                src="/images/1-mia.png"
                alt="Checkd character"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-[#0f172a]">Have questions about your report?</p>
              <p className="text-[11px] text-slate-600 leading-tight">
                Always discuss abnormal laboratory findings directly with your physician.
              </p>
            </div>
          </motion.div>
        </div>

      </div>

    </motion.div>
  );
}
