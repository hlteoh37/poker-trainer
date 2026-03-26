import type { PlayerAction } from '../../engine/types';

interface RecommendationProps { action: PlayerAction; explanation: string; }

export function Recommendation({ action, explanation }: RecommendationProps) {
  const colorClass = action.type === 'fold' ? 'text-red-400' : action.type === 'raise' ? 'text-yellow-400' : 'text-green-400';
  return (
    <div className="bg-gray-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-400">Recommended</span>
        <span className={`text-sm font-bold ${colorClass} capitalize`}>{action.type}</span>
        {action.amount && <span className={`text-sm ${colorClass}`}>({action.amount})</span>}
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{explanation}</p>
    </div>
  );
}
