import { useState, useMemo } from 'react';
import {
  Clock,
  ArrowRight,
  Trash2,
  FileText,
  Plus,
  Activity,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  HeartPulse,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useHealthData } from '../hooks/useHealthData';
import { healthService } from '../services/health.service';

type FilterType = 'all' | 'pdf' | 'vitals' | 'with_metrics';
type SortOrder = 'newest' | 'oldest';

export default function HistoryPage() {
  const { records, loading, error, refresh } = useHealthData();
  const shouldReduceMotion = useReducedMotion();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (recordId: string) => {
    setDeletingId(recordId);
    setDeleteError(null);
    try {
      await healthService.deleteHealthRecord(recordId);
      setConfirmDeleteId(null);
      await refresh();
    } catch (err: unknown) {
      console.error('Failed to delete health record:', err);
      setDeleteError('Failed to delete this record. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Filter & Sort ─────────────────────────────────────────────────────────
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    if (filter === 'pdf') {
      result = result.filter((r) => r.record_type === 'pdf_report');
    } else if (filter === 'vitals') {
      result = result.filter((r) => r.record_type === 'vitals');
    } else if (filter === 'with_metrics') {
      result = result.filter(
        (r) => (r.data?.extracted_count || (r.data?.metrics && r.data.metrics.length) || 0) > 0
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [records, filter, sortOrder]);

  const totalExtractedMetrics = useMemo(() => {
    return records.reduce((acc, r) => {
      const count = r.data?.extracted_count || (r.data?.metrics && r.data.metrics.length) || 0;
      return acc + count;
    }, 0);
  }, [records]);

  // ─── Motion Variants ───────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans selection:bg-[#ffb800]/30">
      
      {/* ── HEADER SECTION ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-gradient-to-r from-[#fffcf8] via-amber-50/40 to-blue-50/30 p-6 sm:p-8 rounded-[2rem] border border-amber-100/70 shadow-2xs relative overflow-hidden"
      >
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            Health History Log
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Your Health Journey
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Review your previous health checks and see how your health information changes over time.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Link
            to="/check"
            className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4 text-[#ffb800]" />
            New Check
          </Link>
        </div>
      </motion.div>

      {/* ── STATS CHIPS BAR ───────────────────────────────────────────────── */}
      {!loading && records.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"
        >
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Total Checks</p>
              <p className="text-lg font-extrabold text-[#0f172a]">{records.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Extracted Metrics</p>
              <p className="text-lg font-extrabold text-[#0f172a]">{totalExtractedMetrics}</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Storage State</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">Securely Stored</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── FILTER & SORT CONTROLS ─────────────────────────────────────────── */}
      {!loading && records.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            {(
              [
                { id: 'all', label: 'All Checks' },
                { id: 'pdf', label: 'PDF Reports' },
                { id: 'vitals', label: 'Vitals Checks' },
                { id: 'with_metrics', label: 'With Metrics' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.id
                    ? 'bg-[#0f172a] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
            </span>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-[#0f172a] hover:bg-slate-100 transition-colors"
            >
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
      )}

      {/* ── DELETE ERROR ALERT ────────────────────────────────────────────── */}
      {deleteError && (
        <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-semibold shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* ── CONTENT AREA ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#ffb800]" />
          <p className="text-sm font-medium">Loading your health journey records...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center space-y-3 shadow-2xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 mx-auto text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Unable to load health history</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
          <button
            onClick={() => refresh()}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : records.length === 0 ? (
        /* ── EMPTY STATE ─────────────────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-5"
        >
          {/* Character illustration frame */}
          <div className="relative w-36 h-36 rounded-full bg-gradient-to-b from-amber-100/70 to-blue-100/50 p-2 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
            <img
              src="/images/mia-phone.jpg"
              alt="Checkd character"
              className="w-full h-full object-cover object-top mix-blend-multiply opacity-95 rounded-full"
            />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h2 className="text-xl font-bold text-[#0f172a]">No health checks yet</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Upload your first health report to start building your personal health history.
            </p>
          </div>

          <Link
            to="/check"
            className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4 text-[#ffb800]" />
            Start a Health Check
          </Link>
        </motion.div>
      ) : filteredAndSortedRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-2 shadow-2xs">
          <p className="text-sm font-bold text-[#0f172a]">No records match the selected filter.</p>
          <p className="text-xs text-slate-500">Try choosing a different filter above.</p>
        </div>
      ) : (
        /* ── HEALTH CHECK CARDS LIST ─────────────────────────────────────── */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredAndSortedRecords.map((item) => {
            const recordDate = new Date(item.created_at);
            const formattedDate = recordDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = recordDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const isPdf = item.record_type === 'pdf_report';
            const reportName =
              item.data?.report_filename ||
              (isPdf ? 'PDF Health Report' : 'Vitals Check');
            const metricsCount =
              item.data?.extracted_count ||
              (item.data?.metrics && item.data.metrics.length) ||
              0;
            const symptomsSummary = item.data?.symptoms;

            const isConfirmingDelete = confirmDeleteId === item.id;
            const isDeleting = deletingId === item.id;

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={shouldReduceMotion ? {} : { y: -2 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left info column */}
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isPdf
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}
                  >
                    {isPdf ? (
                      <FileText className="h-6 w-6" />
                    ) : (
                      <HeartPulse className="h-6 w-6" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#0f172a] truncate max-w-xs sm:max-w-md">
                        {reportName}
                      </h3>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {isPdf ? 'PDF Report' : 'Vitals'}
                      </span>
                    </div>

                    {/* Date and Time */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formattedTime}
                      </span>
                    </div>

                    {/* Extracted Metrics / Symptoms */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {metricsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3" />
                          {metricsCount} {metricsCount === 1 ? 'metric' : 'metrics'} extracted
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          Record Saved
                        </span>
                      )}

                      {symptomsSummary && (
                        <span className="text-[11px] text-slate-500 italic truncate max-w-[200px]">
                          "{symptomsSummary}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1.5 bg-rose-50 p-1.5 rounded-2xl border border-rose-200">
                      <span className="text-[11px] font-bold text-rose-800 px-2">Delete?</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors"
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeleting}
                        className="px-2.5 py-1 rounded-xl bg-white text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        title="Delete record"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <Link
                        to={`/history/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-[#0f172a] hover:text-white px-4 py-2 text-xs font-bold text-[#0f172a] transition-all shadow-2xs"
                      >
                        View Result
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

    </div>
  );
}
