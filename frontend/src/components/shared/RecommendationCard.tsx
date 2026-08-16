import { Check, X } from 'lucide-react';

interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  explanation?: string;
  action?: string;
  rationale?: string;
  status?: string;
}

interface RecommendationCardProps {
  recommendation: RecommendationItem;
  onStatusChange?: (id: string, newStatus: 'active' | 'dismissed' | 'completed') => void;
}

export default function RecommendationCard({ recommendation, onStatusChange }: RecommendationCardProps) {
  const isCompleted = recommendation.status === 'completed';
  const isDismissed = recommendation.status === 'dismissed';

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
      isCompleted ? 'border-green-200 bg-green-50/30' : isDismissed ? 'border-slate-200 opacity-60' : 'border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {recommendation.category}
        </div>
        {onStatusChange && recommendation.status && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onStatusChange(recommendation.id, isCompleted ? 'active' : 'completed')}
              title={isCompleted ? 'Mark active' : 'Mark completed'}
              className={`p-1 rounded hover:bg-slate-100 ${isCompleted ? 'text-green-600' : 'text-slate-400 hover:text-green-600'}`}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => onStatusChange(recommendation.id, isDismissed ? 'active' : 'dismissed')}
              title={isDismissed ? 'Restore' : 'Dismiss'}
              className={`p-1 rounded hover:bg-slate-100 ${isDismissed ? 'text-amber-600' : 'text-slate-400 hover:text-red-500'}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <h3 className={`font-semibold text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
        {recommendation.title}
      </h3>

      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        {recommendation.description || recommendation.action || recommendation.explanation}
      </p>

      {recommendation.rationale && (
        <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-100 pt-2">
          {recommendation.rationale}
        </p>
      )}
    </div>
  );
}
