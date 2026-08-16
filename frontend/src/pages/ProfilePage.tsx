import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Shield,
  LogOut,
  Check,
  Heart,
  Camera,
  Edit3,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Loader2,
  Activity,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { HealthProfile } from '../types/profile';
import { supabase } from '../lib/supabase';

const AVAILABLE_CONDITIONS = [
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

const AVAILABLE_GOALS = [
  'General wellness',
  'Understanding health reports',
  'Sleep',
  'Fitness',
  'Nutrition',
  'Stress & mood',
  'Period tracking',
  'Other',
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);

  // Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [medications, setMedications] = useState('');
  const [supplements, setSupplements] = useState('');
  const [cycleTrackingEnabled, setCycleTrackingEnabled] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ─── Load Initial Profile & Avatar ─────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setGender(user.gender || '');

      // Load avatar: 1. check user metadata, 2. fallback to user-scoped localStorage
      loadAvatar(user.id);
    }
    loadHealthProfile();
  }, [user]);

  const loadAvatar = async (userId: string) => {
    try {
      // 1. Check Supabase user metadata
      const { data } = await supabase.auth.getUser();
      const metaAvatar = data?.user?.user_metadata?.avatar_url;
      if (metaAvatar) {
        setAvatarUrl(metaAvatar);
        return;
      }

      // 2. Check user-scoped localStorage fallback
      const cached = localStorage.getItem(`checkd_avatar_${userId}`);
      if (cached) {
        setAvatarUrl(cached);
      }
    } catch {
      const cached = localStorage.getItem(`checkd_avatar_${userId}`);
      if (cached) setAvatarUrl(cached);
    }
  };

  const loadHealthProfile = async () => {
    try {
      const prof = await profileService.getHealthProfile();
      setHealthProfile(prof);
      if (prof.date_of_birth) setDob(prof.date_of_birth);
      if (prof.height_cm) setHeightCm(prof.height_cm.toString());
      if (prof.weight_kg) setWeightKg(prof.weight_kg.toString());
      if (prof.health_conditions) setSelectedConditions(prof.health_conditions);
      if (prof.health_goals) setSelectedGoals(prof.health_goals);
      if (prof.medications) setMedications(prof.medications.join(', '));
      if (prof.supplements) setSupplements(prof.supplements.join(', '));
      setCycleTrackingEnabled(prof.cycle_tracking_enabled);
    } catch (e) {
      console.error('Failed to load health profile:', e);
    }
  };

  // ─── Avatar Handlers ───────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview || !user) return;
    setSavingAvatar(true);
    setAvatarError(null);

    try {
      // 1. Persist to Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: avatarPreview },
      });

      // 2. Cache in user-scoped local storage for immediate persistence
      localStorage.setItem(`checkd_avatar_${user.id}`, avatarPreview);

      setAvatarUrl(avatarPreview);
      setShowAvatarModal(false);
      setAvatarPreview(null);
    } catch (err: unknown) {
      console.warn('Failed to update Supabase metadata, saving locally', err);
      // Fallback local save
      localStorage.setItem(`checkd_avatar_${user.id}`, avatarPreview);
      setAvatarUrl(avatarPreview);
      setShowAvatarModal(false);
      setAvatarPreview(null);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setSavingAvatar(true);
    try {
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
      localStorage.removeItem(`checkd_avatar_${user.id}`);
      setAvatarUrl(null);
      setAvatarPreview(null);
      setShowAvatarModal(false);
    } catch (err: unknown) {
      console.warn('Failed to remove avatar from metadata', err);
      localStorage.removeItem(`checkd_avatar_${user.id}`);
      setAvatarUrl(null);
      setAvatarPreview(null);
      setShowAvatarModal(false);
    } finally {
      setSavingAvatar(false);
    }
  };

  // ─── Edit Profile Handlers ─────────────────────────────────────────────────
  const openEditModal = () => {
    setFullName(user?.full_name || '');
    setGender(user?.gender || healthProfile?.gender || '');
    setDob(healthProfile?.date_of_birth || '');
    setHeightCm(healthProfile?.height_cm ? healthProfile.height_cm.toString() : '');
    setWeightKg(healthProfile?.weight_kg ? healthProfile.weight_kg.toString() : '');
    setSelectedConditions(healthProfile?.health_conditions || []);
    setSelectedGoals(healthProfile?.health_goals || []);
    setMedications(healthProfile?.medications ? healthProfile.medications.join(', ') : '');
    setSupplements(healthProfile?.supplements ? healthProfile.supplements.join(', ') : '');
    setCycleTrackingEnabled(healthProfile?.cycle_tracking_enabled || false);
    setSaveError(null);
    setIsEditing(true);
  };

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // 1. Update basic account fields if changed
      if (fullName !== user?.full_name || gender !== user?.gender) {
        await authService.updateProfile({
          full_name: fullName.trim() || undefined,
          gender: gender || undefined,
        });
        await refreshProfile();
      }

      // 2. Update health profile
      const isFemale = gender.toLowerCase() === 'female';
      await profileService.updateHealthProfile({
        date_of_birth: dob || undefined,
        gender: gender || undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        health_conditions: selectedConditions.length > 0 ? selectedConditions : undefined,
        health_goals: selectedGoals.length > 0 ? selectedGoals : undefined,
        medications: medications
          ? medications.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        supplements: supplements
          ? supplements.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
        cycle_tracking_enabled: isFemale ? cycleTrackingEnabled : false,
      });

      await loadHealthProfile();
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1000);
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      setSaveError('Failed to save changes. Please check your network connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // ─── Derived Statistics & Completeness ─────────────────────────────────────
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const memberSinceFormatted = user?.created_at
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

  // Profile setup completeness calculated from real fields
  const calculateCompleteness = () => {
    let score = 0;
    if (user?.full_name) score += 15;
    if (user?.gender || healthProfile?.gender) score += 15;
    if (healthProfile?.height_cm) score += 15;
    if (healthProfile?.weight_kg) score += 15;
    if (healthProfile?.health_goals && healthProfile.health_goals.length > 0) score += 20;
    if (healthProfile?.health_conditions && healthProfile.health_conditions.length > 0) score += 20;
    return score;
  };

  const completenessPercentage = calculateCompleteness();
  const isFemaleUser = (user?.gender?.toLowerCase() === 'female') || (healthProfile?.gender?.toLowerCase() === 'female');

  // ─── Motion Variants ───────────────────────────────────────────────────────
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans selection:bg-[#ffb800]/30"
    >
      {/* ── 1. PROFILE HEADER CARD ────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-r from-[#fffcf8] via-amber-50/40 to-blue-50/30 p-6 sm:p-8 rounded-[2rem] border border-amber-100/80 shadow-2xs relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar with Camera Icon Overlay */}
            <div className="relative group shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#0f172a] text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold select-none">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Edit Photo Overlay Button */}
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview(avatarUrl);
                  setShowAvatarModal(true);
                }}
                title="Edit profile photo"
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#ffb800] text-[#0f172a] hover:bg-amber-400 border-2 border-white shadow-sm flex items-center justify-center transition-transform hover:scale-110"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Name, Email, Member Since */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                  {displayName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">{user?.email}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Member since {memberSinceFormatted}</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Action */}
          <div className="self-start sm:self-auto shrink-0">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Edit3 className="h-3.5 w-3.5 text-[#ffb800]" />
              Edit Profile
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. PROFILE COMPLETENESS GAUGE ─────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0f172a]">Profile Setup</h2>
              <p className="text-xs text-slate-500 font-medium">
                {completenessPercentage === 100
                  ? 'Your profile is fully configured for a personalized experience.'
                  : 'Complete your profile details to get more tailored health metrics.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-[#0f172a] bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {completenessPercentage}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completenessPercentage}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${
              completenessPercentage === 100 ? 'bg-emerald-500' : 'bg-[#ffb800]'
            }`}
          />
        </div>
      </motion.div>

      {/* ── 3. MAIN DETAILS GRID ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── PERSONAL DETAILS CARD ── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-[#0f172a] text-base">Personal Details</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Full Name</span>
                <span className="font-bold text-[#0f172a]">{displayName}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Gender Identity</span>
                <span className="font-bold text-[#0f172a]">
                  {formatGender(user?.gender || healthProfile?.gender)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Date of Birth</span>
                <span className="font-bold text-[#0f172a]">
                  {healthProfile?.date_of_birth
                    ? new Date(healthProfile.date_of_birth).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not provided'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Height</span>
                <span className="font-bold text-[#0f172a]">
                  {healthProfile?.height_cm ? `${healthProfile.height_cm} cm` : 'Not recorded'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Weight</span>
                <span className="font-bold text-[#0f172a]">
                  {healthProfile?.weight_kg ? `${healthProfile.weight_kg} kg` : 'Not recorded'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Email Address</span>
                <span className="font-bold text-[#0f172a] truncate max-w-[200px]">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={openEditModal}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 self-start pt-2"
          >
            Edit Details →
          </button>
        </motion.div>

        {/* ── HEALTH PREFERENCES & ONBOARDING CARD ── */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-[#0f172a] text-base">Health Preferences</h3>
              </div>
            </div>

            {/* Health Goals */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Primary Goals
              </span>
              {healthProfile?.health_goals && healthProfile.health_goals.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {healthProfile.health_goals.map((g, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No health goals selected yet.</p>
              )}
            </div>

            {/* Health Background / Conditions */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Health Background
              </span>
              {healthProfile?.health_conditions && healthProfile.health_conditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {healthProfile.health_conditions.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No conditions reported.</p>
              )}
            </div>

            {/* Cycle Tracking Status (Visible for female users) */}
            {isFemaleUser && (
              <div className="space-y-1.5 pt-2 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cycle Tracking
                </span>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                    <span className="text-xs font-bold text-[#0f172a]">Cycle Tracker</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      healthProfile?.cycle_tracking_enabled
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {healthProfile?.cycle_tracking_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/onboarding"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 self-start pt-2"
          >
            Re-run Setup Wizard →
          </Link>
        </motion.div>

      </div>

      {/* ── 4. PRIVACY, SECURITY & ACCOUNT CARD ───────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-700" />
            <h3 className="font-bold text-[#0f172a] text-base">Account, Privacy &amp; Security</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
            <p className="font-bold text-[#0f172a]">Data Encryption &amp; Isolation</p>
            <p className="text-slate-500 leading-relaxed">
              Your health telemetry, lab metrics, and cycle logs are user-isolated and protected by verified Supabase JWT security tokens.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
            <p className="font-bold text-[#0f172a]">Active Session</p>
            <p className="text-slate-500 leading-relaxed">
              Authenticated as <span className="font-semibold text-slate-700">{user?.email}</span>.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs"
          >
            <LogOut className="h-4 w-4" />
            Log Out of Checkd
          </button>
        </div>
      </motion.div>

      {/* ── 5. EDIT PROFILE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0f172a]">Edit Health Profile</h2>
                  <p className="text-xs text-slate-500">Update your personal details and wellness goals.</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {saveError && (
                <div className="rounded-2xl bg-rose-50 p-3.5 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 font-semibold">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-[#0f172a] focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 outline-none transition-all"
                  />
                </div>

                {/* Gender & DOB */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Gender Identity</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-[#0f172a] focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 outline-none transition-all bg-white"
                    >
                      <option value="">Not specified</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-[#0f172a] focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="50"
                      max="250"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="e.g. 165"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-[#0f172a] focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="20"
                      max="300"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 60"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-[#0f172a] focus:border-[#ffb800] focus:ring-2 focus:ring-[#ffb800]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Health Conditions Multi-select */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Health Background</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_CONDITIONS.map((cond) => {
                      const active = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                            active
                              ? 'bg-[#0f172a] text-white border-[#0f172a]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Goals Multi-select */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Wellness Goals</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_GOALS.map((goal) => {
                      const active = selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cycle Tracking Toggle (Female profiles) */}
                {gender.toLowerCase() === 'female' && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                      <div>
                        <p className="font-bold text-[#0f172a]">Cycle &amp; Period Tracking</p>
                        <p className="text-[11px] text-slate-500">Enable menstrual cycle estimates</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cycleTrackingEnabled}
                      onChange={(e) => setCycleTrackingEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                )}

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#ffb800]" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. EDIT AVATAR MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-[#0f172a]">Profile Photo</h3>
                <button
                  onClick={() => {
                    setShowAvatarModal(false);
                    setAvatarPreview(null);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Avatar Preview circle */}
              <div className="flex justify-center py-2">
                <div className="h-28 w-28 rounded-full border-4 border-slate-100 shadow-md overflow-hidden bg-[#0f172a] text-white flex items-center justify-center text-4xl font-extrabold">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Current"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {avatarError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {avatarError}
                </p>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 text-xs font-bold text-[#0f172a] transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Choose from device (JPG, PNG, WebP)
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={savingAvatar}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 px-4 py-2 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove photo
                  </button>
                )}
              </div>

              {/* Confirm / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarModal(false);
                    setAvatarPreview(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                {avatarPreview && avatarPreview !== avatarUrl && (
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={savingAvatar}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                  >
                    {savingAvatar ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#ffb800]" /> Save Photo
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
