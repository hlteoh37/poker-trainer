import type { GameState, PlayerAction } from './types';

export interface ValidAction {
  type: PlayerAction['type'];
  minAmount?: number;
  maxAmount?: number;
}

export function getValidActions(state: GameState): ValidAction[] {
  const player = state.players[state.currentPlayerIndex];
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  const toCall = highestBet - player.currentBet;
  const actions: ValidAction[] = [];

  if (toCall > 0) {
    actions.push({ type: 'fold' });
    if (toCall >= player.chips) {
      actions.push({ type: 'all-in' });
    } else {
      actions.push({ type: 'call' });
      const minRaise = highestBet + state.bigBlind;
      if (minRaise <= player.chips + player.currentBet) {
        actions.push({ type: 'raise', minAmount: minRaise, maxAmount: player.chips + player.currentBet });
      } else {
        actions.push({ type: 'all-in' });
      }
    }
  } else {
    actions.push({ type: 'check' });
    const minRaise = highestBet + state.bigBlind;
    if (minRaise <= player.chips + player.currentBet) {
      actions.push({ type: 'raise', minAmount: minRaise, maxAmount: player.chips + player.currentBet });
    }
  }
  return actions;
}

export function applyAction(state: GameState, action: PlayerAction): GameState {
  const next: GameState = { ...state, players: state.players.map((p) => ({ ...p })) };
  const player = next.players[next.currentPlayerIndex];
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));

  player.hasActedThisRound = true;

  switch (action.type) {
    case 'fold': player.hasFolded = true; break;
    case 'check': break;
    case 'call': {
      const toCall = highestBet - player.currentBet;
      const actualCall = Math.min(toCall, player.chips);
      player.chips -= actualCall; player.currentBet += actualCall; next.pot += actualCall;
      if (player.chips === 0) player.isAllIn = true; break;
    }
    case 'raise': {
      const amount = action.amount!;
      const increase = amount - player.currentBet;
      player.chips -= increase; next.pot += increase; player.currentBet = amount;
      if (player.chips === 0) player.isAllIn = true;
      // A raise reopens action for other players
      for (const p of next.players) {
        if (p.id !== player.id && !p.hasFolded && !p.isAllIn) {
          p.hasActedThisRound = false;
        }
      }
      break;
    }
    case 'all-in': {
      const allInAmount = player.chips;
      const newBet = player.currentBet + allInAmount;
      // If the all-in is a raise (exceeds current highest bet), reopen action
      if (newBet > highestBet) {
        for (const p of next.players) {
          if (p.id !== player.id && !p.hasFolded && !p.isAllIn) {
            p.hasActedThisRound = false;
          }
        }
      }
      next.pot += allInAmount; player.currentBet = newBet; player.chips = 0; player.isAllIn = true; break;
    }
  }
  return next;
}
