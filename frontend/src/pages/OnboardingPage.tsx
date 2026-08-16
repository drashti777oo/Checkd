import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Check, ShieldCheck, Heart } from 'lucide-react';
import { profileService } from '../services/profile.service';
import { authService } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('female');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['General wellness']);
  const [medications, setMedications] = useState('');
  const [supplements, setSupplements] = useState('');
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState(true);

  const availableConditions = [
    'None',
    'Diabetes',
    'PCOS',
    'Thyroid condition',
    'High blood pressure',
    'Asthma',
    'Anemia',
    'Other',
    'Prefer not to say',
  ];

  const availableGoals = [
    'General wellness',
    'Understanding health reports',
    'Sleep',
    'Fitness',
    'Nutrition',
    'Stress & mood',
    'Period tracking',
    'Other',
  ];

  const toggleCondition = (cond: string) => {
    if (cond === 'None') {
      setSelectedConditions(['None']);
      return;
    }
    setSelectedConditions((prev) => {
      const filtered = prev.filter((c) => c !== 'None');
      return filtered.includes(cond) ? filtered.filter((c) => c !== cond) : [...filtered, cond];
    });
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (gender) {
        await authService.updateProfile({ gender });
      }
      await profileService.completeOnboarding({
        date_of_birth: dob || undefined,
        gender: gender || undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        health_conditions: selectedConditions.length > 0 ? selectedConditions : undefined,
        health_goals: selectedGoals.length > 0 ? selectedGoals : undefined,
        medications: medications ? medications.split(',').map((s) => s.trim()) : undefined,
        supplements: supplements ? supplements.split(',').map((s) => s.trim()) : undefined,
        cycle_tracking_enabled: gender?.toLowerCase() === 'female' ? cycleTrackingEnabled : false,
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Personalize Your Checkd</h1>
              <p className="text-xs text-slate-500">Step {step} of 4</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            Skip for now
          </button>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
              <p className="text-xs text-slate-500 mt-1">Help us tailor metrics and body composition ranges.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender Identity</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="170"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="65"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Health Background */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Health Background</h2>
              <p className="text-xs text-slate-500 mt-1">
                Do you currently have any health conditions you'd like Checkd to know about? (User-provided context)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableConditions.map((cond) => {
                const active = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle Goals & Cycle Tracking */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">What would you like to focus on?</h2>
              <p className="text-xs text-slate-500 mt-1">Select your primary wellness priorities.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableGoals.map((goal) => {
                const active = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>

            {gender.toLowerCase() === 'female' && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Cycle & Period Tracking</h3>
                      <p className="text-xs text-slate-500">Enable menstrual cycle predictions and period logs</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={cycleTrackingEnabled}
                    onChange={(e) => setCycleTrackingEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Optional Medications & Complete */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Medications & Supplements (Optional)</h2>
              <p className="text-xs text-slate-500 mt-1">Provide optional comma-separated items for personal reference.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications</label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Multivitamin, Thyroid medication"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplements</label>
                <input
                  type="text"
                  value={supplements}
                  onChange={(e) => setSupplements(e.target.value)}
                  placeholder="e.g. Vitamin D3, Omega 3"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500"
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Your health background is strictly private and encrypted under your account. Checkd provides educational information and does not diagnose diseases.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
