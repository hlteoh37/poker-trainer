import { useState, useCallback } from 'react';
import type { Card } from '../../engine/types';
import { createDeck, shuffleDeck, dealCards } from '../../engine/deck';
import { calculateEquity } from '../../stats/equity';
import { calculateCallEV, calculateFoldEV, calculateRaiseEV } from '../../stats/ev';
import { CardDisplay } from '../common/Card';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';

interface PostflopDrillProps { onResult: (correct: boolean) => void; }
type DrillAction = 'fold' | 'call' | 'raise';

function generateScenario() {
  const deck = shuffleDeck(createDeck());
  const { dealt: hero, remaining: r1 } = dealCards(deck, 2);
  const { dealt: board } = dealCards(r1, 3);
  const holeCards = hero as [Card, Card];
  const potSize = Math.round((Math.random() * 150 + 30) / 5) * 5;
  const betSize = Math.round((Math.random() * potSize * 0.7 + 10) / 5) * 5;
  const equity = calculateEquity(holeCards, board, 500);
  const eqWin = equity.win;
  const foldEV = calculateFoldEV();
  const callEV = calculateCallEV(eqWin, potSize, betSize);
  const raiseEV = calculateRaiseEV(eqWin, potSize, betSize * 2.5, 0.3);
  const evs: Record<DrillAction, number> = { fold: foldEV, call: callEV, raise: raiseEV };
  const bestAction = (Object.entries(evs) as [DrillAction, number][]).sort((a, b) => b[1] - a[1])[0][0];
  return { holeCards, board, potSize, betSize, equity: eqWin, evs, bestAction };
}

export function PostflopDrill({ onResult }: PostflopDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleAction = useCallback((action: DrillAction) => {
    const correct = action === scenario.bestAction;
    const evStr = Object.entries(scenario.evs).map(([a, ev]) => `${a}: ${ev >= 0 ? '+' : ''}${ev.toFixed(1)}`).join(', ');
    const explanation = correct
      ? `Correct! ${action} has the highest EV. EVs: ${evStr}`
      : `The best play was ${scenario.bestAction}. EVs: ${evStr}`;
    setFeedback({ correct, explanation });
    onResult(correct);
  }, [scenario, onResult]);

  const handleNext = () => { setScenario(generateScenario()); setFeedback(null); };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Postflop Scenario</h2>
      <div className="flex gap-2">
        <CardDisplay card={scenario.holeCards[0]} size="lg" />
        <CardDisplay card={scenario.holeCards[1]} size="lg" />
      </div>
      <div className="flex gap-2">
        {scenario.board.map((card, i) => (<CardDisplay key={i} card={card} size="md" />))}
      </div>
      <div className="bg-gray-800 rounded-lg p-3 text-center text-sm">
        <p className="text-gray-400">Pot: <span className="text-white font-bold">{scenario.potSize}</span></p>
        <p className="text-gray-400">Opponent bets: <span className="text-white font-bold">{scenario.betSize}</span></p>
      </div>
      {!feedback ? (
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => handleAction('fold')}>Fold</Button>
          <Button variant="secondary" onClick={() => handleAction('call')}>Call</Button>
          <Button variant="primary" onClick={() => handleAction('raise')}>Raise</Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
