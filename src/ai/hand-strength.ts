import type { Card } from '../engine/types';
import { rankValue } from '../engine/card';
import { evaluateHand, HandRank } from '../engine/hand-eval';
import { createDeck } from '../engine/deck';

export function calculateHandStrength(holeCards: [Card, Card], communityCards: Card[]): number {
  if (communityCards.length === 0) {
    return preflopStrength(holeCards);
  }
  return postflopStrength(holeCards, communityCards);
}

function preflopStrength(holeCards: [Card, Card]): number {
  const [c1, c2] = holeCards;
  const r1 = rankValue(c1.rank);
  const r2 = rankValue(c2.rank);
  const high = Math.max(r1, r2);
  const low = Math.min(r1, r2);
  const isPair = r1 === r2;
  const isSuited = c1.suit === c2.suit;
  const gap = high - low;

  let score = 0;
  score += (high - 2) / 12 * 0.3;
  if (isPair) {
    score += 0.3 + (high - 2) / 12 * 0.2;
  } else {
    score += (low - 2) / 12 * 0.15;
  }
  if (isSuited) score += 0.05;
  if (gap <= 2) score += 0.05;
  if (gap === 1) score += 0.03;

  return Math.min(1, Math.max(0, score));
}

function postflopStrength(holeCards: [Card, Card], communityCards: Card[]): number {
  const allCards = [...holeCards, ...communityCards];
  const ourResult = evaluateHand(allCards);
  const deck = createDeck().filter(
    (c) => !allCards.some((ac) => ac.rank === c.rank && ac.suit === c.suit)
  );

  const iterations = 200;
  let wins = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    const oppHole = shuffled.slice(0, 2);
    const oppCards = [...oppHole, ...communityCards];
    const oppResult = evaluateHand(oppCards);

    const cmp = compareResults(ourResult, oppResult);
    if (cmp > 0) wins++;
    else if (cmp === 0) ties++;
  }

  return (wins + ties * 0.5) / iterations;
}

function compareResults(a: { rank: HandRank; values: number[] }, b: { rank: HandRank; values: number[] }): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) return a.values[i] - b.values[i];
  }
  return 0;
}
