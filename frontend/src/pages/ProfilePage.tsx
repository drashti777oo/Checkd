import { User, Mail, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  // Mock user data
  const user = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    memberSince: 'August 2026'
  };

  const handleLogout = () => {
    // Perform logout actions...
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile & Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your account settings and privacy preferences.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-3xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-slate-600">{user.email}</p>
          <p className="text-xs text-slate-500 mt-1">Member since {user.memberSince}</p>
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
              <span className="text-sm text-slate-900">{user.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm font-medium text-slate-500">Email</span>
              <span className="text-sm text-slate-900">{user.email}</span>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500 mt-2">
              Edit Details
            </button>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 text-red-600">Delete Data</p>
                <p className="text-xs text-slate-500">Permanently delete your health history and account.</p>
              </div>
              <button className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md">
                Delete
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
