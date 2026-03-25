import { describe, it, expect } from 'vitest';
import { calculateHandStrength } from '../../src/ai/hand-strength';
import { createCard } from '../../src/engine/card';
import type { Card } from '../../src/engine/types';

describe('calculateHandStrength', () => {
  it('rates pocket aces as very strong preflop', () => {
    const holeCards = [createCard('hearts', 'A'), createCard('spades', 'A')] as [Card, Card];
    const strength = calculateHandStrength(holeCards, []);
    expect(strength).toBeGreaterThan(0.8);
  });

  it('rates 7-2 offsuit as very weak preflop', () => {
    const holeCards = [createCard('hearts', '7'), createCard('spades', '2')] as [Card, Card];
    const strength = calculateHandStrength(holeCards, []);
    expect(strength).toBeLessThan(0.4);
  });

  it('returns strength between 0 and 1', () => {
    const holeCards = [createCard('hearts', 'K'), createCard('diamonds', 'Q')] as [Card, Card];
    const strength = calculateHandStrength(holeCards, []);
    expect(strength).toBeGreaterThanOrEqual(0);
    expect(strength).toBeLessThanOrEqual(1);
  });

  it('evaluates postflop hand strength with community cards', () => {
    const holeCards = [createCard('hearts', 'A'), createCard('hearts', 'K')] as [Card, Card];
    const community = [createCard('hearts', 'Q'), createCard('hearts', 'J'), createCard('hearts', '10')];
    const strength = calculateHandStrength(holeCards, community);
    expect(strength).toBeGreaterThan(0.95);
  });
});
