import { describe, it, expect } from 'vitest';
import { calculateCallEV, calculateFoldEV, calculateRaiseEV } from '../../src/stats/ev';

describe('calculateFoldEV', () => {
  it('is always 0', () => { expect(calculateFoldEV()).toBe(0); });
});

describe('calculateCallEV', () => {
  it('calculates expected value of calling', () => {
    const ev = calculateCallEV(0.4, 100, 50);
    expect(ev).toBeCloseTo(10, 1);
  });

  it('returns negative EV for bad calls', () => {
    const ev = calculateCallEV(0.1, 100, 50);
    expect(ev).toBeLessThan(0);
  });
});

describe('calculateRaiseEV', () => {
  it('accounts for fold equity', () => {
    const ev = calculateRaiseEV(0.5, 100, 100, 0.3);
    expect(ev).toBeGreaterThan(0);
  });
});
