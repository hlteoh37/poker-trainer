import { describe, it, expect } from 'vitest';
import { estimateRange, type RangeEntry } from '../../src/stats/range';

describe('estimateRange', () => {
  it('returns a narrower range after a raise than after a limp', () => {
    const raiseRange = estimateRange({ position: 'UTG', actions: [{ type: 'raise', amount: 30 }], difficulty: 'intermediate' });
    const limpRange = estimateRange({ position: 'UTG', actions: [{ type: 'call' }], difficulty: 'intermediate' });
    expect(raiseRange.length).toBeLessThan(limpRange.length);
  });

  it('returns entries with hand labels and weights', () => {
    const range = estimateRange({ position: 'BTN', actions: [{ type: 'raise', amount: 25 }], difficulty: 'beginner' });
    expect(range.length).toBeGreaterThan(0);
    range.forEach((entry: RangeEntry) => {
      expect(entry.hand).toBeDefined();
      expect(entry.weight).toBeGreaterThan(0);
      expect(entry.weight).toBeLessThanOrEqual(1);
    });
  });
});
