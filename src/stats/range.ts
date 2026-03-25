import type { PlayerAction, Position } from '../engine/types';
import type { Difficulty } from '../ai/types';

export interface RangeEntry {
  hand: string;
  weight: number;
}

interface RangeEstimateInput {
  position: Position;
  actions: PlayerAction[];
  difficulty: Difficulty;
}

const TIER_1 = ['AA', 'KK', 'QQ', 'AKs'];
const TIER_2 = ['JJ', 'TT', 'AKo', 'AQs', 'AQo', 'AJs'];
const TIER_3 = ['99', '88', 'ATs', 'AJo', 'KQs', 'KQo', 'KJs', 'QJs'];
const TIER_4 = ['77', '66', 'A9s', 'A8s', 'ATo', 'KJo', 'KTs', 'QTs', 'JTs'];
const TIER_5 = ['55', '44', '33', '22', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'Q9s', 'J9s', 'T9s', '98s', '87s', '76s'];
const TIER_6 = ['A9o', 'A8o', 'K9o', 'K8s', 'Q8s', 'J8s', 'T8s', '97s', '86s', '75s', '65s', '54s'];

const ALL_TIERS = [TIER_1, TIER_2, TIER_3, TIER_4, TIER_5, TIER_6];

const POSITION_TIERS: Record<Position, number> = { UTG: 2, MP: 3, CO: 4, BTN: 5, SB: 4, BB: 6 };

export function estimateRange(input: RangeEstimateInput): RangeEntry[] {
  const baseTiers = POSITION_TIERS[input.position];
  const lastAction = input.actions[input.actions.length - 1];

  let tiersToInclude: number;
  let weightMultiplier: number;

  if (!lastAction || lastAction.type === 'check') {
    tiersToInclude = baseTiers; weightMultiplier = 0.8;
  } else if (lastAction.type === 'call') {
    tiersToInclude = Math.min(baseTiers + 1, ALL_TIERS.length); weightMultiplier = 0.7;
  } else if (lastAction.type === 'raise') {
    tiersToInclude = Math.max(1, baseTiers - 1); weightMultiplier = 0.9;
  } else {
    tiersToInclude = baseTiers; weightMultiplier = 0.8;
  }

  if (input.difficulty === 'beginner') {
    tiersToInclude = Math.min(tiersToInclude + 1, ALL_TIERS.length); weightMultiplier *= 0.8;
  }

  const range: RangeEntry[] = [];
  for (let t = 0; t < tiersToInclude; t++) {
    const tierWeight = ((tiersToInclude - t) / tiersToInclude) * weightMultiplier;
    for (const hand of ALL_TIERS[t]) {
      range.push({ hand, weight: Math.min(1, tierWeight) });
    }
  }
  return range;
}
