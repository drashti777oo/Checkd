import { Link } from 'react-router-dom';
import { Activity, Clock, ShieldAlert, ArrowRight, Heart, Smile, Moon, Sparkles, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { DailyCheckInResponse } from '../types/checkin';
import DailyCheckInModal from '../components/shared/DailyCheckInModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckInResponse | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<DailyCheckInResponse[]>([]);
  const [recentChecks, setRecentChecks] = useState<HealthRecordResponse[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [cyclePrediction, setCyclePrediction] = useState<CyclePredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, todayData, checkinsData, recordsData, recsData] = await Promise.allSettled([
        profileService.getHealthProfile(),
        checkinService.getTodayCheckIn(),
        checkinService.getCheckInHistory(30),
        healthService.listHealthRecords(1, 5),
        aiService.listRecommendations('active', 1, 5),
      ]);

      let prof: HealthProfile | null = null;
      if (profileData.status === 'fulfilled') {
        prof = profileData.value;
        setHealthProfile(prof);
      }
      if (todayData.status === 'fulfilled') {
        setTodayCheckIn(todayData.value);
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

      // Load Cycle Prediction ONLY if cycle tracking is explicitly enabled or user is female
      const isCycleEnabled = prof?.cycle_tracking_enabled || (user?.gender?.toLowerCase() === 'female');
      if (isCycleEnabled) {
        try {
          const pred = await cycleService.getCyclePrediction();
          setCyclePrediction(pred);
        } catch (cErr) {
          console.warn('Cycle prediction load skipped', cErr);
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const isCycleEnabled = healthProfile?.cycle_tracking_enabled || (user?.gender?.toLowerCase() === 'female');
  const latestCheck = recentChecks.length > 0 ? recentChecks[0] : null;
  const latestCheckDate = latestCheck
    ? new Date(latestCheck.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No checks yet';

  // Calculate Real Descriptive Insights
  const checkInCount = checkInHistory.length;
  const validSleepEntries = checkInHistory.filter((c) => c.sleep_hours != null);
  const avgSleep = validSleepEntries.length > 0
    ? (validSleepEntries.reduce((sum, c) => sum + (c.sleep_hours || 0), 0) / validSleepEntries.length).toFixed(1)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Onboarding Banner if incomplete */}
      {!healthProfile?.onboarding_completed && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Personalize your Checkd experience</h2>
            <p className="text-xs text-blue-100">Tell Checkd your health goals and background for a customized dashboard.</p>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
          >
            Start Personalization
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Welcome & Quick Action Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good morning, {userName}</h1>
          <p className="text-sm text-slate-600 mt-1">Here's your personalized Checkd health overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Smile className="mr-2 h-4 w-4 text-blue-400" />
            {todayCheckIn ? 'Check-in Saved ✓' : 'Daily Check-In'}
          </button>
          <Link
            to="/check"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            New Health Check
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Top Personalized Cards Grid */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isCycleEnabled ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {/* Daily Check-In Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Smile className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Daily Check-In</h3>
                <p className="text-xs text-slate-500">Today's wellness</p>
              </div>
            </div>
            {todayCheckIn && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Done</span>}
          </div>
          <div className="mt-4">
            {todayCheckIn ? (
              <div>
                <p className="text-xl font-bold text-slate-900">Check-in saved ✓</p>
                <p className="text-xs text-slate-500">Mood: {todayCheckIn.mood}/5 • Sleep: {todayCheckIn.sleep_hours || '--'}h</p>
              </div>
            ) : (
              <div>
                <p className="text-base font-semibold text-slate-900">Not checked in yet</p>
                <button
                  onClick={() => setShowCheckInModal(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                >
                  <Plus className="h-3 w-3" /> Log how you feel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Latest Check Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Latest Report</h3>
              <p className="text-xs text-slate-500">{latestCheckDate}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xl font-semibold text-slate-900 truncate">
              {latestCheck ? (latestCheck.data?.report_filename || latestCheck.record_type) : 'No Reports Uploaded'}
            </p>
            <p className="text-xs text-green-600 font-medium">
              {latestCheck ? 'Structured metrics saved' : 'Upload your first report'}
            </p>
          </div>
        </div>

        {/* Cycle Overview Card (Conditional) */}
        {isCycleEnabled && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-6 shadow-sm flex flex-col justify-between h-40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Heart className="h-5 w-5 fill-rose-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Cycle Tracker</h3>
                <p className="text-xs text-slate-500">Next predicted period</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {cyclePrediction?.next_predicted_start
                    ? new Date(cyclePrediction.next_predicted_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Log period'}
                </p>
                <p className="text-xs text-rose-600 font-medium">Estimated window</p>
              </div>
              <Link to="/cycle" className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline">
                View Tracker
              </Link>
            </div>
          </div>
        )}

        {/* Active Recommendations Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Active Actions</h3>
              <p className="text-xs text-slate-500">Personalized steps</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-slate-900">{recommendations.length}</p>
            <p className="text-xs text-slate-500 font-medium">
              {recommendations.length > 0 ? 'Pending action items' : 'No pending actions'}
            </p>
          </div>
        </div>
      </div>

      {/* Real Descriptive Insights Banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Personal Health Insights</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3 rounded-xl border border-blue-100">
            <p className="text-slate-500">Check-in Activity</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {checkInCount > 0 ? `${checkInCount} check-ins completed` : 'Keep checking in daily'}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-blue-100">
            <p className="text-slate-500 flex items-center gap-1">
              <Moon className="h-3 w-3 text-indigo-500" /> Average Sleep
            </p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {avgSleep ? `${avgSleep} hours / night` : 'Log sleep in daily check-in'}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-blue-100">
            <p className="text-slate-500">Reports Analyzed</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {recentChecks.length > 0 ? `${recentChecks.length} health records saved` : 'Upload PDF lab report'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Recent Checks */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Results</h2>
              <Link to="/history" className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading recent checks...</div>
              ) : recentChecks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No health reports recorded yet. Click "New Health Check" to upload a PDF.
                </div>
              ) : (
                recentChecks.map((check) => (
                  <div key={check.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {check.data?.report_filename || (check.record_type === 'pdf_report' ? 'PDF Health Report' : 'Vitals Check')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>
                            {new Date(check.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span className="text-green-600 font-medium">Result available</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/history/${check.id}`} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                      View <ArrowRight className="inline ml-1 h-3 w-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Area: Recommendations */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Next Steps</h2>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-500">
                No active recommendations. Complete a check to generate custom next steps.
              </div>
            ) : (
              recommendations.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 mb-2">
                    {rec.category}
                  </div>
                  <h3 className="font-medium text-slate-900">{rec.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Daily Check-In Modal */}
      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
