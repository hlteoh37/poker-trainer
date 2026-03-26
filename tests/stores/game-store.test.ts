import { describe, it, expect } from 'vitest';
import type { GameState, Player } from '../../src/engine/types';
import { resolveShowdown } from '../../src/stores/game-store';

function makePlayer(overrides: Partial<Player> & { id: string }): Player {
  return {
    name: overrides.id,
    chips: 900,
    holeCards: null,
    position: 'BTN',
    currentBet: 0,
    hasFolded: false,
    isAllIn: false,
    isHuman: false,
    hasActedThisRound: false,
    ...overrides,
  };
}

function makeState(overrides: Partial<GameState>): GameState {
  return {
    players: [],
    communityCards: [],
    pot: 0,
    sidePots: [],
    currentBettingRound: 'river',
    currentPlayerIndex: 0,
    dealerIndex: 0,
    deck: [],
    smallBlind: 5,
    bigBlind: 10,
    isHandComplete: false,
    winners: [],
    ...overrides,
  };
}

describe('resolveShowdown', () => {
  it('awards entire pot to the single winner', () => {
    // Player 1 has AA, Player 2 has 72o — AA should win
    const state = makeState({
      pot: 200,
      communityCards: [
        { rank: '3', suit: 'clubs' },
        { rank: '5', suit: 'diamonds' },
        { rank: '8', suit: 'hearts' },
        { rank: 'J', suit: 'spades' },
        { rank: 'Q', suit: 'clubs' },
      ],
      players: [
        makePlayer({
          id: 'p1',
          chips: 800,
          holeCards: [{ rank: 'A', suit: 'hearts' }, { rank: 'A', suit: 'spades' }],
          isHuman: true,
        }),
        makePlayer({
          id: 'p2',
          chips: 800,
          holeCards: [{ rank: '7', suit: 'hearts' }, { rank: '2', suit: 'diamonds' }],
        }),
      ],
    });

    const result = resolveShowdown(state);

    expect(result.isHandComplete).toBe(true);
    expect(result.winners).toHaveLength(1);
    expect(result.winners[0].playerId).toBe('p1');
    expect(result.winners[0].amount).toBe(200);

    const winner = result.players.find((p) => p.id === 'p1')!;
    expect(winner.chips).toBe(1000); // 800 + 200 pot

    const loser = result.players.find((p) => p.id === 'p2')!;
    expect(loser.chips).toBe(800); // unchanged
  });

  it('splits pot evenly on a tie', () => {
    // Both players have same hole cards (different suits) — tie
    const state = makeState({
      pot: 300,
      communityCards: [
        { rank: 'A', suit: 'clubs' },
        { rank: 'K', suit: 'clubs' },
        { rank: 'Q', suit: 'clubs' },
        { rank: 'J', suit: 'clubs' },
        { rank: '10', suit: 'clubs' },
      ],
      players: [
        makePlayer({
          id: 'p1',
          chips: 700,
          holeCards: [{ rank: '2', suit: 'hearts' }, { rank: '3', suit: 'hearts' }],
          isHuman: true,
        }),
        makePlayer({
          id: 'p2',
          chips: 700,
          holeCards: [{ rank: '2', suit: 'diamonds' }, { rank: '3', suit: 'diamonds' }],
        }),
      ],
    });

    const result = resolveShowdown(state);

    expect(result.winners).toHaveLength(2);
    // Each gets 150
    const p1Won = result.winners.find((w) => w.playerId === 'p1')!;
    const p2Won = result.winners.find((w) => w.playerId === 'p2')!;
    expect(p1Won.amount).toBe(150);
    expect(p2Won.amount).toBe(150);

    expect(result.players.find((p) => p.id === 'p1')!.chips).toBe(850);
    expect(result.players.find((p) => p.id === 'p2')!.chips).toBe(850);
  });

  it('ignores folded players when determining winner', () => {
    // Player 1 has worse hand but player 2 folded
    const state = makeState({
      pot: 100,
      communityCards: [
        { rank: '3', suit: 'clubs' },
        { rank: '5', suit: 'diamonds' },
        { rank: '8', suit: 'hearts' },
        { rank: 'J', suit: 'spades' },
        { rank: 'Q', suit: 'clubs' },
      ],
      players: [
        makePlayer({
          id: 'p1',
          chips: 900,
          holeCards: [{ rank: '2', suit: 'hearts' }, { rank: '4', suit: 'diamonds' }],
          isHuman: true,
        }),
        makePlayer({
          id: 'p2',
          chips: 900,
          holeCards: [{ rank: 'A', suit: 'hearts' }, { rank: 'A', suit: 'diamonds' }],
          hasFolded: true,
        }),
      ],
    });

    const result = resolveShowdown(state);

    expect(result.winners).toHaveLength(1);
    expect(result.winners[0].playerId).toBe('p1');
    expect(result.players.find((p) => p.id === 'p1')!.chips).toBe(1000);
  });

  it('works when currentBet is 0 (after advanceRound resets bets)', () => {
    // This is the actual bug scenario — bets are zeroed but pot is correct
    const state = makeState({
      pot: 400,
      communityCards: [
        { rank: 'A', suit: 'hearts' },
        { rank: 'K', suit: 'hearts' },
        { rank: '10', suit: 'hearts' },
        { rank: '2', suit: 'clubs' },
        { rank: '9', suit: 'spades' },
      ],
      players: [
        makePlayer({
          id: 'p1',
          chips: 600,
          currentBet: 0, // reset by advanceRound
          holeCards: [{ rank: 'Q', suit: 'hearts' }, { rank: 'J', suit: 'hearts' }],
          isHuman: true,
        }),
        makePlayer({
          id: 'p2',
          chips: 600,
          currentBet: 0, // reset by advanceRound
          holeCards: [{ rank: '3', suit: 'clubs' }, { rank: '4', suit: 'diamonds' }],
        }),
      ],
    });

    const result = resolveShowdown(state);

    // p1 has royal flush, should win the full 400 pot
    expect(result.winners[0].playerId).toBe('p1');
    expect(result.winners[0].amount).toBe(400);
    expect(result.players.find((p) => p.id === 'p1')!.chips).toBe(1000); // 600 + 400
    expect(result.players.find((p) => p.id === 'p2')!.chips).toBe(600); // unchanged
  });

  it('resets pot to 0 after distributing', () => {
    const state = makeState({
      pot: 200,
      communityCards: [
        { rank: '3', suit: 'clubs' },
        { rank: '5', suit: 'diamonds' },
        { rank: '8', suit: 'hearts' },
        { rank: 'J', suit: 'spades' },
        { rank: 'Q', suit: 'clubs' },
      ],
      players: [
        makePlayer({
          id: 'p1',
          chips: 800,
          holeCards: [{ rank: 'A', suit: 'hearts' }, { rank: 'A', suit: 'spades' }],
        }),
        makePlayer({
          id: 'p2',
          chips: 800,
          holeCards: [{ rank: '2', suit: 'hearts' }, { rank: '3', suit: 'diamonds' }],
        }),
      ],
    });

    const result = resolveShowdown(state);
    expect(result.pot).toBe(0);
  });
});
