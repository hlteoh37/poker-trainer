import type { CoachingAdvice } from '../../stats/types';
import { EquityDisplay } from './EquityDisplay';
import { EvDisplay } from './EvDisplay';
import { Recommendation } from './Recommendation';

interface CoachingPanelProps { advice: CoachingAdvice | null; visible: boolean; onToggle: () => void; }

export function CoachingPanel({ advice, visible, onToggle }: CoachingPanelProps) {
  if (!advice) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 md:static md:w-72 z-40">
      <button onClick={onToggle} className="w-full bg-gray-800 text-gray-400 text-xs py-1 text-center md:hidden">
        {visible ? 'Hide Coaching' : 'Show Coaching'}
      </button>
      {visible && (
        <div className="bg-gray-800 border-t border-gray-700 md:border md:rounded-lg p-4 flex flex-col gap-3">
          <Recommendation action={advice.recommendedAction} explanation={advice.explanation} />
          <EquityDisplay equity={advice.equity} />
          {advice.potOdds > 0 && <div className="text-xs text-gray-400">Pot Odds: {Math.round(advice.potOdds * 100)}%</div>}
          <EvDisplay actionEVs={advice.actionEVs} />
        </div>
      )}
    </div>
  );
}
