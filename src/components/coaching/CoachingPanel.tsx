import type { CoachingAdvice } from '../../stats/types';
import { EquityDisplay } from './EquityDisplay';
import { EvDisplay } from './EvDisplay';
import { Recommendation } from './Recommendation';
import { Glossary } from './Glossary';

interface CoachingPanelProps { advice: CoachingAdvice | null; visible: boolean; onToggle: () => void; }

export function CoachingPanel({ advice, visible, onToggle }: CoachingPanelProps) {
  return (
    <div className="w-full md:w-72">
      <button onClick={onToggle} className="w-full bg-gray-800 text-gray-400 text-xs py-1 text-center md:hidden rounded-t-lg">
        {visible ? '▾ Hide Coaching' : '▸ Show Coaching'}
      </button>
      {visible && (
        <div className="bg-gray-800 border border-gray-700 md:rounded-lg rounded-b-lg p-3 md:p-4 flex flex-col gap-2 md:gap-3">
          {advice ? (
            <>
              <Recommendation action={advice.recommendedAction} explanation={advice.explanation} />
              <EquityDisplay equity={advice.equity} />
              {advice.potOdds > 0 && <div className="text-xs text-gray-400">Pot Odds: {Math.round(advice.potOdds * 100)}%</div>}
              <EvDisplay actionEVs={advice.actionEVs} />
            </>
          ) : (
            <div className="text-xs text-gray-500 text-center py-2">Waiting for your turn...</div>
          )}
          <Glossary />
        </div>
      )}
    </div>
  );
}
