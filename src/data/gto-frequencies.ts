import type { Position } from '../engine/types';

export interface GTOSpot { raise: number; call: number; fold: number; }

export const PREFLOP_OPEN_FREQ: Record<Position, number> = {
  UTG: 0.12, MP: 0.16, CO: 0.25, BTN: 0.40, SB: 0.35, BB: 0.0,
};

export const THREE_BET_FREQ: Record<Position, Record<Position, number>> = {
  UTG: { UTG: 0, MP: 0, CO: 0, BTN: 0, SB: 0, BB: 0 },
  MP: { UTG: 0.04, MP: 0, CO: 0, BTN: 0, SB: 0, BB: 0 },
  CO: { UTG: 0.05, MP: 0.06, CO: 0, BTN: 0, SB: 0, BB: 0 },
  BTN: { UTG: 0.06, MP: 0.07, CO: 0.08, BTN: 0, SB: 0, BB: 0 },
  SB: { UTG: 0.07, MP: 0.08, CO: 0.09, BTN: 0.10, SB: 0, BB: 0 },
  BB: { UTG: 0.08, MP: 0.09, CO: 0.10, BTN: 0.12, SB: 0.13, BB: 0 },
};

export const CBET_FREQ = { dry: 0.70, medium: 0.55, wet: 0.35 };

export const CHECK_RAISE_FREQ = { asDefender: 0.10, withStrongHand: 0.25, asSemiBluff: 0.12 };
