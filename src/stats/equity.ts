import type { Card } from '../engine/types';
import { createDeck } from '../engine/deck';
import { evaluateHand, HandRank } from '../engine/hand-eval';

export interface EquityResult {
  win: number;
  tie: number;
  lose: number;
}

export function calculateEquity(holeCards: [Card, Card], communityCards: Card[], iterations: number = 1000): EquityResult {
  const usedCards = [...holeCards, ...communityCards];
  const remainingDeck = createDeck().filter(
    (c) => !usedCards.some((used) => used.rank === c.rank && used.suit === c.suit)
  );

  const cardsNeeded = 5 - communityCards.length;
  let wins = 0, ties = 0, losses = 0;

  for (let i = 0; i < iterations; i++) {
    const shuffled = [...remainingDeck].sort(() => Math.random() - 0.5);
    const futureCards = shuffled.slice(0, cardsNeeded);
    const fullBoard = [...communityCards, ...futureCards];
    const oppCards = shuffled.slice(cardsNeeded, cardsNeeded + 2);

    const ourHand = evaluateHand([...holeCards, ...fullBoard]);
    const oppHand = evaluateHand([...oppCards, ...fullBoard]);

    const cmp = compareResults(ourHand, oppHand);
    if (cmp > 0) wins++;
    else if (cmp === 0) ties++;
    else losses++;
  }

  return { win: wins / iterations, tie: ties / iterations, lose: losses / iterations };
}

function compareResults(a: { rank: HandRank; values: number[] }, b: { rank: HandRank; values: number[] }): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) return a.values[i] - b.values[i];
  }
  return 0;
}
