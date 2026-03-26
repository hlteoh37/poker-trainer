import { useState, useCallback } from 'react';
import type { Position, Card } from '../../engine/types';
import { createDeck, shuffleDeck, dealCards } from '../../engine/deck';
import { rankValue } from '../../engine/card';
import { isInOpeningRange } from '../../data/preflop-ranges';
import { CardDisplay } from '../common/Card';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';

interface PreflopDrillProps { onResult: (correct: boolean) => void; }

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

function handToNotation(cards: [Card, Card]): string {
  const r1 = rankValue(cards[0].rank);
  const r2 = rankValue(cards[1].rank);
  const high = r1 >= r2 ? cards[0] : cards[1];
  const low = r1 >= r2 ? cards[1] : cards[0];
  const rankStr = (r: Card) => r.rank === '10' ? 'T' : r.rank;
  if (high.rank === low.rank) return `${rankStr(high)}${rankStr(low)}`;
  const suited = high.suit === low.suit ? 's' : 'o';
  return `${rankStr(high)}${rankStr(low)}${suited}`;
}

function generateScenario() {
  const deck = shuffleDeck(createDeck());
  const { dealt } = dealCards(deck, 2);
  const holeCards = dealt as [Card, Card];
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const notation = handToNotation(holeCards);
  const shouldOpen = isInOpeningRange(notation, position);
  return { holeCards, position, notation, shouldOpen };
}

export function PreflopDrill({ onResult }: PreflopDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleAction = useCallback((action: 'open' | 'fold') => {
    const correct = (action === 'open' && scenario.shouldOpen) || (action === 'fold' && !scenario.shouldOpen);
    const explanation = scenario.shouldOpen
      ? `${scenario.notation} is in the standard opening range from ${scenario.position}.`
      : `${scenario.notation} is not in the standard opening range from ${scenario.position}. Fold and wait for a better spot.`;
    setFeedback({ correct, explanation });
    onResult(correct);
  }, [scenario, onResult]);

  const handleNext = () => { setScenario(generateScenario()); setFeedback(null); };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Preflop Trainer</h2>
      <p className="text-sm text-gray-400">Position: <span className="text-white font-bold">{scenario.position}</span></p>
      <div className="flex gap-2">
        <CardDisplay card={scenario.holeCards[0]} size="lg" />
        <CardDisplay card={scenario.holeCards[1]} size="lg" />
      </div>
      <p className="text-sm text-gray-400">Action is on you. Open or fold?</p>
      {!feedback ? (
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => handleAction('open')}>Open</Button>
          <Button variant="danger" onClick={() => handleAction('fold')}>Fold</Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
