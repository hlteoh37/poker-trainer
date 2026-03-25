import type { GameState, PlayerAction } from '../engine/types';
import type { AIConfig } from './types';
import { getArchetype } from './archetypes';
import { getValidActions } from '../engine/betting';
import { calculateHandStrength } from './hand-strength';

export function makeAIDecision(state: GameState, config: AIConfig): PlayerAction {
  const profile = getArchetype(config.archetype);
  const player = state.players[state.currentPlayerIndex];
  const validActions = getValidActions(state);
  const validTypes = validActions.map((a) => a.type);

  const handStrength = calculateHandStrength(player.holeCards!, state.communityCards);

  const difficultyNoise = config.difficulty === 'beginner' ? 0.15 : config.difficulty === 'intermediate' ? 0.07 : 0;
  const noise = (Math.random() - 0.5) * difficultyNoise * 2;
  const adjustedStrength = Math.min(1, Math.max(0, handStrength + noise));

  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  const toCall = highestBet - player.currentBet;
  const isPreflop = state.currentBettingRound === 'preflop';

  if (isPreflop && toCall > 0) {
    if (adjustedStrength < (1 - profile.vpip)) return { type: 'fold' };
    if (adjustedStrength > profile.pfr + 0.3 && validTypes.includes('raise')) {
      const raiseAction = validActions.find((a) => a.type === 'raise')!;
      const raiseAmount = raiseAction.minAmount ?? highestBet * 2.5;
      return { type: 'raise', amount: Math.min(raiseAmount, raiseAction.maxAmount ?? raiseAmount) };
    }
    if (validTypes.includes('call')) return { type: 'call' };
    return { type: 'fold' };
  }

  if (toCall === 0) {
    if (validTypes.includes('check') && adjustedStrength < profile.aggression * 0.5) return { type: 'check' };
    if (adjustedStrength > 0.6 && validTypes.includes('raise')) {
      const raiseAction = validActions.find((a) => a.type === 'raise')!;
      const sizingMultiplier = adjustedStrength * profile.aggression;
      const betSize = Math.round(state.pot * (0.5 + sizingMultiplier));
      const amount = Math.max(raiseAction.minAmount ?? state.bigBlind, Math.min(betSize, raiseAction.maxAmount ?? betSize));
      return { type: 'raise', amount };
    }
    if (Math.random() < profile.bluffFrequency && validTypes.includes('raise')) {
      const raiseAction = validActions.find((a) => a.type === 'raise')!;
      const bluffSize = Math.round(state.pot * 0.6);
      return { type: 'raise', amount: Math.max(raiseAction.minAmount ?? state.bigBlind, Math.min(bluffSize, raiseAction.maxAmount ?? bluffSize)) };
    }
    if (validTypes.includes('check')) return { type: 'check' };
  }

  if (adjustedStrength > 0.7 && validTypes.includes('raise')) {
    const raiseAction = validActions.find((a) => a.type === 'raise')!;
    const raiseSize = Math.round(highestBet * (2 + profile.aggression));
    return { type: 'raise', amount: Math.max(raiseAction.minAmount ?? state.bigBlind, Math.min(raiseSize, raiseAction.maxAmount ?? raiseSize)) };
  }

  if (adjustedStrength > (1 - profile.vpip) * 0.8) {
    if (validTypes.includes('call')) return { type: 'call' };
  }

  if (Math.random() < profile.foldToRaise) return { type: 'fold' };
  if (validTypes.includes('call')) return { type: 'call' };
  return { type: 'fold' };
}
