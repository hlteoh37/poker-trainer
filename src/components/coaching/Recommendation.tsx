import type { PlayerAction } from '../../engine/types';

interface RecommendationProps { action: PlayerAction; explanation: string; }

export function Recommendation({ action, explanation }: RecommendationProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-400">Recommended</span>
        <span className="text-sm font-bold text-green-400 capitalize">{action.type}</span>
        {action.amount && <span className="text-sm text-green-400">({action.amount})</span>}
      </div>
      <p className="text-xs text-gray-300">{explanation}</p>
    </div>
  );
}
