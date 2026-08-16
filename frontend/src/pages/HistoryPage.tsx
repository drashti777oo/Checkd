import { Clock, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHealthData } from '../hooks/useHealthData';

export default function HistoryPage() {
  const { records, loading, error } = useHealthData();

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
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading check history...</div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-600">{error}</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No past health checks found.</div>
          ) : (
            records.map((item) => {
              const recordDate = new Date(item.created_at);
              const formattedDate = recordDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              const formattedTime = recordDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const displayType = item.record_type === 'vitals' ? 'Vitals Check' : 'General Check';

              return (
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
                        <p className="font-medium text-slate-900">{formattedDate}</p>
                        <p className="text-xs text-slate-500">{formattedTime}</p>
                      </div>
                    </div>

                    {/* Mobile: Middle Row, Desktop: Col 2 & 3 */}
                    <div className="col-span-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-0">
                      <div className="sm:w-1/2 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500 sm:hidden" />
                        <span className="text-sm text-slate-600">{displayType}</span>
                      </div>
                      <div className="sm:w-1/2">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                          Healthy
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
