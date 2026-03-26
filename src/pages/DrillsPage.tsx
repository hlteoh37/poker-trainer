import { useState, useCallback } from 'react';
import { useStatsStore } from '../stores/stats-store';
import { DrillSelector } from '../components/drills/DrillSelector';
import { PreflopDrill } from '../components/drills/PreflopDrill';
import { PotOddsDrill } from '../components/drills/PotOddsDrill';
import { EquityDrill } from '../components/drills/EquityDrill';
import { PostflopDrill } from '../components/drills/PostflopDrill';

type DrillType = 'preflop' | 'potOdds' | 'equity' | 'postflop';

export function DrillsPage() {
  const [activeDrill, setActiveDrill] = useState<DrillType | null>(null);
  const { addDrillResult, getAccuracy } = useStatsStore();

  const handleResult = useCallback(
    (drillType: DrillType) => (correct: boolean) => {
      addDrillResult({ drillType, correct, timestamp: Date.now() });
    },
    [addDrillResult],
  );

  const accuracies: Record<DrillType, number> = {
    preflop: getAccuracy('preflop'), potOdds: getAccuracy('potOdds'),
    equity: getAccuracy('equity'), postflop: getAccuracy('postflop'),
  };

  if (!activeDrill) {
    return (
      <div>
        <h1 className="text-xl font-bold p-4">Training Drills</h1>
        <DrillSelector onSelect={setActiveDrill} accuracies={accuracies} />
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setActiveDrill(null)} className="text-sm text-gray-400 hover:text-white p-4">&larr; Back to Drills</button>
      {activeDrill === 'preflop' && <PreflopDrill onResult={handleResult('preflop')} />}
      {activeDrill === 'potOdds' && <PotOddsDrill onResult={handleResult('potOdds')} />}
      {activeDrill === 'equity' && <EquityDrill onResult={handleResult('equity')} />}
      {activeDrill === 'postflop' && <PostflopDrill onResult={handleResult('postflop')} />}
    </div>
  );
}
