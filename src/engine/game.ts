import type { GameState, Player, Position, Card } from './types';
import { createDeck, shuffleDeck, dealCards } from './deck';

const POSITIONS_BY_SIZE: Record<number, Position[]> = {
  2: ['SB', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'CO', 'SB', 'BB'],
  5: ['BTN', 'CO', 'MP', 'SB', 'BB'],
  6: ['BTN', 'CO', 'MP', 'UTG', 'SB', 'BB'],
};

interface CreateGameOptions {
  humanName: string;
  aiCount: number;
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
}

export function createGame(options: CreateGameOptions): GameState {
  const totalPlayers = options.aiCount + 1;
  const positions = POSITIONS_BY_SIZE[totalPlayers] ?? POSITIONS_BY_SIZE[6];

  const players: Player[] = [];
  for (let i = 0; i < totalPlayers; i++) {
    players.push({
      id: `player-${i}`,
      name: i === 0 ? options.humanName : `Bot ${i}`,
      chips: options.startingChips,
      holeCards: null,
      position: positions[i % positions.length],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
      isHuman: i === 0,
      hasActedThisRound: false,
    });
  }

  return {
    players, communityCards: [], pot: 0, sidePots: [],
    currentBettingRound: 'preflop', currentPlayerIndex: 0, dealerIndex: 0,
    deck: [], smallBlind: options.smallBlind, bigBlind: options.bigBlind,
    isHandComplete: false, winners: [],
  };
}

export function startHand(gameState: GameState): GameState {
  const deck = shuffleDeck(createDeck());
  const newDealerIndex = (gameState.dealerIndex + 1) % gameState.players.length;
  const positions = POSITIONS_BY_SIZE[gameState.players.length] ?? POSITIONS_BY_SIZE[6];

  const players = gameState.players.map((p, i) => ({
    ...p,
    holeCards: null as [Card, Card] | null,
    currentBet: 0,
    hasFolded: false,
    isAllIn: false,
    hasActedThisRound: false,
    position: positions[(i - newDealerIndex + gameState.players.length) % gameState.players.length],
  }));

  let remaining = deck;
  for (let i = 0; i < players.length; i++) {
    const result = dealCards(remaining, 2);
    players[i].holeCards = result.dealt as [Card, Card];
    remaining = result.remaining;
  }

  const sbIndex = players.findIndex((p) => p.position === 'SB');
  const bbIndex = players.findIndex((p) => p.position === 'BB');

  const sbAmount = Math.min(gameState.smallBlind, players[sbIndex].chips);
  players[sbIndex].chips -= sbAmount;
  players[sbIndex].currentBet = sbAmount;

  const bbAmount = Math.min(gameState.bigBlind, players[bbIndex].chips);
  players[bbIndex].chips -= bbAmount;
  players[bbIndex].currentBet = bbAmount;

  const firstToAct = (bbIndex + 1) % players.length;

  return {
    ...gameState, players, deck: remaining, communityCards: [], pot: sbAmount + bbAmount,
    sidePots: [], currentBettingRound: 'preflop', currentPlayerIndex: firstToAct,
    dealerIndex: newDealerIndex, isHandComplete: false, winners: [],
  };
}

export function advanceToNextPlayer(state: GameState): GameState {
  const n = state.players.length;
  let nextIndex = (state.currentPlayerIndex + 1) % n;
  let checked = 0;

  while (checked < n) {
    const player = state.players[nextIndex];
    if (!player.hasFolded && !player.isAllIn) {
      return { ...state, currentPlayerIndex: nextIndex };
    }
    nextIndex = (nextIndex + 1) % n;
    checked++;
  }
  return { ...state, currentPlayerIndex: state.currentPlayerIndex };
}

export function isRoundComplete(state: GameState): boolean {
  const activePlayers = state.players.filter((p) => !p.hasFolded && !p.isAllIn);
  if (activePlayers.length === 0) return true;
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  return activePlayers.every((p) => p.hasActedThisRound && p.currentBet === highestBet);
}

export function advanceRound(state: GameState): GameState {
  const next = { ...state, players: state.players.map((p) => ({ ...p, currentBet: 0, hasActedThisRound: false })) };

  let cardsToDeal: number;
  switch (state.currentBettingRound) {
    case 'preflop': next.currentBettingRound = 'flop'; cardsToDeal = 3; break;
    case 'flop': next.currentBettingRound = 'turn'; cardsToDeal = 1; break;
    case 'turn': next.currentBettingRound = 'river'; cardsToDeal = 1; break;
    case 'river': next.isHandComplete = true; return next;
    default: return next;
  }

  const { dealt, remaining } = dealCards(next.deck, cardsToDeal);
  next.communityCards = [...state.communityCards, ...dealt];
  next.deck = remaining;

  const sbIndex = next.players.findIndex((p) => p.position === 'SB');
  let firstToAct = sbIndex;
  let checked = 0;
  while (checked < next.players.length) {
    const p = next.players[firstToAct];
    if (!p.hasFolded && !p.isAllIn) break;
    firstToAct = (firstToAct + 1) % next.players.length;
    checked++;
  }
  next.currentPlayerIndex = firstToAct;

  return next;
}
