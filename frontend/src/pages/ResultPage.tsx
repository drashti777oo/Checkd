import { CheckCircle, AlertCircle, FileText, ArrowLeft, Activity, RefreshCw, Loader2, Info } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
      if (loadingRecord) return; // wait for record first
      setLoadingAnalysis(true);

      // 1. Prefer Zustand store (fresh from HealthCheckPage flow)
      if (activeAnalysis && activeAnalysis.health_record_id === id) {
        setAnalysis(activeAnalysis);
        setLoadingAnalysis(false);
        return;
      }

      // 2. Cold-load: find matching analysis from the list
      if (id && id !== 'latest') {
        try {
          // Fetch enough analyses to find the matching one
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
      if (loadingAnalysis) return; // wait for analysis
      setLoadingExplanation(true);

      if (analysis?.id) {
        // 1. Prefer Zustand store
        if (activeExplanation && activeExplanation.analysis_id === analysis.id) {
          setExplanation(activeExplanation);
        } else {
          // 2. Cold-load from backend
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
        // 1. Prefer Zustand store
        if (activeRecommendations.length > 0 && activeRecommendations[0].analysis_id === analysis.id) {
          setRecommendations(activeRecommendations);
        } else {
          // 2. Cold-load from backend
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

  const isModelNotConfigured = analysis?.status === 'model_not_configured';
  const extractedMetrics: any[] = record?.data?.metrics || [];
  const symptomsText = record?.data?.symptoms;
  const reportFilename = record?.data?.report_filename;
  const isPdfReport = record?.record_type === 'pdf_report';

  // ─── Error State ───────────────────────────────────────────────────────────
  if (!loadingRecord && recordError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <Link to="/history" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-4 shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-rose-900">Unable to Load Health Check</h2>
          <p className="text-sm text-rose-700 max-w-md mx-auto">{recordError}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(0)}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
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
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#ffb800]" />
          <p className="text-sm font-medium">Loading health check result...</p>
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Link to="/history" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to History
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Health Check Result</h1>
          <p className="text-slate-500 mt-1">
            {reportFilename ? `Report: ${reportFilename}` : `Check ID: ${record?.id || id || 'latest'}`}{' '}
            • {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-green-50 px-4 py-2 border border-green-100">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-700">Record Saved</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="md:col-span-2 space-y-8">

          {/* ── No Metrics Notice (PDF uploaded but nothing extracted) ── */}
          {isPdfReport && !loadingAnalysis && extractedMetrics.length === 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3 shadow-sm">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900">No supported health metrics extracted</p>
                <p className="text-xs text-amber-700 mt-1">
                  Your PDF was uploaded and stored successfully, but no recognizable lab values (e.g. glucose, cholesterol, hemoglobin) could be parsed from the document. The file may be a scanned image, use an unsupported format, or contain non-standard metric labels.
                </p>
              </div>
            </section>
          )}

          {/* ── Extracted Lab Metrics ── */}
          {extractedMetrics.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Extracted Laboratory Metrics ({extractedMetrics.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {extractedMetrics.map((m: any, i: number) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">{m.label}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          m.status === 'normal'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {m.status === 'normal' ? 'Normal' : 'Attention'}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {m.value} <span className="text-xs font-normal text-slate-600">{m.unit}</span>
                    </p>
                    {m.reference_range && (
                      <p className="text-xs text-slate-400">Ref: {m.reference_range}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── User Symptom Context ── */}
          {symptomsText && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                How You Were Feeling
              </h2>
              <p className="text-slate-700 text-sm bg-slate-50 p-4 rounded-xl italic border border-slate-100">
                "{symptomsText}"
              </p>
            </section>
          )}

          {/* ── ML Analysis & Findings ── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-500" />
              ML Analysis &amp; Findings
            </h2>

            {loadingAnalysis ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading analysis...
              </div>
            ) : isModelNotConfigured ? (
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 text-sm space-y-1">
                <p className="font-semibold">Analysis Currently Unavailable</p>
                <p>
                  The ML inference model is in development mode and not currently configured for automated predictions. Your health record and extracted PDF metrics have been securely persisted.
                </p>
              </div>
            ) : analysis ? (
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700">
                    Health record ({record?.record_type || 'vitals'}) analyzed successfully. Model: v{analysis.model_version}.
                  </span>
                </li>
                {extractedMetrics.map((m: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    {m.status === 'normal' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <span className="text-slate-700">
                      {m.label}: {m.value} {m.unit}
                      {m.reference_range ? ` (Ref: ${m.reference_range})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No ML analysis available for this record.</p>
            )}
          </section>

          {/* ── AI Educational Explanation ── */}
          <section className="rounded-2xl border border-slate-200 bg-blue-50/50 p-6 shadow-sm">
            <div className="mb-4">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-2">
                AI Educational Explanation
              </div>
              <h2 className="text-xl font-bold text-slate-900">Understand your result</h2>
            </div>

            {loadingExplanation ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading explanation...
              </div>
            ) : explanation ? (
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">{explanation.summary}</p>
                {explanation.details && explanation.details.length > 0 && (
                  <ul className="space-y-2">
                    {explanation.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                {explanation.limitations && explanation.limitations.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500 border-t border-blue-100 pt-3 space-y-1">
                    {explanation.limitations.map((l, i) => (
                      <p key={i}>{l}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-700 leading-relaxed text-sm">
                  {isModelNotConfigured
                    ? 'Educational AI explanation is paused while the ML predictor model is in development mode.'
                    : 'No AI explanation was generated for this health check.'}
                </p>
                <div className="mt-4 text-xs text-slate-500 border-t border-blue-100 pt-4">
                  This explanation is generated for educational purposes only. It is not professional medical advice or a clinical diagnosis.
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Right Column: Recommendations ── */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Actionable Recommendations</h2>

            {loadingRecs ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading recommendations...
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onStatusChange={handleRecommendationStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-500">
                No specific recommendations were generated for this health check.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
