import { describe, it, expect } from 'vitest';
import { createGame, startHand, advanceToNextPlayer, isRoundComplete, advanceRound } from '../../src/engine/game';

describe('createGame', () => {
  it('creates a game with specified number of players', () => {
    const state = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    expect(state.players).toHaveLength(3);
    expect(state.players[0].isHuman).toBe(true);
    expect(state.players[1].isHuman).toBe(false);
    expect(state.players[2].isHuman).toBe(false);
    expect(state.smallBlind).toBe(5);
    expect(state.bigBlind).toBe(10);
  });
});

describe('startHand', () => {
  it('deals hole cards and posts blinds', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players.forEach((p) => {
      expect(p.holeCards).not.toBeNull();
      expect(p.holeCards).toHaveLength(2);
    });
    expect(state.pot).toBe(15);
    expect(state.currentBettingRound).toBe('preflop');
    expect(state.deck).toHaveLength(52 - 6);
  });
});

describe('advanceToNextPlayer', () => {
  it('skips folded players', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players[1].hasFolded = true;
    state.currentPlayerIndex = 0;
    const next = advanceToNextPlayer(state);
    expect(next.currentPlayerIndex).toBe(2);
  });

  it('skips all-in players', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players[1].isAllIn = true;
    state.currentPlayerIndex = 0;
    const next = advanceToNextPlayer(state);
    expect(next.currentPlayerIndex).toBe(2);
  });
});

describe('isRoundComplete', () => {
  it('returns true when all active players have matched the highest bet', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players[0].currentBet = 10;
    state.players[0].chips = 990;
    state.players[1].currentBet = 10;
    state.players[1].chips = 990;
    expect(isRoundComplete(state)).toBe(true);
  });
});

describe('advanceRound', () => {
  it('deals 3 community cards on flop', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players.forEach((p) => { p.currentBet = 10; p.chips = 990; });
    const next = advanceRound(state);
    expect(next.currentBettingRound).toBe('flop');
    expect(next.communityCards).toHaveLength(3);
  });

  it('deals 1 community card on turn', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    let state = startHand(game);
    state.players.forEach((p) => { p.currentBet = 10; p.chips = 990; });
    state = advanceRound(state);
    state.players.forEach((p) => { p.currentBet = 0; });
    state = advanceRound(state);
    expect(state.currentBettingRound).toBe('turn');
    expect(state.communityCards).toHaveLength(4);
  });

  it('deals 1 community card on river', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    let state = startHand(game);
    state.players.forEach((p) => { p.currentBet = 10; p.chips = 990; });
    state = advanceRound(state);
    state.players.forEach((p) => { p.currentBet = 0; });
    state = advanceRound(state);
    state.players.forEach((p) => { p.currentBet = 0; });
    state = advanceRound(state);
    expect(state.currentBettingRound).toBe('river');
    expect(state.communityCards).toHaveLength(5);
  });
});
