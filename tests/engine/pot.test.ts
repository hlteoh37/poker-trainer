import { describe, it, expect } from 'vitest';
import { calculateSidePots } from '../../src/engine/pot';
import type { Player } from '../../src/engine/types';
import { createCard } from '../../src/engine/card';

function makePlayer(id: string, currentBet: number, isAllIn: boolean, hasFolded = false): Player {
  return {
    id, name: id, chips: isAllIn ? 0 : 1000,
    holeCards: [createCard('hearts', 'A'), createCard('spades', 'K')],
    position: 'BTN', currentBet, hasFolded, isAllIn, isHuman: false,
  };
}

describe('calculateSidePots', () => {
  it('returns single pot when no all-ins', () => {
    const players = [makePlayer('p1', 100, false), makePlayer('p2', 100, false), makePlayer('p3', 100, false)];
    const pots = calculateSidePots(players);
    expect(pots).toEqual([{ amount: 300, eligiblePlayerIds: ['p1', 'p2', 'p3'] }]);
  });

  it('creates side pot when player is all-in for less', () => {
    const players = [makePlayer('p1', 50, true), makePlayer('p2', 100, false), makePlayer('p3', 100, false)];
    const pots = calculateSidePots(players);
    expect(pots).toHaveLength(2);
    expect(pots[0]).toEqual({ amount: 150, eligiblePlayerIds: ['p1', 'p2', 'p3'] });
    expect(pots[1]).toEqual({ amount: 100, eligiblePlayerIds: ['p2', 'p3'] });
  });

  it('excludes folded players from pot eligibility', () => {
    const players = [makePlayer('p1', 50, false, true), makePlayer('p2', 100, false), makePlayer('p3', 100, false)];
    const pots = calculateSidePots(players);
    expect(pots).toEqual([{ amount: 250, eligiblePlayerIds: ['p2', 'p3'] }]);
  });
});
