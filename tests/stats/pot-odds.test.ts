import { describe, it, expect } from 'vitest';
import { calculatePotOdds, isCallProfitable } from '../../src/stats/pot-odds';

describe('calculatePotOdds', () => {
  it('calculates pot odds as a percentage', () => {
    const odds = calculatePotOdds(100, 50);
    expect(odds).toBeCloseTo(0.333, 2);
  });

  it('returns 0 when cost to call is 0', () => {
    expect(calculatePotOdds(100, 0)).toBe(0);
  });
});

describe('isCallProfitable', () => {
  it('returns true when equity exceeds pot odds', () => {
    expect(isCallProfitable(0.4, 100, 50)).toBe(true);
  });

  it('returns false when equity is below pot odds', () => {
    expect(isCallProfitable(0.2, 100, 50)).toBe(false);
  });
});
