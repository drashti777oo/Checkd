import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  Heart,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Bell,
  BellOff,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Droplets,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { cycleService } from '../services/cycle.service';
import { CycleLogResponse, CyclePredictionResponse } from '../types/cycle';

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const ax = err as { response?: { data?: { detail?: string } }; message?: string };
    if (ax.response?.data?.detail) return ax.response.data.detail;
    if (ax.message) return ax.message;
  }
  return 'Something went wrong. Please try again.';
}

function fmt(dateStr: string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', opts ?? { month: 'long', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

function cycleDay(lastPeriodStart: string | null | undefined): number | null {
  if (!lastPeriodStart) return null;
  const diff = Math.floor((Date.now() - new Date(lastPeriodStart).getTime()) / 86400000);
  return diff >= 0 ? diff + 1 : null;
}

function periodDuration(log: CycleLogResponse): number | null {
  if (!log.end_date) return null;
  const diff = Math.round(
    (new Date(log.end_date).getTime() - new Date(log.start_date).getTime()) / 86400000,
  );
  return diff >= 0 ? diff + 1 : null;
}

// ─── Mia Animation ──────────────────────────────────────────────────────────

function MiaAnimation() {
  const sequence = [1, 2, 3, 4, 3, 2];
  const [index, setIndex] = useState(0);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (shouldReduce) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % sequence.length), 1500);
    return () => clearInterval(id);
  }, [shouldReduce]);

  return (
    <div className="relative w-full aspect-square flex items-end justify-center">
      {[1, 2, 3, 4].map((num) => (
        <img
          key={num}
          src={`/images/${num}-mia.png`}
          alt={`Mia character frame ${num}`}
          className={`absolute bottom-0 left-0 w-full h-auto object-contain drop-shadow-md mix-blend-multiply transition-opacity duration-[1000ms] ease-in-out ${
            sequence[index] === num ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Mini Calendar ───────────────────────────────────────────────────────────

function MiniCalendar({ logs, prediction }: { logs: CycleLogResponse[]; prediction: CyclePredictionResponse | null }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = (firstDay + 6) % 7; // shift so Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build sets of special dates
  const loggedDaySet = new Set<string>();
  logs.forEach((log) => {
    const s = new Date(log.start_date);
    const e = log.end_date ? new Date(log.end_date) : new Date(log.start_date);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) {
        loggedDaySet.add(d.getDate().toString());
      }
    }
  });

  const estimatedSet = new Set<string>();
  if (prediction?.next_predicted_start && prediction?.next_predicted_end) {
    const ns = new Date(prediction.next_predicted_start);
    const ne = new Date(prediction.next_predicted_end);
    for (let d = new Date(ns); d <= ne; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) {
        estimatedSet.add(d.getDate().toString());
      }
    }
  }

  const todayStr = today.getDate().toString();
  const isTodayMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-3">
      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-[#0f172a]">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <div key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 text-center gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = day.toString();
          const isLogged = loggedDaySet.has(ds);
          const isEstimated = estimatedSet.has(ds);
          const isToday = isTodayMonth && ds === todayStr;

          return (
            <div
              key={i}
              className={`text-xs font-semibold h-7 w-7 mx-auto flex items-center justify-center rounded-full transition-all ${
                isLogged
                  ? 'bg-rose-500 text-white shadow-sm'
                  : isToday
                  ? 'bg-[#0f172a] text-white'
                  : isEstimated
                  ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300 ring-dashed'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <div className="h-3 w-3 rounded-full bg-rose-500" /> Logged period
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <div className="h-3 w-3 rounded-full bg-[#0f172a]" /> Today
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <div className="h-3 w-3 rounded-full bg-rose-100 ring-1 ring-rose-300" /> Est. next period
        </div>
      </div>
    </div>
  );
}

// ─── Reminder Widget ─────────────────────────────────────────────────────────

const REMINDER_KEY = 'checkd_cycle_reminder';

interface ReminderState {
  enabled: boolean;
  daysBefore: 1 | 3 | 5;
}

function ReminderWidget() {
  const [state, setState] = useState<ReminderState>(() => {
    try {
      const raw = localStorage.getItem(REMINDER_KEY);
      return raw ? JSON.parse(raw) : { enabled: false, daysBefore: 3 };
    } catch {
      return { enabled: false, daysBefore: 3 };
    }
  });

  const save = (next: ReminderState) => {
    setState(next);
    localStorage.setItem(REMINDER_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {state.enabled ? (
            <Bell className="h-4 w-4 text-rose-500" />
          ) : (
            <BellOff className="h-4 w-4 text-slate-400" />
          )}
          <span className="text-sm font-bold text-[#0f172a]">Period Reminder</span>
        </div>
        <button
          onClick={() => save({ ...state, enabled: !state.enabled })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            state.enabled ? 'bg-rose-500' : 'bg-slate-200'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              state.enabled ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {state.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <p className="text-xs text-slate-500">Remind me before my estimated period:</p>
          <div className="flex gap-2">
            {([1, 3, 5] as const).map((d) => (
              <button
                key={d}
                onClick={() => save({ ...state, daysBefore: d })}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  state.daysBefore === d
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {d} day{d > 1 ? 's' : ''}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 p-2.5">
            <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Reminder preference saved locally. Push/email notifications are not yet enabled in Checkd. This setting will be used when notifications are available.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CycleTrackerPage() {
  const { user } = useAuth();
  const shouldReduce = useReducedMotion();
  const isFemale = user?.gender?.toLowerCase() === 'female';

  const [logs, setLogs] = useState<CycleLogResponse[]>([]);
  const [prediction, setPrediction] = useState<CyclePredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [flowIntensity, setFlowIntensity] = useState('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const availableSymptoms = [
    'Cramps', 'Headaches', 'Fatigue', 'Mood Swings',
    'Bloating', 'Acne', 'Nausea', 'Back Pain',
  ];

  const loadCycleData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [logsData, predData] = await Promise.all([
        cycleService.listCycleLogs(),
        cycleService.getCyclePrediction(),
      ]);
      setLogs(logsData.items);
      setPrediction(predData);
    } catch (err) {
      setLoadError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFemale) {
      loadCycleData();
    } else {
      setLoading(false);
    }
  }, [isFemale, loadCycleData]);

  const resetModal = () => {
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setFlowIntensity('medium');
    setSelectedSymptoms([]);
    setNotes('');
    setSubmitError(null);
    setDateError(null);
  };

  const openModal = () => { resetModal(); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    setSubmitError(null);

    // Validate: end must be >= start
    if (endDate && endDate < startDate) {
      setDateError('End date cannot be before start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await cycleService.logCycle({
        start_date: startDate,
        end_date: endDate || undefined,
        flow_intensity: flowIntensity,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        notes: notes || undefined,
      });
      closeModal();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
      await loadCycleData();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    setDeletingId(logId);
    try {
      await cycleService.deleteCycleLog(logId);
      setConfirmDeleteId(null);
      await loadCycleData();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Derived stats ──────────────────────────────────────────────────────
  const currentCycleDay = cycleDay(prediction?.last_period_start);
  const daysLeft = daysUntil(prediction?.next_predicted_start);
  const hasData = logs.length > 0;
  const hasPrediction = !!prediction?.next_predicted_start;

  // Insights from real logs
  const cycleLengths: number[] = [];
  for (let i = 0; i < logs.length - 1; i++) {
    const diff = Math.round(
      (new Date(logs[i].start_date).getTime() - new Date(logs[i + 1].start_date).getTime()) / 86400000,
    );
    if (diff >= 20 && diff <= 45) cycleLengths.push(diff);
  }

  const periodDurations: number[] = logs
    .map((l) => periodDuration(l))
    .filter((d): d is number => d !== null && d >= 1 && d <= 10);

  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : null;
  const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : null;
  const avgPeriodDuration =
    periodDurations.length > 0
      ? (periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length).toFixed(1)
      : null;

  // ─── Framer Motion variants ──────────────────────────────────────────────
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 14 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
    }),
  };

  // ─── Access Restricted ──────────────────────────────────────────────────
  if (!isFemale) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Cycle Tracker Access Restricted</h1>
        <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed">
          Cycle and period tracking features are available to users who specify their gender as female in their profile settings.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center rounded-full bg-[#0f172a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Update Profile Settings
        </Link>
      </motion.div>
    );
  }

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
        <p className="text-sm font-medium">Loading your cycle data...</p>
      </div>
    );
  }

  // ─── Load Error ───────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 mx-auto">
          <AlertCircle className="h-7 w-7 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Cycle Data</h2>
        <p className="text-sm text-slate-500">{loadError}</p>
        <button
          onClick={loadCycleData}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
        >
          <Loader2 className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4" />
            Period logged successfully
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans selection:bg-rose-100"
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-50 via-pink-50/60 to-amber-50/40 border border-rose-100/80 p-6 sm:p-8 shadow-sm"
        >
          {/* Background decorative circles */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-rose-200/20" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-pink-200/20" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            {/* Left: Text */}
            <div className="space-y-4 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold">
                <Heart className="h-3 w-3 fill-rose-500" />
                Cycle Tracker
              </div>
              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
                  Your Cycle,<br />
                  <span className="text-rose-500">Your Patterns.</span>
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Keep track of your cycle and understand your monthly patterns.
                </p>
              </div>
              <motion.button
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4 w-4 text-[#ffb800]" />
                Log Period
              </motion.button>
            </div>

            {/* Right: Mia character */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-36 sm:w-44 shrink-0 mx-auto sm:mx-0"
            >
              <motion.div
                animate={shouldReduce ? {} : { y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MiaAnimation />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── STATS CARDS ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Next Period */}
          <motion.div
            custom={0}
            variants={cardVariants}
            whileHover={shouldReduce ? {} : { y: -3 }}
            className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm space-y-2 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Next Period</span>
            </div>
            {hasPrediction ? (
              <>
                <p className="text-2xl font-extrabold text-[#0f172a]">
                  {fmt(prediction!.next_predicted_start, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500">
                  {daysLeft !== null && daysLeft > 0
                    ? `In ${daysLeft} day${daysLeft !== 1 ? 's' : ''} · estimate`
                    : daysLeft === 0
                    ? 'Today (estimate)'
                    : `${Math.abs(daysLeft!)} day${Math.abs(daysLeft!) !== 1 ? 's' : ''} overdue (estimate)`}
                </p>
                <p className="text-[10px] text-slate-400">
                  Based on {logs.length >= 2 ? 'your logged history' : 'standard ~28-day cycle'}
                </p>
              </>
            ) : (
              <div className="pt-1 space-y-1">
                <p className="text-sm font-semibold text-slate-500">No prediction yet</p>
                <p className="text-xs text-slate-400">Log your first period to start tracking.</p>
              </div>
            )}
          </motion.div>

          {/* Card 2: Current Cycle Day */}
          <motion.div
            custom={1}
            variants={cardVariants}
            whileHover={shouldReduce ? {} : { y: -3 }}
            className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm space-y-2 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Cycle Day</span>
            </div>
            {hasData && currentCycleDay !== null ? (
              <>
                <p className="text-2xl font-extrabold text-[#0f172a]">Day {currentCycleDay}</p>
                <p className="text-xs text-slate-500">
                  Since {fmt(prediction?.last_period_start, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-[10px] text-slate-400">
                  Est. cycle length: {prediction?.average_cycle_length_days ?? 28} days
                </p>
              </>
            ) : (
              <div className="pt-1 space-y-1">
                <p className="text-sm font-semibold text-slate-500">No data yet</p>
                <p className="text-xs text-slate-400">Log your period to see cycle day.</p>
              </div>
            )}
          </motion.div>

          {/* Card 3: Last Period + Count */}
          <motion.div
            custom={2}
            variants={cardVariants}
            whileHover={shouldReduce ? {} : { y: -3 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                <Droplets className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Period</span>
            </div>
            {hasData ? (
              <>
                <p className="text-2xl font-extrabold text-[#0f172a]">
                  {fmt(prediction?.last_period_start, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500">
                  {logs.length} cycle{logs.length !== 1 ? 's' : ''} logged
                </p>
                {logs.length < 2 && (
                  <p className="text-[10px] text-rose-500 font-medium">
                    Log one more period to improve estimates
                  </p>
                )}
              </>
            ) : (
              <div className="pt-1 space-y-1">
                <p className="text-sm font-semibold text-slate-500">No periods logged</p>
                <p className="text-xs text-slate-400">Start by logging your first period.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Single-log accuracy notice */}
        {logs.length === 1 && (
          <motion.div
            variants={itemVariants}
            className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm"
          >
            <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">Estimates will improve with more data</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                You have one period logged. Checkd is currently using a standard ~28-day cycle to estimate your next period. Log one more period to calculate your actual cycle length and get more accurate predictions.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── CALENDAR + REMINDER ─────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Calendar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-500" />
              Monthly Calendar
            </h2>
            {hasData ? (
              <MiniCalendar logs={logs} prediction={prediction} />
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-slate-500 font-medium">No data to display yet.</p>
                <p className="text-xs text-slate-400">Log your first period to see it on the calendar.</p>
              </div>
            )}
            {hasPrediction && (
              <p className="text-[10px] text-slate-400 pt-1">
                Estimated period window is a standard-cycle estimate. Not a medical prediction.
              </p>
            )}
          </div>

          {/* Reminder */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
              <Bell className="h-4 w-4 text-rose-500" />
              Reminder Settings
            </h2>
            {hasPrediction ? (
              <ReminderWidget />
            ) : (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm text-slate-500 font-medium">Reminders not available yet</p>
                <p className="text-xs text-slate-400">
                  Log at least one period to configure period reminders.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── INSIGHTS ────────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
        >
          <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            Your Patterns
          </h2>

          {logs.length === 0 ? (
            <div className="py-4 text-center space-y-1">
              <p className="text-sm text-slate-500 font-medium">No patterns to show yet.</p>
              <p className="text-xs text-slate-400">
                Keep logging your periods to build your personal cycle history.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Cycles tracked */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cycles Tracked</p>
                <p className="text-xl font-extrabold text-[#0f172a]">{logs.length}</p>
              </div>

              {/* Average cycle length */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Cycle Length</p>
                <p className="text-xl font-extrabold text-[#0f172a]">
                  {logs.length >= 2 && cycleLengths.length > 0
                    ? `${prediction?.average_cycle_length_days ?? 28} days`
                    : <span className="text-sm text-slate-400">Need 2+ logs</span>}
                </p>
              </div>

              {/* Shortest / Longest */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shortest Cycle</p>
                <p className="text-xl font-extrabold text-[#0f172a]">
                  {shortestCycle !== null ? `${shortestCycle} days` : <span className="text-sm text-slate-400">—</span>}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Longest Cycle</p>
                <p className="text-xl font-extrabold text-[#0f172a]">
                  {longestCycle !== null ? `${longestCycle} days` : <span className="text-sm text-slate-400">—</span>}
                </p>
              </div>

              {/* Average period duration */}
              {avgPeriodDuration && (
                <div className="space-y-0.5 sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Period Duration</p>
                  <p className="text-xl font-extrabold text-[#0f172a]">{avgPeriodDuration} days</p>
                  <p className="text-[10px] text-slate-400">Based on logs with a recorded end date</p>
                </div>
              )}
            </div>
          )}

          {logs.length >= 2 && cycleLengths.length > 0 && (
            <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
              Your average cycle has been around <span className="font-bold text-slate-600">{prediction?.average_cycle_length_days ?? 28} days</span> based on your logged history. These are personal estimates, not medical predictions.
            </p>
          )}
        </motion.div>

        {/* ── CYCLE HISTORY ────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-500" />
              Cycle History ({logs.length})
            </h2>
            <motion.button
              whileHover={shouldReduce ? {} : { scale: 1.02 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
              onClick={openModal}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Period
            </motion.button>
          </div>

          {logs.length === 0 ? (
            /* Empty state */
            <div className="py-10 flex flex-col items-center text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <Heart className="h-7 w-7 text-rose-300" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">No cycle history yet</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Log your first period to start building your personal cycle history. As you add more cycles, Checkd can build a more useful picture of your patterns.
                </p>
              </div>
              <motion.button
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-[#ffb800]" />
                Log First Period
              </motion.button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log, idx) => {
                const duration = periodDuration(log);
                const cycleLengthForEntry =
                  idx < logs.length - 1
                    ? Math.round(
                        (new Date(log.start_date).getTime() -
                          new Date(logs[idx + 1].start_date).getTime()) /
                          86400000,
                      )
                    : null;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: shouldReduce ? 0 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.35 }}
                    className="py-4 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            Cycle {logs.length - idx}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                              log.flow_intensity === 'heavy'
                                ? 'bg-rose-100 text-rose-700 border-rose-200'
                                : log.flow_intensity === 'light'
                                ? 'bg-pink-50 text-pink-600 border-pink-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}
                          >
                            {log.flow_intensity} flow
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
                          <span>
                            {fmt(log.start_date, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {log.end_date && (
                            <>
                              <span className="text-slate-300">→</span>
                              <span>
                                {fmt(log.end_date, { month: 'short', day: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          {duration !== null && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {duration} day{duration !== 1 ? 's' : ''} period
                            </span>
                          )}
                          {cycleLengthForEntry !== null && cycleLengthForEntry >= 20 && cycleLengthForEntry <= 45 && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" /> {cycleLengthForEntry}-day cycle
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete action */}
                      <div className="flex items-center gap-2 shrink-0">
                        {confirmDeleteId === log.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              disabled={deletingId === log.id}
                              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                              {deletingId === log.id ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete this entry"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Symptoms */}
                    {log.symptoms && log.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {log.symptoms.map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg">
                        "{log.notes}"
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── LOG PERIOD MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.94, y: shouldReduce ? 0 : 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: shouldReduce ? 1 : 0.94, y: shouldReduce ? 0 : 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-5"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-[#0f172a]">Log Your Period</h2>
                  <p className="text-xs text-slate-500">
                    This helps Checkd estimate your future cycle dates.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLogSubmit} className="space-y-5">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      End Date <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Date validation error */}
                {dateError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <p className="text-xs font-semibold text-rose-800">{dateError}</p>
                  </div>
                )}

                {/* Flow intensity */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Flow Intensity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['light', 'medium', 'heavy'].map((flow) => (
                      <button
                        key={flow}
                        type="button"
                        onClick={() => setFlowIntensity(flow)}
                        className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                          flowIntensity === flow
                            ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {flow}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Symptoms <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSymptoms.map((symptom) => {
                      const active = selectedSymptoms.includes(symptom);
                      return (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            active
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {symptom}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Notes <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none transition-all"
                    rows={2}
                  />
                </div>

                {/* Submit error */}
                {submitError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3">
                    <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-semibold text-rose-800">{submitError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={shouldReduce || isSubmitting ? {} : { scale: 1.02 }}
                    whileTap={shouldReduce || isSubmitting ? {} : { scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-6 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-[#ffb800]" /> Save Period Log
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
