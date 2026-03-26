import { useState, useCallback } from 'react';
import type { Card } from '../../engine/types';
import { createDeck, shuffleDeck, dealCards } from '../../engine/deck';
import { calculateEquity } from '../../stats/equity';
import { CardDisplay } from '../common/Card';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';

interface EquityDrillProps { onResult: (correct: boolean) => void; }

function generateScenario() {
  const deck = shuffleDeck(createDeck());
  const { dealt: hero, remaining: r1 } = dealCards(deck, 2);
  const { dealt: board } = dealCards(r1, 3);
  const holeCards = hero as [Card, Card];
  const equity = calculateEquity(holeCards, board, 500);
  return { holeCards, board, actualEquity: Math.round(equity.win * 100) };
}

export function EquityDrill({ onResult }: EquityDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [guess, setGuess] = useState(50);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleSubmit = useCallback(() => {
    const diff = Math.abs(guess - scenario.actualEquity);
    const correct = diff <= 15;
    const explanation = correct
      ? `Your estimate of ${guess}% was within 15% of the actual equity (${scenario.actualEquity}%).`
      : `Your estimate of ${guess}% was off by ${diff}%. The actual equity was ${scenario.actualEquity}%.`;
    setFeedback({ correct, explanation });
    onResult(correct);
  }, [guess, scenario, onResult]);

  const handleNext = () => { setScenario(generateScenario()); setGuess(50); setFeedback(null); };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Equity Estimation</h2>
      <p className="text-sm text-gray-400">Estimate your equity vs a random hand</p>
      <div className="flex gap-2">
        <CardDisplay card={scenario.holeCards[0]} size="lg" />
        <CardDisplay card={scenario.holeCards[1]} size="lg" />
      </div>
      <div className="flex gap-2">
        {scenario.board.map((card, i) => (<CardDisplay key={i} card={card} size="md" />))}
      </div>
      {!feedback ? (
        <div className="flex flex-col items-center gap-2">
          <input type="range" min={0} max={100} value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-48" />
          <span className="text-lg font-bold">{guess}%</span>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
