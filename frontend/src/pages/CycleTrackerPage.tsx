import { useState, useEffect } from 'react';
import { Calendar, Plus, Heart, Sparkles, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cycleService } from '../services/cycle.service';
import { CycleLogResponse, CyclePredictionResponse } from '../types/cycle';

export default function CycleTrackerPage() {
  const { user } = useAuth();
  const isFemale = user?.gender?.toLowerCase() === 'female';

  const [logs, setLogs] = useState<CycleLogResponse[]>([]);
  const [prediction, setPrediction] = useState<CyclePredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [flowIntensity, setFlowIntensity] = useState('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSymptoms = [
    'Cramps',
    'Headaches',
    'Fatigue',
    'Mood Swings',
    'Bloating',
    'Acne',
    'Nausea',
    'Back Pain',
  ];

  useEffect(() => {
    if (isFemale) {
      loadCycleData();
    } else {
      setLoading(false);
    }
  }, [isFemale]);

  const loadCycleData = async () => {
    setLoading(true);
    try {
      const [logsData, predData] = await Promise.all([
        cycleService.listCycleLogs(),
        cycleService.getCyclePrediction(),
      ]);
      setLogs(logsData.items);
      setPrediction(predData);
    } catch (err) {
      console.error('Failed to load cycle tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await cycleService.logCycle({
        start_date: startDate,
        end_date: endDate || undefined,
        flow_intensity: flowIntensity,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        notes: notes || undefined,
      });
      setShowLogModal(false);
      await loadCycleData();
    } catch (err) {
      console.error('Failed to log period entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isFemale) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Cycle Tracker Access Restricted</h1>
        <p className="text-slate-600 max-w-lg mx-auto">
          Cycle and period tracking features are exclusively available to users who specify their gender as female in their profile preferences.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Update Gender in Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            Cycle Tracker
          </h1>
          <p className="text-slate-600 mt-1">Track your period, predict future cycles, and log menstrual symptoms.</p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Period
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading cycle data...</div>
      ) : (
        <div className="space-y-8">
          {/* Prediction Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 space-y-2">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Next Period Prediction</span>
              <p className="text-2xl font-extrabold text-slate-900">
                {prediction?.next_predicted_start
                  ? new Date(prediction.next_predicted_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Log a period to predict'}
              </p>
              <p className="text-xs text-slate-500">Based on standard ~{prediction?.average_cycle_length_days || 28}-day cycle</p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-6 space-y-2">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Est. Ovulation Window
              </span>
              <p className="text-2xl font-extrabold text-slate-900">
                {prediction?.predicted_ovulation_date
                  ? new Date(prediction.predicted_ovulation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Insufficient data'}
              </p>
              <p className="text-xs text-slate-500">Estimated fertile phase window</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Period Start</span>
              <p className="text-2xl font-extrabold text-slate-900">
                {prediction?.last_period_start
                  ? new Date(prediction.last_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'No logs yet'}
              </p>
              <p className="text-xs text-slate-500">Total logs: {logs.length}</p>
            </div>
          </div>

          {/* Log Period Modal */}
          {showLogModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Log Period & Symptoms</h2>
                  <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <form onSubmit={handleLogSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional)</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flow Intensity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['light', 'medium', 'heavy'].map((flow) => (
                        <button
                          key={flow}
                          type="button"
                          onClick={() => setFlowIntensity(flow)}
                          className={`py-2 rounded-lg text-xs font-semibold capitalize border ${
                            flowIntensity === flow
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {flow}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Menstrual Symptoms</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSymptoms.map((symptom) => {
                        const active = selectedSymptoms.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            type="button"
                            onClick={() => toggleSymptom(symptom)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              active
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {symptom}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional details..."
                      className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-rose-500"
                      rows={2}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowLogModal(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Period Log'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Cycle Log History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-500" />
              Cycle History ({logs.length})
            </h2>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No cycle entries logged yet. Click "Log Period" to record your cycle.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {new Date(log.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        {log.end_date && (
                          <span className="text-xs text-slate-500">
                            to {new Date(log.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 capitalize">
                          {log.flow_intensity} flow
                        </span>
                      </div>
                      {log.symptoms && log.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {log.symptoms.map((s, idx) => (
                            <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
