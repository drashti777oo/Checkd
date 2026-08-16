import { Link } from 'react-router-dom';
import { Activity, Clock, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  // Mock data for dashboard
  const userName = "Jane";
  const recentChecks = [
    { id: 1, date: 'Aug 16, 2026', status: 'Result available', title: 'General Health Check' },
    { id: 2, date: 'Aug 12, 2026', status: 'Result available', title: 'Skin Analysis' },
  ];
  const recommendations = [
    { id: 1, title: 'Increase Water Intake', category: 'Diet', text: 'Based on your recent check, staying hydrated is recommended.' },
    { id: 2, title: 'Monitor Sleep Schedule', category: 'Lifestyle', text: 'Aim for 7-8 hours of consistent sleep.' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good morning, {userName}</h1>
          <p className="text-sm text-slate-600 mt-1">Here's your latest Checkd overview.</p>
        </div>
        <Link
          to="/check"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 w-full sm:w-auto"
        >
          Start New Check
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Latest Check Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Latest Check</h3>
              <p className="text-xs text-slate-500">Aug 16, 2026</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-slate-900">Healthy</p>
            <p className="text-sm text-green-600 font-medium">All clear</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Health Score</h3>
              <p className="text-xs text-slate-500">Overall rating</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-slate-900">92/100</p>
            <p className="text-sm text-indigo-600 font-medium">Top 10%</p>
          </div>
        </div>
        
        {/* Alerts Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Attention Items</h3>
              <p className="text-xs text-slate-500">Needs review</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-semibold text-slate-900">0</p>
            <p className="text-sm text-slate-500 font-medium">No urgent issues</p>
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
              {recentChecks.map((check) => (
                <div key={check.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{check.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{check.date}</span>
                        <span>•</span>
                        <span className="text-green-600 font-medium">{check.status}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/history/${check.id}`} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    View <ArrowRight className="inline ml-1 h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Area: Recommendations */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Next Steps</h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 mb-2">
                  {rec.category}
                </div>
                <h3 className="font-medium text-slate-900">{rec.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
