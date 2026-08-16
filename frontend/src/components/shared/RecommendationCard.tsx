interface Recommendation {
  id: number;
  title: string;
  category: string;
  explanation: string;
}

export default function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 mb-3">
        {recommendation.category}
      </div>
      <h3 className="font-semibold text-slate-900">{recommendation.title}</h3>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
        {recommendation.explanation}
      </p>
    </div>
  );
}
