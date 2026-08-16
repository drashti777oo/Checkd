import { User, Shield, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile({ full_name: fullName });
      await refreshProfile();
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const memberSinceYear = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'August 2026';

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your account settings and privacy preferences.</p>
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
              Account Details
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm font-medium text-slate-500">Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <span className="text-sm text-slate-900">{displayName}</span>
              )}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm font-medium text-slate-500">Email</span>
              <span className="text-sm text-slate-900">{user?.email || 'N/A'}</span>
            </div>
            {isEditing ? (
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-500 mt-2"
              >
                <Check className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                onClick={() => {
                  setFullName(user?.full_name || '');
                  setIsEditing(true);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 mt-2"
              >
                Edit Details
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
            <p className="text-sm text-slate-500 mt-1">Your health data is associated with your account and kept secure.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Data Sharing</p>
                <p className="text-xs text-slate-500">Manage how your data is used for anonymous research.</p>
              </div>
              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md">
                Manage
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
