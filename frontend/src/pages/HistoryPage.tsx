import { Clock, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const history = [
    { id: 1, date: 'August 16, 2026', time: '10:30 AM', status: 'Healthy', type: 'General Check' },
    { id: 2, date: 'August 12, 2026', time: '09:15 AM', status: 'Healthy', type: 'Skin Analysis' },
    { id: 3, date: 'July 28, 2026', time: '02:45 PM', status: 'Attention Needed', type: 'General Check' },
    { id: 4, date: 'June 15, 2026', time: '11:00 AM', status: 'Healthy', type: 'General Check' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Check History</h1>
        <p className="text-sm text-slate-600 mt-1">Review your past health checks and track your progress over time.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Date & Time</div>
          <div className="col-span-3">Check Type</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-slate-100">
          {history.map((item) => (
            <Link 
              key={item.id} 
              to={`/history/${item.id}`}
              className="block hover:bg-slate-50 transition-colors"
            >
              <div className="p-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center">
                {/* Mobile: Top Row, Desktop: Col 1 */}
                <div className="col-span-4 flex items-center gap-3 mb-2 sm:mb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.date}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>

                {/* Mobile: Middle Row, Desktop: Col 2 & 3 */}
                <div className="col-span-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-0">
                  <div className="sm:w-1/2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500 sm:hidden" />
                    <span className="text-sm text-slate-600">{item.type}</span>
                  </div>
                  <div className="sm:w-1/2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === 'Healthy' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Mobile: Bottom Row, Desktop: Col 4 */}
                <div className="col-span-2 flex items-center justify-end sm:justify-end">
                  <span className="text-sm font-medium text-blue-600 flex items-center">
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
