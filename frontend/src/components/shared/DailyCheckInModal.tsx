import { useState } from 'react';
import { Smile, Zap, Activity, Moon, Droplets, CheckCircle2, X, AlertCircle } from 'lucide-react';

/** Extracts a user-facing error message from an Axios error or standard Error. */
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
    if (axiosErr.response?.data?.detail) return axiosErr.response.data.detail;
    if (axiosErr.message) return axiosErr.message;
  }
  return 'Failed to save check-in. Please try again.';
}
import { checkinService } from '../../services/checkin.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isUpdate?: boolean;
}

export default function DailyCheckInModal({ isOpen, onClose, onSuccess, isUpdate = false }: Props) {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleepHours, setSleepHours] = useState('7.5');
  const [waterMl, setWaterMl] = useState('2000');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const symptomOptions = [
    'Headache',
    'Fatigue',
    'Nausea',
    'Muscle Pain',
    'Anxiety',
    'Stress',
    'Insomnia',
    'Brain Fog',
    'Cramps',
  ];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await checkinService.submitCheckIn({
        mood,
        energy,
        stress,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : undefined,
        water_intake_ml: waterMl ? parseInt(waterMl, 10) : undefined,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to submit daily check-in:', err);
      setSubmitError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isUpdate ? "Update Today's Check-In" : 'Daily Check-In'}
              </h2>
              <p className="text-xs text-slate-500">
                {isUpdate ? 'Edit your wellness entries for today.' : 'How are you feeling today?'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood 1-5 */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Mood (1 to 5)</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: 1, label: '😢 Low' },
                { val: 2, label: '😐 Fair' },
                { val: 3, label: '🙂 Good' },
                { val: 4, label: '😊 Great' },
                { val: 5, label: '😁 Excellent' },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setMood(m.val)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    mood === m.val
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Energy & Stress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Energy Level (1-5)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEnergy(v)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                      energy === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-purple-500" />
                Stress Level (1-5)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStress(v)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                      stress === v ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep & Water */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
                Sleep Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="7.5"
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-blue-500" />
                Water Intake (ml)
              </label>
              <input
                type="number"
                step="250"
                value={waterMl}
                onChange={(e) => setWaterMl(e.target.value)}
                placeholder="2000"
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500"
              />
            </div>
          </div>

          {/* Symptoms Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Today's Symptoms (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((sym) => {
                const active = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Highlights</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts or feelings..."
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500"
            ></textarea>
          </div>

          {/* Inline submission error */}
          {submitError && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3">
              <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-rose-800">{submitError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Check-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
