import type { Card } from './types';
import { rankValue } from './card';

export enum HandRank {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

export interface HandResult {
  rank: HandRank;
  values: number[];
  bestCards: Card[];
}

function getCombinations(cards: Card[], size: number): Card[][] {
  if (size === 0) return [[]];
  if (cards.length < size) return [];
  const [first, ...rest] = cards;
  const withFirst = getCombinations(rest, size - 1).map((combo) => [first, ...combo]);
  const withoutFirst = getCombinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

function evaluateFive(cards: Card[]): HandResult {
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  const values = sorted.map((c) => rankValue(c.rank));

  const isFlush = sorted.every((c) => c.suit === sorted[0].suit);

  let isStraight = false;
  let straightHighValue = 0;

  if (values[0] - values[1] === 1 && values[1] - values[2] === 1 && values[2] - values[3] === 1 && values[3] - values[4] === 1) {
    isStraight = true;
    straightHighValue = values[0];
  }

  if (!isStraight && values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    isStraight = true;
    straightHighValue = 5;
  }

  const rankCounts = new Map<number, number>();
  for (const v of values) {
    rankCounts.set(v, (rankCounts.get(v) ?? 0) + 1);
  }
  const counts = [...rankCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  if (isFlush && isStraight) {
    const rank = straightHighValue === 14 ? HandRank.RoyalFlush : HandRank.StraightFlush;
    return { rank, values: [straightHighValue], bestCards: sorted };
  }

  if (counts[0][1] === 4) {
    return { rank: HandRank.FourOfAKind, values: [counts[0][0], counts[1][0]], bestCards: sorted };
  }

  if (counts[0][1] === 3 && counts[1][1] === 2) {
    return { rank: HandRank.FullHouse, values: [counts[0][0], counts[1][0]], bestCards: sorted };
  }

  if (isFlush) {
    return { rank: HandRank.Flush, values, bestCards: sorted };
  }

  if (isStraight) {
    return { rank: HandRank.Straight, values: [straightHighValue], bestCards: sorted };
  }

  if (counts[0][1] === 3) {
    const kickers = counts.filter((c) => c[1] === 1).map((c) => c[0]);
    return { rank: HandRank.ThreeOfAKind, values: [counts[0][0], ...kickers], bestCards: sorted };
  }

  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const pairs = [counts[0][0], counts[1][0]].sort((a, b) => b - a);
    const kicker = counts.find((c) => c[1] === 1)![0];
    return { rank: HandRank.TwoPair, values: [...pairs, kicker], bestCards: sorted };
  }

  if (counts[0][1] === 2) {
    const kickers = counts.filter((c) => c[1] === 1).map((c) => c[0]).sort((a, b) => b - a);
    return { rank: HandRank.OnePair, values: [counts[0][0], ...kickers], bestCards: sorted };
  }

  return { rank: HandRank.HighCard, values, bestCards: sorted };
}

export function evaluateHand(cards: Card[]): HandResult {
  const combos = getCombinations(cards, 5);
  let best: HandResult | null = null;

  for (const combo of combos) {
    const result = evaluateFive(combo);
    if (!best || compareResults(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

function compareResults(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) return a.values[i] - b.values[i];
  }
  return 0;
}

export function compareHands(handA: Card[], handB: Card[]): number {
  const resultA = evaluateHand(handA);
  const resultB = evaluateHand(handB);
  return compareResults(resultA, resultB);
}
