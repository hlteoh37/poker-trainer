import { useState } from 'react';
import type { CoachingAdvice } from '../../stats/types';
import { EquityDisplay } from './EquityDisplay';
import { EvDisplay } from './EvDisplay';
import { Glossary } from './Glossary';

interface CoachBannerProps { advice: CoachingAdvice | null; }

export function CoachBanner({ advice }: CoachBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!advice) {
    return (
      <div className="bg-gray-800 border-t border-gray-700 px-3 py-2 text-center text-xs text-gray-500">
        Coach: Waiting for your turn...
      </div>
    );
  }

  const actionColor = advice.recommendedAction.type === 'fold'
    ? 'text-red-400' : advice.recommendedAction.type === 'raise'
    ? 'text-yellow-400' : 'text-green-400';

  const eqPct = Math.round(advice.equity * 100);

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      {/* Banner — always visible */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center gap-3 text-left">
        <span className={`text-sm font-bold capitalize ${actionColor}`}>
          {advice.recommendedAction.type}
        </span>
        <span className="text-xs text-gray-300 flex-1 truncate">{advice.explanation}</span>
        <span className="text-xs text-gray-400 whitespace-nowrap">{eqPct}% eq</span>
        <span className="text-gray-500 text-xs">{expanded ? '▾' : '▸'}</span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-gray-700 pt-2 max-h-[40vh] overflow-y-auto">
          <EquityDisplay equity={advice.equity} />
          {advice.potOdds > 0 && (
            <div className="text-xs text-gray-400">Pot Odds: {Math.round(advice.potOdds * 100)}%</div>
          )}
          <EvDisplay actionEVs={advice.actionEVs} />
          <Glossary />
        </div>
      )}
    </div>
  );
}
