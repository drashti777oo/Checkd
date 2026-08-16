import { CheckCircle2, XCircle, RotateCcw, Sparkles, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  priority?: string; // 'high' | 'medium' | 'low'
  description?: string;
  explanation?: string;
  action?: string;
  rationale?: string;
  status?: 'active' | 'dismissed' | 'completed' | string;
}

interface RecommendationCardProps {
  recommendation: RecommendationItem;
  onStatusChange?: (id: string, newStatus: 'active' | 'dismissed' | 'completed') => void;
}

export default function RecommendationCard({ recommendation, onStatusChange }: RecommendationCardProps) {
  const isCompleted = recommendation.status === 'completed';
  const isDismissed = recommendation.status === 'dismissed';
  const priority = recommendation.priority?.toLowerCase() || 'medium';

  const priorityColor = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-50 text-slate-700 border-slate-200',
  }[priority] || 'bg-amber-50 text-amber-700 border-amber-200';

  const actionText = recommendation.action || recommendation.description || recommendation.explanation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 transition-all shadow-2xs ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/40 opacity-90'
          : isDismissed
          ? 'border-slate-200 bg-slate-50/60 opacity-60'
          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Badges & Actions Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-100 uppercase tracking-wide">
            <Tag className="h-3 w-3" />
            {recommendation.category}
          </span>
          {recommendation.priority && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${priorityColor}`}>
              {priority} priority
            </span>
          )}
        </div>

        {onStatusChange && (
          <div className="flex items-center gap-1.5">
            {isCompleted ? (
              <button
                type="button"
                onClick={() => onStatusChange(recommendation.id, 'active')}
                title="Mark as active"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo
              </button>
            ) : isDismissed ? (
              <button
                type="button"
                onClick={() => onStatusChange(recommendation.id, 'active')}
                title="Restore recommendation"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-300 px-2.5 py-1 rounded-lg transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onStatusChange(recommendation.id, 'completed')}
                  title="Mark completed"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange(recommendation.id, 'dismissed')}
                  title="Dismiss recommendation"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Dismiss
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-sm font-bold text-[#0f172a] ${isCompleted ? 'line-through text-slate-500' : ''}`}>
        {recommendation.title}
      </h3>

      {/* Description / Action */}
      {actionText && (
        <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
          {actionText}
        </p>
      )}

      {/* Rationale */}
      {recommendation.rationale && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span className="leading-snug">{recommendation.rationale}</span>
        </div>
      )}
    </motion.div>
  );
}

