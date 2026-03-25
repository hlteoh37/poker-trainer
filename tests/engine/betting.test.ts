import { describe, it, expect } from 'vitest';
import { getValidActions, applyAction } from '../../src/engine/betting';
import type { GameState, Player } from '../../src/engine/types';
import { createCard } from '../../src/engine/card';

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Player 1', chips: 1000,
    holeCards: [createCard('hearts', 'A'), createCard('spades', 'K')],
    position: 'BTN', currentBet: 0, hasFolded: false, isAllIn: false, isHuman: true,
    ...overrides,
  };
}

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [
      makePlayer({ id: 'p1', position: 'SB', currentBet: 5, chips: 995 }),
      makePlayer({ id: 'p2', position: 'BB', currentBet: 10, chips: 990, isHuman: false }),
      makePlayer({ id: 'p3', position: 'BTN', chips: 1000, isHuman: false }),
    ],
    communityCards: [], pot: 15, sidePots: [], currentBettingRound: 'preflop',
    currentPlayerIndex: 2, dealerIndex: 2, deck: [], smallBlind: 5, bigBlind: 10,
    isHandComplete: false, winners: [],
    ...overrides,
  };
}

describe('getValidActions', () => {
  it('allows fold, call, raise when facing a bet', () => {
    const state = makeGameState();
    const actions = getValidActions(state);
    const types = actions.map((a) => a.type);
    expect(types).toContain('fold');
    expect(types).toContain('call');
    expect(types).toContain('raise');
  });

  it('allows check when no bet to call', () => {
    const state = makeGameState({
      currentBettingRound: 'flop',
      players: [
        makePlayer({ id: 'p1', position: 'SB', currentBet: 0 }),
        makePlayer({ id: 'p2', position: 'BB', currentBet: 0, isHuman: false }),
      ],
      currentPlayerIndex: 0, pot: 20,
    });
    const actions = getValidActions(state);
    const types = actions.map((a) => a.type);
    expect(types).toContain('check');
    expect(types).not.toContain('call');
  });

  it('includes all-in when raise would exceed chips', () => {
    const state = makeGameState({
      players: [
        makePlayer({ id: 'p1', position: 'SB', currentBet: 0, chips: 15 }),
        makePlayer({ id: 'p2', position: 'BB', currentBet: 10, chips: 990, isHuman: false }),
      ],
      currentPlayerIndex: 0, pot: 10,
    });
    const actions = getValidActions(state);
    const types = actions.map((a) => a.type);
    expect(types).toContain('all-in');
  });
});

describe('applyAction', () => {
  it('fold marks player as folded', () => {
    const state = makeGameState();
    const next = applyAction(state, { type: 'fold' });
    expect(next.players[2].hasFolded).toBe(true);
  });

  it('call matches the current highest bet', () => {
    const state = makeGameState();
    const next = applyAction(state, { type: 'call' });
    expect(next.players[2].currentBet).toBe(10);
    expect(next.players[2].chips).toBe(990);
    expect(next.pot).toBe(25);
  });

  it('raise increases the bet', () => {
    const state = makeGameState();
    const next = applyAction(state, { type: 'raise', amount: 30 });
    expect(next.players[2].currentBet).toBe(30);
    expect(next.players[2].chips).toBe(970);
    expect(next.pot).toBe(45);
  });
});
