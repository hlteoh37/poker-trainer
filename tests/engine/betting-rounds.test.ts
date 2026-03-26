import { describe, it, expect } from 'vitest';
import { applyAction, getValidActions } from '../../src/engine/betting';
import { createGame, startHand, advanceToNextPlayer, isRoundComplete, advanceRound } from '../../src/engine/game';
import type { GameState } from '../../src/engine/types';

function setupPostflopState(): GameState {
  const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
  let state = startHand(game);
  // Simulate preflop: both players call/check to reach flop
  state.players.forEach((p) => { p.currentBet = 10; p.hasActedThisRound = true; p.chips = 990; });
  state.pot = 20;
  state = advanceRound(state); // flop
  return state;
}

describe('betting round flow', () => {
  it('does not skip players when first player checks postflop', () => {
    let state = setupPostflopState();
    const firstPlayer = state.currentPlayerIndex;

    // First player checks
    state = applyAction(state, { type: 'check' });
    state = advanceToNextPlayer(state);

    // Round should NOT be complete — second player hasn't acted
    expect(isRoundComplete(state)).toBe(false);
    expect(state.currentPlayerIndex).not.toBe(firstPlayer);
  });

  it('completes round after all players check', () => {
    let state = setupPostflopState();

    // Player 1 checks
    state = applyAction(state, { type: 'check' });
    state = advanceToNextPlayer(state);
    expect(isRoundComplete(state)).toBe(false);

    // Player 2 checks
    state = applyAction(state, { type: 'check' });
    state = advanceToNextPlayer(state);
    expect(isRoundComplete(state)).toBe(true);
  });

  it('does not complete round when raise requires opponent to act again', () => {
    let state = setupPostflopState();

    // Player 1 raises
    state = applyAction(state, { type: 'raise', amount: 20 });
    state = advanceToNextPlayer(state);

    // Round NOT complete — opponent needs to respond to raise
    expect(isRoundComplete(state)).toBe(false);
  });

  it('completes round after raise is called', () => {
    let state = setupPostflopState();

    // Player 1 raises
    state = applyAction(state, { type: 'raise', amount: 20 });
    state = advanceToNextPlayer(state);
    expect(isRoundComplete(state)).toBe(false);

    // Player 2 calls
    state = applyAction(state, { type: 'call' });
    state = advanceToNextPlayer(state);
    expect(isRoundComplete(state)).toBe(true);
  });

  it('reopens action on re-raise', () => {
    let state = setupPostflopState();

    // Player 1 raises to 20
    state = applyAction(state, { type: 'raise', amount: 20 });
    state = advanceToNextPlayer(state);

    // Player 2 re-raises to 50
    state = applyAction(state, { type: 'raise', amount: 50 });
    state = advanceToNextPlayer(state);

    // Round NOT complete — player 1 needs to respond to re-raise
    expect(isRoundComplete(state)).toBe(false);

    // Player 1 calls
    state = applyAction(state, { type: 'call' });
    state = advanceToNextPlayer(state);
    expect(isRoundComplete(state)).toBe(true);
  });

  it('preserves pot across multiple streets', () => {
    let state = setupPostflopState();
    const initialPot = state.pot;

    // Flop: both raise and call
    state = applyAction(state, { type: 'raise', amount: 20 });
    state = advanceToNextPlayer(state);
    state = applyAction(state, { type: 'call' });
    state = advanceToNextPlayer(state);

    expect(isRoundComplete(state)).toBe(true);
    expect(state.pot).toBe(initialPot + 40); // 20 from each player

    // Advance to turn
    state = advanceRound(state);
    expect(state.currentBettingRound).toBe('turn');
    expect(state.pot).toBe(initialPot + 40); // pot preserved
    expect(state.players.every((p) => p.currentBet === 0)).toBe(true); // bets reset
    expect(state.players.every((p) => !p.hasActedThisRound)).toBe(true); // action flags reset
  });

  it('fold leaves correct pot and winner gets chips', () => {
    let state = setupPostflopState();

    // Player 1 raises
    state = applyAction(state, { type: 'raise', amount: 20 });
    state = advanceToNextPlayer(state);

    // Player 2 folds
    state = applyAction(state, { type: 'fold' });

    const activePlayers = state.players.filter((p) => !p.hasFolded);
    expect(activePlayers).toHaveLength(1);
    expect(state.pot).toBe(40); // 20 initial + 20 raise
  });
});
