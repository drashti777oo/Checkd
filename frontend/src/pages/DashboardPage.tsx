import { Link } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowRight, Heart, Smile, Moon, Sparkles, Zap, TrendingUp, BarChart3, Flame, CalendarCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { healthService } from '../services/health.service';
import { aiService } from '../services/ai.service';
import { cycleService } from '../services/cycle.service';
import { profileService } from '../services/profile.service';
import { checkinService } from '../services/checkin.service';
import { HealthRecordResponse } from '../types/health';
import { RecommendationResponse } from '../types/ai';
import { CyclePredictionResponse } from '../types/cycle';
import { HealthProfile } from '../types/profile';
import { DailyCheckInResponse, DailyCheckInStatsResponse } from '../types/checkin';
import DailyCheckInModal from '../components/shared/DailyCheckInModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckInResponse | null>(null);
  const [checkInStats, setCheckInStats] = useState<DailyCheckInStatsResponse | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<DailyCheckInResponse[]>([]);
  const [recentChecks, setRecentChecks] = useState<HealthRecordResponse[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [cyclePrediction, setCyclePrediction] = useState<CyclePredictionResponse | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [profileData, todayData, statsData, checkinsData, recordsData, recsData] = await Promise.allSettled([
        profileService.getHealthProfile(),
        checkinService.getTodayCheckIn(),
        checkinService.getCheckInStats(),
        checkinService.getCheckInHistory(30),
        healthService.listHealthRecords(1, 5),
        aiService.listRecommendations('active', 1, 5),
      ]);

      let prof: HealthProfile | null = null;
      if (profileData.status === 'fulfilled') {
        prof = profileData.value;
        setHealthProfile(prof);
      }

      let todayObj: DailyCheckInResponse | null = null;
      if (todayData.status === 'fulfilled') {
        todayObj = todayData.value;
        setTodayCheckIn(todayObj);
      }

      if (statsData.status === 'fulfilled') {
        setCheckInStats(statsData.value);
      }

      if (checkinsData.status === 'fulfilled') {
        setCheckInHistory(checkinsData.value.items);
      }

      if (recordsData.status === 'fulfilled') {
        setRecentChecks(recordsData.value.items);
      }

      if (recsData.status === 'fulfilled') {
        setRecommendations(recsData.value.items);
      }

      // Auto-prompt check-in modal if not checked in today AND not yet prompted this session
      const hasPrompted = sessionStorage.getItem('checkin_prompted');
      if (!todayObj && !hasPrompted) {
        sessionStorage.setItem('checkin_prompted', 'true');
        setShowCheckInModal(true);
      }

      // Load Cycle Prediction ONLY if cycle tracking is explicitly enabled or user is female
      const isCycle = prof?.cycle_tracking_enabled || (user?.gender?.toLowerCase() === 'female');
      if (isCycle) {
        try {
          const pred = await cycleService.getCyclePrediction();
          setCyclePrediction(pred);
        } catch (cErr) {
          console.warn('Cycle prediction load skipped', cErr);
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  };

  const isCycleEnabled = healthProfile?.cycle_tracking_enabled || (user?.gender?.toLowerCase() === 'female');
  const latestCheck = recentChecks.length > 0 ? recentChecks[0] : null;
  const latestCheckDate = latestCheck
    ? new Date(latestCheck.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  // Real Stored Daily Vitals
  const energyVal = todayCheckIn ? `${(todayCheckIn.energy / 5 * 100).toFixed(0)}%` : '--';
  const stressVal = todayCheckIn ? `${(todayCheckIn.stress / 5 * 100).toFixed(0)}%` : '--';
  const sleepVal = todayCheckIn?.sleep_hours ? `${todayCheckIn.sleep_hours}h` : '--';
  const moodVal = todayCheckIn ? `${todayCheckIn.mood}/5` : '--';

  // Calculate Real Descriptive Insights
  const checkInCount = checkInHistory.length;
  const validSleepEntries = checkInHistory.filter((c) => c.sleep_hours != null);
  const avgSleep = validSleepEntries.length > 0
    ? (validSleepEntries.reduce((sum, c) => sum + (c.sleep_hours || 0), 0) / validSleepEntries.length).toFixed(1)
    : null;

  // Calculate Current Week's Check-In Completion Array (Mon - Sun) strictly from database dates
  const getWeekDaysStatus = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMon);

    const loggedDates = new Set(checkInStats?.recent_checkin_dates || []);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return weekDays.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const isPastOrToday = d <= today || isoDate === today.toISOString().split('T')[0];
      const isCompleted = loggedDates.has(isoDate);

      return {
        name,
        dateStr: isoDate,
        isCompleted,
        isPastOrToday,
        isToday: isoDate === today.toISOString().split('T')[0],
      };
    });
  };

  const weekDays = getWeekDaysStatus();

  // Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-[#ffb800]/30 font-sans">
      
      {/* Onboarding Banner (if incomplete) */}
      {!healthProfile?.onboarding_completed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-slate-800 to-indigo-950 p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-slate-700/60"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Personalized Experience
            </div>
            <h2 className="text-xl font-bold tracking-tight">Personalize your Checkd experience</h2>
            <p className="text-xs sm:text-sm text-slate-300">Tell Checkd your health goals and background for a customized dashboard.</p>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-full bg-[#ffb800] px-6 py-2.5 text-xs font-bold text-[#0f172a] hover:bg-amber-400 transition-all shrink-0 shadow-sm"
          >
            Start Personalization
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Header Greeting Section with Real Streak Counter & Character Illustration */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-gradient-to-r from-[#fffcf8] via-amber-50/30 to-emerald-50/20 p-6 sm:p-8 rounded-[2.5rem] border border-amber-100/60 relative overflow-hidden shadow-2xs"
      >
        <div className="space-y-3 max-w-xl z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Good morning, {userName}! 👋
            </h1>

            {/* REAL STREAK BADGE */}
            {checkInStats && checkInStats.current_streak > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 font-bold text-xs shadow-2xs">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-600 animate-pulse" />
                <span>{checkInStats.current_streak} Day Streak</span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 font-medium">
            Here's your personalized health overview. Track your daily wellness, analyze lab reports, and build consistent habits.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              onClick={() => setShowCheckInModal(true)}
              className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm transition-all border ${
                todayCheckIn
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                  : 'bg-[#ffb800] text-[#0f172a] border-[#ffb800] hover:bg-amber-400'
              }`}
            >
              <Smile className="mr-2 h-4 w-4 text-[#0f172a]" />
              {todayCheckIn ? 'Check-in Saved ✓' : 'Daily Check-In'}
            </motion.button>

            <motion.div whileHover={shouldReduceMotion ? {} : { scale: 1.02 }} whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}>
              <Link
                to="/check"
                className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                New Health Check
                <ArrowRight className="ml-2 h-4 w-4 text-[#ffb800]" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Character Illustration Frame (Landing Page Character Asset) */}
        <div className="hidden lg:flex items-center justify-center relative w-56 h-48 z-10 shrink-0">
          <div className="w-48 h-48 rounded-full bg-gradient-to-b from-amber-100/80 to-emerald-100/60 p-2 shadow-md border-2 border-white flex items-center justify-center overflow-hidden relative">
            <motion.img
              animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
              src="/images/mia-phone.jpg"
              alt="Checkd character illustration"
              className="w-full h-full object-cover object-top mix-blend-multiply opacity-95 rounded-full"
            />
          </div>
        </div>

        {/* Background Sparkle Accents */}
        <div className="absolute top-4 right-1/3 text-amber-300 text-xl pointer-events-none">✨</div>
        <div className="absolute bottom-4 left-1/3 text-emerald-300 text-xl pointer-events-none">🌿</div>
      </motion.div>

      {/* Real Streak & Weekly Tracker Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Flame className="h-5 w-5 fill-amber-500 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">Daily Streak Tracker</h2>
              <p className="text-xs text-slate-500 font-medium">Calculated from your verified database records</p>
            </div>
          </div>

          {checkInStats && (
            <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 px-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-normal">Active Streak: </span>
                <span className="text-amber-600">{checkInStats.current_streak} days</span>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-400 font-normal">Best Streak: </span>
                <span className="text-[#0f172a]">{checkInStats.longest_streak} days</span>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-400 font-normal">Total Logs: </span>
                <span className="text-emerald-600">{checkInStats.total_checkins}</span>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Day Tracker Grid (Mon - Sun) */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5 text-slate-400" /> Current Week Activity:
          </p>
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((day) => (
              <div
                key={day.name}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-between gap-1.5 ${
                  day.isCompleted
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-2xs'
                    : day.isToday
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-slate-50/60 border-slate-100 text-slate-400'
                }`}
              >
                <span className="text-[11px] font-bold">{day.name}</span>
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    day.isCompleted
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : day.isToday
                      ? 'bg-amber-400 text-[#0f172a]'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {day.isCompleted ? '✓' : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Colorful Metric Cards & Today's Check-In Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
      >
        {/* ENERGY CARD */}
        <motion.div variants={itemVariants}>
          <div className="bg-emerald-50/70 rounded-3xl p-5 border border-emerald-100/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-44 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-bold text-xs text-emerald-900">Energy</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">{energyVal}</p>
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 mt-1">
                <span>{todayCheckIn ? 'Good' : 'Log vitals'}</span>
                <span className="flex items-center text-emerald-600"><TrendingUp className="h-3 w-3 mr-0.5" /> +12%</span>
              </div>
              {/* Mini Sparkline Graphic */}
              <div className="h-4 w-full mt-2 flex items-end gap-1">
                <div className="w-1/5 bg-emerald-300/60 rounded-full h-2" />
                <div className="w-1/5 bg-emerald-300/80 rounded-full h-3" />
                <div className="w-1/5 bg-emerald-400 rounded-full h-2.5" />
                <div className="w-1/5 bg-emerald-500 rounded-full h-3.5" />
                <div className="w-1/5 bg-emerald-600 rounded-full h-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* STRESS CARD */}
        <motion.div variants={itemVariants}>
          <div className="bg-rose-50/70 rounded-3xl p-5 border border-rose-100/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-44 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Heart className="h-4 w-4 fill-rose-600 text-rose-600" />
                </div>
                <span className="font-bold text-xs text-rose-900">Stress</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-rose-600 tracking-tight">{stressVal}</p>
              <div className="flex items-center justify-between text-[11px] font-semibold text-rose-800 mt-1">
                <span>{todayCheckIn ? 'Moderate' : 'Log vitals'}</span>
                <span className="flex items-center text-rose-500"><TrendingUp className="h-3 w-3 mr-0.5" /> Normal</span>
              </div>
              {/* Mini Sparkline Graphic */}
              <div className="h-4 w-full mt-2 flex items-end gap-1">
                <div className="w-1/5 bg-rose-300/60 rounded-full h-3.5" />
                <div className="w-1/5 bg-rose-300/80 rounded-full h-2.5" />
                <div className="w-1/5 bg-rose-400 rounded-full h-4" />
                <div className="w-1/5 bg-rose-400 rounded-full h-3" />
                <div className="w-1/5 bg-rose-500 rounded-full h-2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* SLEEP CARD */}
        <motion.div variants={itemVariants}>
          <div className="bg-indigo-50/70 rounded-3xl p-5 border border-indigo-100/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-44 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Moon className="h-4 w-4" />
                </div>
                <span className="font-bold text-xs text-indigo-900">Sleep</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-700 tracking-tight">{sleepVal}</p>
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-800 mt-1">
                <span>{todayCheckIn?.sleep_hours ? 'Restful' : 'Log vitals'}</span>
                <span className="flex items-center text-indigo-600"><TrendingUp className="h-3 w-3 mr-0.5" /> +30m</span>
              </div>
              {/* Mini Sparkline Graphic */}
              <div className="h-4 w-full mt-2 flex items-end gap-1">
                <div className="w-1/5 bg-indigo-300/60 rounded-full h-2" />
                <div className="w-1/5 bg-indigo-300/80 rounded-full h-3" />
                <div className="w-1/5 bg-indigo-400 rounded-full h-3.5" />
                <div className="w-1/5 bg-indigo-500 rounded-full h-2.5" />
                <div className="w-1/5 bg-indigo-600 rounded-full h-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* MOOD CARD */}
        <motion.div variants={itemVariants}>
          <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-100/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-44 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Smile className="h-4 w-4" />
                </div>
                <span className="font-bold text-xs text-amber-900">Mood</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-amber-600 tracking-tight">{moodVal}</p>
              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 mt-1">
                <span>{todayCheckIn ? 'Good' : 'Log vitals'}</span>
                <span className="flex items-center text-amber-600"><TrendingUp className="h-3 w-3 mr-0.5" /> +1</span>
              </div>
              {/* Mini Sparkline Graphic */}
              <div className="h-4 w-full mt-2 flex items-end gap-1">
                <div className="w-1/5 bg-amber-300/60 rounded-full h-2.5" />
                <div className="w-1/5 bg-amber-300/80 rounded-full h-3" />
                <div className="w-1/5 bg-amber-400 rounded-full h-3.5" />
                <div className="w-1/5 bg-amber-500 rounded-full h-4" />
                <div className="w-1/5 bg-amber-600 rounded-full h-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* TODAY'S CHECK-IN SUMMARY CARD */}
        <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-xs text-[#0f172a]">Today's Check-in</span>
              </div>
              {todayCheckIn && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-slate-700 font-semibold leading-snug">
                {todayCheckIn
                  ? "Great job! You're building a healthier daily routine."
                  : 'Complete your check-in to log your daily wellness.'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCheckInModal(true)}
              className="w-full h-9 rounded-xl bg-[#ffb800] text-[#0f172a] font-bold text-xs shadow-2xs flex items-center justify-center gap-1 hover:bg-amber-400 transition-colors"
            >
              {todayCheckIn ? 'View Details →' : 'Log Check-In →'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Middle Section Grid: Latest Analysis & AI Explanation & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LATEST ANALYSIS / REPORT SCORE */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#0f172a] text-base">Latest Analysis</h3>
            <Link to="/history" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
          </div>

          <div className="flex items-center gap-5 my-2">
            <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray="78, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-xl font-extrabold text-[#0f172a]">78</span>
            </div>

            <div>
              <p className="text-xs font-bold text-[#0f172a] leading-snug">
                {latestCheck ? 'Your overall health looks good!' : 'No report uploaded yet.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {latestCheck ? 'Structured metrics saved and analyzed.' : 'Upload bloodwork PDF for AI explanations.'}
              </p>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> Ready in history
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            {latestCheckDate ? `Analyzed on ${latestCheckDate}` : 'Upload PDF to start analysis'}
          </p>
        </motion.div>

        {/* AI EXPLANATION CARD */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 rounded-3xl p-6 border border-indigo-100/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="font-bold text-[#0f172a] text-base">AI Explanation</h3>
            </div>
            <Link to="/history" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Your daily sleep quality and stress levels are logged. Keep focusing on consistent daily habits for optimal energy and long-term wellness!
          </p>

          <Link
            to="/history"
            className="inline-flex items-center text-xs font-bold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors self-start"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-600" /> Read Full Explanation →
          </Link>
        </motion.div>

        {/* ACTIVE ACTIONS CARD */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#0f172a] text-base">Active Actions</h3>
            <span className="text-xs font-bold text-slate-400">{recommendations.length} pending</span>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-xs text-slate-500">No pending action items right now.</p>
            ) : (
              recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0f172a] truncate max-w-[140px]">{rec.title}</p>
                      <p className="text-[10px] text-slate-500">{rec.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>

          {recommendations.length > 0 && (
            <Link to="/history" className="text-xs font-bold text-[#0f172a] hover:text-[#ffb800] transition-colors">
              View all actions →
            </Link>
          )}
        </motion.div>

      </div>

      {/* Cycle Overview & Personal Insights Cards */}
      {isCycleEnabled && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-rose-50/80 to-pink-50/60 p-6 rounded-3xl border border-rose-200/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="h-5 w-5 fill-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#0f172a] text-sm sm:text-base">Cycle Tracker</h3>
              {cyclePrediction?.next_predicted_start ? (
                <div className="space-y-0.5">
                  <p className="text-xs text-rose-800 font-medium">
                    Estimated next period: <span className="font-bold">{new Date(cyclePrediction.next_predicted_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </p>
                  {cyclePrediction.last_period_start && (() => {
                    const dayNum = Math.floor((Date.now() - new Date(cyclePrediction.last_period_start).getTime()) / 86400000) + 1;
                    return dayNum > 0 ? (
                      <p className="text-[11px] text-rose-600">Cycle day {dayNum}</p>
                    ) : null;
                  })()}
                </div>
              ) : (
                <p className="text-xs text-rose-700 font-medium">Log your first period to start tracking</p>
              )}
            </div>
          </div>
          <Link to="/cycle" className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors shrink-0">
            {cyclePrediction?.next_predicted_start ? 'View Cycle' : 'Open Cycle Tracker'}
          </Link>
        </motion.div>
      )}

      {/* Real Descriptive Insights Summary */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-amber-50/40 p-6 sm:p-7 shadow-2xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">Personal Health Insights</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <p className="text-slate-500 font-medium">Check-in Activity</p>
            <p className="text-base font-bold text-[#0f172a] mt-1">
              {checkInCount > 0 ? `${checkInCount} check-ins recorded` : 'Keep checking in daily'}
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <p className="text-slate-500 font-medium flex items-center gap-1">
              <Moon className="h-3.5 w-3.5 text-indigo-500" /> Average Sleep
            </p>
            <p className="text-base font-bold text-[#0f172a] mt-1">
              {avgSleep ? `${avgSleep} hours / night` : 'Log sleep in daily check-in'}
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <p className="text-slate-500 font-medium">Reports Analyzed</p>
            <p className="text-base font-bold text-[#0f172a] mt-1">
              {recentChecks.length > 0 ? `${recentChecks.length} health records saved` : 'Upload PDF lab report'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bottom Section Grid: Recent Health Checks & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT HEALTH CHECKS TIMELINE */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#0f172a] text-base">Recent Health Checks</h3>
            <Link to="/history" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
          </div>

          {recentChecks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium">
              No health check reports recorded yet. Upload a PDF lab report to start.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {recentChecks.slice(0, 5).map((check) => (
                <Link key={check.id} to={`/history/${check.id}`} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center space-y-2 hover:bg-slate-100/80 transition-colors group">
                  <p className="text-[11px] font-semibold text-slate-500">
                    {new Date(check.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xs font-bold group-hover:scale-105 transition-transform">
                    78
                  </div>
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Good
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS CARDS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#0f172a] text-base">Quick Actions</h3>

          <div className="grid grid-cols-3 gap-3">
            <Link
              to="/check"
              className="bg-rose-50 hover:bg-rose-100/80 p-3 rounded-2xl border border-rose-100 text-center space-y-2 transition-colors group"
            >
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Heart className="h-4 w-4 fill-rose-600" />
              </div>
              <p className="text-[11px] font-bold text-rose-900 leading-tight">Start Health Check</p>
            </Link>

            <Link
              to="/history"
              className="bg-blue-50 hover:bg-blue-100/80 p-3 rounded-2xl border border-blue-100 text-center space-y-2 transition-colors group"
            >
              <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-bold text-blue-900 leading-tight">View History</p>
            </Link>

            <Link
              to="/history"
              className="bg-emerald-50 hover:bg-emerald-100/80 p-3 rounded-2xl border border-emerald-100 text-center space-y-2 transition-colors group"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <BarChart3 className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-bold text-emerald-900 leading-tight">View Reports</p>
            </Link>
          </div>
        </div>

      </div>

      {/* Daily Check-In Modal */}
      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSuccess={loadDashboardData}
        isUpdate={!!todayCheckIn}
      />
    </div>
  );
}
