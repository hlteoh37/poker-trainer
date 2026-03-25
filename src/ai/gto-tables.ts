import type { Position } from '../engine/types';
import { OPENING_RANGES } from '../data/preflop-ranges';
import { THREE_BET_FREQ, CBET_FREQ } from '../data/gto-frequencies';

export interface GTODecision { raise: number; call: number; fold: number; }

export function getPreflopGTODecision(hand: string, position: Position, facingAction: 'unopened' | 'raise' | '3bet'): GTODecision {
  const inRange = OPENING_RANGES[position].has(hand);

  if (facingAction === 'unopened') {
    if (inRange) return { raise: 0.9, call: 0, fold: 0.1 };
    return { raise: 0.05, call: 0, fold: 0.95 };
  }

  if (facingAction === 'raise') {
    if (inRange) {
      const freq = THREE_BET_FREQ[position];
      const avgThreeBet = Object.values(freq).reduce((a, b) => a + b, 0) / 6;
      return { raise: avgThreeBet * 3, call: 0.5, fold: Math.max(0, 1 - avgThreeBet * 3 - 0.5) };
    }
    return { raise: 0.02, call: 0.08, fold: 0.90 };
  }

  if (inRange) return { raise: 0.15, call: 0.35, fold: 0.50 };
  return { raise: 0.02, call: 0.05, fold: 0.93 };
}

export function getPostflopGTOCbetDecision(boardTexture: 'dry' | 'medium' | 'wet', handStrength: number): GTODecision {
  const cbetFreq = CBET_FREQ[boardTexture];
  if (handStrength > 0.7) return { raise: cbetFreq + 0.1, call: 0, fold: 0 };
  if (handStrength > 0.4) return { raise: cbetFreq, call: 0, fold: 1 - cbetFreq };
  return { raise: cbetFreq * 0.4, call: 0, fold: 1 - cbetFreq * 0.4 };
}
