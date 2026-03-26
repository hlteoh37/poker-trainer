export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface PlayerAction {
  type: ActionType;
  amount?: number;
}

export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river';

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: [Card, Card] | null;
  position: Position;
  currentBet: number;
  hasFolded: boolean;
  isAllIn: boolean;
  isHuman: boolean;
  hasActedThisRound: boolean;
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: { amount: number; eligiblePlayerIds: string[] }[];
  currentBettingRound: BettingRound;
  currentPlayerIndex: number;
  dealerIndex: number;
  deck: Card[];
  smallBlind: number;
  bigBlind: number;
  isHandComplete: boolean;
  winners: { playerId: string; amount: number }[];
}
