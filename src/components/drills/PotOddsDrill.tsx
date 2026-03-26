import { useState, useCallback } from 'react';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';
import { calculatePotOdds, isCallProfitable } from '../../stats/pot-odds';

interface PotOddsDrillProps { onResult: (correct: boolean) => void; }

function generateScenario() {
  const potSize = Math.round((Math.random() * 200 + 20) / 5) * 5;
  const betSize = Math.round((Math.random() * potSize * 0.8 + 10) / 5) * 5;
  const equity = Math.round(Math.random() * 60 + 10) / 100;
  const potOdds = calculatePotOdds(potSize, betSize);
  const shouldCall = isCallProfitable(equity, potSize, betSize);
  return { potSize, betSize, equity, potOdds, shouldCall };
}

export function PotOddsDrill({ onResult }: PotOddsDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleAction = useCallback((action: 'call' | 'fold') => {
    const correct = (action === 'call' && scenario.shouldCall) || (action === 'fold' && !scenario.shouldCall);
    const potOddsPct = Math.round(scenario.potOdds * 100);
    const equityPct = Math.round(scenario.equity * 100);
    const explanation = scenario.shouldCall
      ? `Your equity (${equityPct}%) exceeds the pot odds (${potOddsPct}%), making this a profitable call.`
      : `Your equity (${equityPct}%) is below the pot odds (${potOddsPct}%), so folding is correct.`;
    setFeedback({ correct, explanation });
    onResult(correct);
  }, [scenario, onResult]);

  const handleNext = () => { setScenario(generateScenario()); setFeedback(null); };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Pot Odds Quiz</h2>
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-400">Pot Size: <span className="text-white font-bold">{scenario.potSize}</span></p>
        <p className="text-sm text-gray-400">Bet to Call: <span className="text-white font-bold">{scenario.betSize}</span></p>
        <p className="text-sm text-gray-400">Your Equity: <span className="text-white font-bold">{Math.round(scenario.equity * 100)}%</span></p>
      </div>
      <p className="text-sm text-gray-400">Should you call or fold?</p>
      {!feedback ? (
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => handleAction('call')}>Call</Button>
          <Button variant="danger" onClick={() => handleAction('fold')}>Fold</Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
