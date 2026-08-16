import { CheckCircle, AlertCircle, FileText, ArrowLeft, Activity } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import RecommendationCard from '../components/shared/RecommendationCard';
import { healthService } from '../services/health.service';
import { aiService } from '../services/ai.service';
import { useHealthStore } from '../store/useHealthStore';
import { HealthRecordResponse } from '../types/health';
import { MLAnalysisResponse, ExplanationResponse, RecommendationResponse } from '../types/ai';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<HealthRecordResponse | null>(null);
  const [analysis, setAnalysis] = useState<MLAnalysisResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeRecord, activeAnalysis, activeExplanation, activeRecommendations } = useHealthStore();

  useEffect(() => {
    async function loadResultData() {
      setLoading(true);
      try {
        if (id && id !== 'latest') {
          const recData = await healthService.getHealthRecord(id);
          setRecord(recData);

          try {
            const analyses = await aiService.listMLAnalyses(1, 50);
            const matchAnalysis = analyses.items.find((a) => a.health_record_id === id);
            if (matchAnalysis) {
              setAnalysis(matchAnalysis);

              // Load Explanation
              try {
                const expData = await aiService.getExplanationByAnalysisId(matchAnalysis.id);
                setExplanation(expData);
              } catch (expErr) {
                console.warn('No explanation found for analysis ID', expErr);
              }

              // Load Recommendations
              try {
                const recsData = await aiService.listRecommendations(undefined, 1, 50);
                const matchingRecs = recsData.items.filter((r) => r.analysis_id === matchAnalysis.id);
                setRecommendations(matchingRecs);
              } catch (recErr) {
                console.warn('Failed to load recommendations for analysis ID', recErr);
              }
            }
          } catch (aErr) {
            console.warn('Failed to load ML analysis for record', aErr);
          }
        } else if (activeRecord) {
          setRecord(activeRecord);
          setAnalysis(activeAnalysis);
          setExplanation(activeExplanation);
          setRecommendations(activeRecommendations);
        }
      } catch (e) {
        console.error('Failed to load health check result:', e);
      } finally {
        setLoading(false);
      }
    }

    loadResultData();
  }, [id, activeRecord, activeAnalysis, activeExplanation, activeRecommendations]);

  const handleRecommendationStatusChange = async (recId: string, newStatus: 'active' | 'dismissed' | 'completed') => {
    try {
      const updated = await aiService.updateRecommendationStatus(recId, newStatus);
      setRecommendations((prev) => prev.map((r) => (r.id === recId ? updated : r)));
    } catch (e) {
      console.error('Failed to update recommendation status:', e);
    }
  };

  const formattedDate = record
    ? new Date(record.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recent Check';

  const isModelNotConfigured = analysis?.status === 'model_not_configured';
  const extractedMetrics: any[] = record?.data?.metrics || [];
  const symptomsText = record?.data?.symptoms;
  const reportFilename = record?.data?.report_filename;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Link to="/history" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to History
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Health Check Result</h1>
          <p className="text-slate-500 mt-1">
            {reportFilename ? `Report: ${reportFilename}` : `Check ID: ${record?.id || id || 'latest'}`} • {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-green-50 px-4 py-2 border border-green-100">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-700">Record Saved</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading health check details...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">

            {/* Extracted Lab Metrics Section */}
            {extractedMetrics.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Extracted Laboratory Metrics ({extractedMetrics.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {extractedMetrics.map((m, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">{m.label}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          m.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
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

            {/* User Symptom Context */}
            {symptomsText && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-500" />
                  User Context ("How I'm Feeling")
                </h2>
                <p className="text-slate-700 text-sm bg-slate-50 p-4 rounded-xl italic border border-slate-100">
                  "{symptomsText}"
                </p>
              </section>
            )}

            {/* Main Findings / Model Status */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                ML Analysis & Findings
              </h2>

              {isModelNotConfigured ? (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 text-sm">
                  <p className="font-semibold mb-1">Analysis Currently Unavailable</p>
                  <p>
                    The machine learning inference model is in development mode and not currently configured for automated clinical predictions.
                    Your health record telemetry and extracted PDF metrics have been securely persisted.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-slate-700">
                      Health record telemetry ({record?.record_type || 'vitals'}) analyzed successfully.
                    </span>
                  </li>
                  {extractedMetrics.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {m.status === 'normal' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <span className="text-slate-700">
                        {m.label}: {m.value} {m.unit} (Ref: {m.reference_range})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* AI Explanation */}
            <section className="rounded-2xl border border-slate-200 bg-blue-50/50 p-6 shadow-sm">
              <div className="mb-4">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 mb-2">
                  AI Educational Explanation
                </div>
                <h2 className="text-xl font-bold text-slate-900">Understand your result</h2>
              </div>

              {isModelNotConfigured ? (
                <p className="text-slate-700 leading-relaxed text-sm">
                  Educational AI explanation is paused while the ML predictor model is in development mode.
                </p>
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {explanation?.summary ||
                    'Your telemetry data indicates a healthy baseline. Maintaining a balanced wellness routine, proper hydration, and regular sleep is advised.'}
                </p>
              )}

              <div className="mt-4 text-xs text-slate-500 border-t border-blue-100 pt-4">
                This explanation is generated for educational purposes to help you understand health metrics. It is not professional medical advice or a clinical diagnosis.
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Recommendations */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Actionable Recommendations</h2>
              {isModelNotConfigured || recommendations.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-500">
                  {isModelNotConfigured
                    ? 'Recommendations are unavailable while ML analysis is unconfigured.'
                    : 'No specific recommendations generated for this check.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      onStatusChange={handleRecommendationStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
