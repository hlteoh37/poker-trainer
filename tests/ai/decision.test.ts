import { describe, it, expect } from 'vitest';
import { makeAIDecision } from '../../src/ai/decision';
import { createGame, startHand } from '../../src/engine/game';

describe('makeAIDecision', () => {
  it('returns a valid action type', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.currentPlayerIndex = 1;
    const action = makeAIDecision(state, { archetype: 'TAG', difficulty: 'beginner' });
    expect(['fold', 'check', 'call', 'raise', 'all-in']).toContain(action.type);
  });

  it('never returns an invalid action', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.currentPlayerIndex = 1;
    for (let i = 0; i < 50; i++) {
      const action = makeAIDecision(state, { archetype: 'LAG', difficulty: 'intermediate' });
      expect(['fold', 'check', 'call', 'raise', 'all-in']).toContain(action.type);
    }
  });
});
