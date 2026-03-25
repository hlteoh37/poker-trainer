import { create } from 'zustand';
import type { GameState, PlayerAction } from '../engine/types';
import type { AIConfig } from '../ai/types';
import { createGame, startHand, advanceToNextPlayer, isRoundComplete, advanceRound } from '../engine/game';
import { applyAction } from '../engine/betting';
import { makeAIDecision } from '../ai/decision';
import { evaluateHand } from '../engine/hand-eval';
import { calculateSidePots } from '../engine/pot';

interface HandHistory {
  actions: { playerId: string; action: PlayerAction; round: string }[];
  communityCards: GameState['communityCards'];
  winners: GameState['winners'];
}

interface GameStoreState {
  gameState: GameState | null;
  handHistory: HandHistory;
  isWaitingForHuman: boolean;
  handCount: number;
  initGame: (humanName: string, aiCount: number, startingChips: number, smallBlind: number, bigBlind: number) => void;
  dealNewHand: () => void;
  humanAct: (action: PlayerAction) => void;
  runAIActions: () => void;
}

export const useGameStore = create<GameStoreState>()((set, get) => ({
  gameState: null,
  handHistory: { actions: [], communityCards: [], winners: [] },
  isWaitingForHuman: false,
  handCount: 0,

  initGame: (humanName, aiCount, startingChips, smallBlind, bigBlind) => {
    const gameState = createGame({ humanName, aiCount, startingChips, smallBlind, bigBlind });
    set({ gameState, handCount: 0 });
  },

  dealNewHand: () => {
    const { gameState } = get();
    if (!gameState) return;
    const newState = startHand(gameState);
    set({
      gameState: newState,
      handHistory: { actions: [], communityCards: [], winners: [] },
      handCount: get().handCount + 1,
      isWaitingForHuman: newState.players[newState.currentPlayerIndex].isHuman,
    });
    if (!newState.players[newState.currentPlayerIndex].isHuman) {
      get().runAIActions();
    }
  },

  humanAct: (action) => {
    const { gameState } = get();
    if (!gameState) return;

    let state = applyAction(gameState, action);
    const history = get().handHistory;
    history.actions.push({
      playerId: gameState.players[gameState.currentPlayerIndex].id,
      action,
      round: state.currentBettingRound,
    });

    const activePlayers = state.players.filter((p) => !p.hasFolded);
    if (activePlayers.length === 1) {
      state = { ...state, isHandComplete: true, winners: [{ playerId: activePlayers[0].id, amount: state.pot }] };
      set({ gameState: state, handHistory: { ...history, winners: state.winners }, isWaitingForHuman: false });
      return;
    }

    state = advanceToNextPlayer(state);

    if (isRoundComplete(state)) {
      state = advanceRound(state);
      if (state.isHandComplete) {
        state = resolveShowdown(state);
        set({ gameState: state, handHistory: { ...history, communityCards: state.communityCards, winners: state.winners }, isWaitingForHuman: false });
        return;
      }
    }

    set({ gameState: state, handHistory: history, isWaitingForHuman: state.players[state.currentPlayerIndex].isHuman });

    if (!state.players[state.currentPlayerIndex].isHuman) {
      setTimeout(() => get().runAIActions(), 500);
    }
  },

  runAIActions: () => {
    let state = get().gameState;
    if (!state) return;
    const history = get().handHistory;

    while (state && !state.isHandComplete && !state.players[state.currentPlayerIndex].isHuman) {
      const player = state.players[state.currentPlayerIndex];
      const aiConfig: AIConfig = { archetype: 'TAG', difficulty: 'beginner' };
      const action = makeAIDecision(state, aiConfig);
      state = applyAction(state, action);
      history.actions.push({ playerId: player.id, action, round: state.currentBettingRound });

      const activePlayers = state.players.filter((p) => !p.hasFolded);
      if (activePlayers.length === 1) {
        state = { ...state, isHandComplete: true, winners: [{ playerId: activePlayers[0].id, amount: state.pot }] };
        break;
      }

      state = advanceToNextPlayer(state);

      if (isRoundComplete(state)) {
        state = advanceRound(state);
        if (state.isHandComplete) {
          state = resolveShowdown(state);
          break;
        }
      }
    }

    set({
      gameState: state,
      handHistory: { ...history, communityCards: state?.communityCards ?? [], winners: state?.winners ?? [] },
      isWaitingForHuman: state ? state.players[state.currentPlayerIndex]?.isHuman ?? false : false,
    });
  },
}));

function resolveShowdown(state: GameState): GameState {
  const activePlayers = state.players.filter((p) => !p.hasFolded);
  const pots = calculateSidePots(state.players);
  const winners: { playerId: string; amount: number }[] = [];

  for (const pot of pots) {
    const eligible = activePlayers.filter((p) => pot.eligiblePlayerIds.includes(p.id));
    if (eligible.length === 0) continue;

    let bestResult = evaluateHand([...eligible[0].holeCards!, ...state.communityCards]);
    let bestPlayers = [eligible[0]];

    for (let i = 1; i < eligible.length; i++) {
      const result = evaluateHand([...eligible[i].holeCards!, ...state.communityCards]);
      const cmp = result.rank !== bestResult.rank ? result.rank - bestResult.rank
        : (() => { for (let j = 0; j < Math.min(result.values.length, bestResult.values.length); j++) { if (result.values[j] !== bestResult.values[j]) return result.values[j] - bestResult.values[j]; } return 0; })();

      if (cmp > 0) { bestResult = result; bestPlayers = [eligible[i]]; }
      else if (cmp === 0) { bestPlayers.push(eligible[i]); }
    }

    const share = Math.floor(pot.amount / bestPlayers.length);
    for (const p of bestPlayers) {
      const existing = winners.find((w) => w.playerId === p.id);
      if (existing) { existing.amount += share; }
      else { winners.push({ playerId: p.id, amount: share }); }
    }
  }

  const updatedPlayers = state.players.map((p) => {
    const won = winners.find((w) => w.playerId === p.id);
    return won ? { ...p, chips: p.chips + won.amount } : { ...p };
  });

  return { ...state, players: updatedPlayers, winners, isHandComplete: true };
}
