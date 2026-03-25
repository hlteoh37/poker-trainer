import type { Position } from '../engine/types';

export const OPENING_RANGES: Record<Position, Set<string>> = {
  UTG: new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'ATs', 'AKo', 'AQo', 'KQs']),
  MP: new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KQo', 'QJs']),
  CO: new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'KQo', 'KJo', 'QJs', 'QTs', 'JTs']),
  BTN: new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'KJo', 'KTo', 'QJs', 'QTs', 'Q9s', 'QJo', 'JTs', 'J9s', 'JTo', 'T9s', 'T8s', '98s', '87s', '76s', '65s']),
  SB: new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'A4s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'KQo', 'KJo', 'QJs', 'QTs', 'QJo', 'JTs', 'J9s', 'T9s', '98s']),
  BB: new Set(['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'AJs', 'AKo']),
};

export function isInOpeningRange(hand: string, position: Position): boolean {
  return OPENING_RANGES[position].has(hand);
}
