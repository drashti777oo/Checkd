import { User, Shield, LogOut, Check, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { HealthProfile } from '../types/profile';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setGender(user.gender || '');
    }
    loadHealthProfile();
  }, [user]);

  const loadHealthProfile = async () => {
    try {
      const prof = await profileService.getHealthProfile();
      setHealthProfile(prof);
      if (prof.height_cm) setHeightCm(prof.height_cm.toString());
      if (prof.weight_kg) setWeightKg(prof.weight_kg.toString());
      setCycleTrackingEnabled(prof.cycle_tracking_enabled);
    } catch (e) {
      console.error('Failed to load health profile:', e);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (fullName !== user?.full_name || gender !== user?.gender) {
        await authService.updateProfile({ full_name: fullName, gender: gender || undefined });
        await refreshProfile();
      }

      await profileService.updateHealthProfile({
        gender: gender || undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        cycle_tracking_enabled: cycleTrackingEnabled,
      });

      await loadHealthProfile();
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const memberSinceYear = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  const formatGender = (g?: string | null) => {
    if (!g) return 'Not specified';
    switch (g.toLowerCase()) {
      case 'female':
        return 'Female';
      case 'male':
        return 'Male';
      case 'non-binary':
        return 'Non-binary';
      case 'prefer_not_to_say':
        return 'Prefer not to say';
      default:
        return g.charAt(0).toUpperCase() + g.slice(1);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your account settings, health background, and personalization options.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-3xl font-bold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
          <p className="text-slate-600">{user?.email}</p>
          <p className="text-xs text-slate-500 mt-1">Member since {memberSinceYear}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Settings Sections */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              Account & Personal Details
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-500">Full Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <span className="text-sm text-slate-900">{displayName}</span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-500">Gender Identity</span>
              {isEditing ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <span className="text-sm font-medium text-slate-900">
                  {formatGender(user?.gender)}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-500">Height / Weight</span>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="Height cm"
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Weight kg"
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                </div>
              ) : (
                <span className="text-sm text-slate-900">
                  {healthProfile?.height_cm ? `${healthProfile.height_cm} cm` : 'Height N/A'} • {healthProfile?.weight_kg ? `${healthProfile.weight_kg} kg` : 'Weight N/A'}
                </span>
              )}
            </div>

            {/* Cycle Tracking Toggle */}
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500" /> Cycle Tracking Feature
              </span>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={cycleTrackingEnabled}
                  onChange={(e) => setCycleTrackingEnabled(e.target.checked)}
                  className="h-4 w-4 text-rose-600 rounded"
                />
              ) : (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  cycleTrackingEnabled ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cycleTrackingEnabled ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm font-medium text-slate-500">Email</span>
              <span className="text-sm text-slate-900">{user?.email || 'N/A'}</span>
            </div>

            {isEditing ? (
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 mt-2"
              >
                Edit Preferences
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-500" />
              Privacy & Security
            </h3>
            <p className="text-sm text-slate-500 mt-1">Your health background, goals, and daily check-ins are encrypted and private to your account.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Personal Health Onboarding</p>
                <p className="text-xs text-slate-500">Completed status: {healthProfile?.onboarding_completed ? 'Completed' : 'Pending'}</p>
              </div>
              <button
                onClick={() => navigate('/onboarding')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md"
              >
                Re-run Setup Wizard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
