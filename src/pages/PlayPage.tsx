import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/game-store';
import { useSettingsStore } from '../stores/settings-store';
import { getValidActions } from '../engine/betting';
import { calculateEquity } from '../stats/equity';
import { calculateCallEV, calculateFoldEV, calculateRaiseEV } from '../stats/ev';
import { calculatePotOdds } from '../stats/pot-odds';
import type { CoachingAdvice, ActionEV } from '../stats/types';
import type { PlayerAction } from '../engine/types';
import { PokerTable } from '../components/table/PokerTable';
import { CoachingPanel } from '../components/coaching/CoachingPanel';
import { Button } from '../components/common/Button';

export function PlayPage() {
  const { gameState, isWaitingForHuman, initGame, dealNewHand, humanAct } = useGameStore();
  const { showCoaching, toggleCoaching, startingChips, smallBlind, bigBlind, tableSize } = useSettingsStore();
  const [advice, setAdvice] = useState<CoachingAdvice | null>(null);

  useEffect(() => {
    if (!gameState) {
      initGame('Hero', tableSize - 1, startingChips, smallBlind, bigBlind);
    }
  }, [gameState, initGame, tableSize, startingChips, smallBlind, bigBlind]);

  useEffect(() => {
    if (!gameState || !isWaitingForHuman || gameState.isHandComplete) {
      setAdvice(null);
      return;
    }
    const human = gameState.players.find((p) => p.isHuman);
    if (!human?.holeCards) return;

    const equity = calculateEquity(human.holeCards, gameState.communityCards, 500);
    const highestBet = Math.max(...gameState.players.map((p) => p.currentBet));
    const toCall = highestBet - human.currentBet;
    const potOdds = calculatePotOdds(gameState.pot, toCall);

    const actionEVs: ActionEV[] = [
      { action: { type: 'fold' }, ev: calculateFoldEV(), explanation: 'You lose nothing more.' },
    ];
    if (toCall > 0) {
      const callEV = calculateCallEV(equity.win, gameState.pot, toCall);
      actionEVs.push({ action: { type: 'call' }, ev: callEV, explanation: `Calling ${toCall} with ${Math.round(equity.win * 100)}% equity.` });
    }
    const raiseEV = calculateRaiseEV(equity.win, gameState.pot, gameState.bigBlind * 3, 0.3);
    actionEVs.push({ action: { type: 'raise' }, ev: raiseEV, explanation: 'Value raise or semi-bluff.' });

    const best = actionEVs.reduce((a, b) => (a.ev > b.ev ? a : b));
    setAdvice({ equity: equity.win, potOdds, actionEVs, recommendedAction: best.action, explanation: best.explanation });
  }, [gameState, isWaitingForHuman]);

  if (!gameState) return <div className="text-center p-8">Loading...</div>;

  const validActions = isWaitingForHuman && !gameState.isHandComplete ? getValidActions(gameState) : [];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col items-center gap-4">
        <PokerTable gameState={gameState} validActions={validActions}
          isWaitingForHuman={isWaitingForHuman && !gameState.isHandComplete} onAction={humanAct} />
        {gameState.isHandComplete && (
          <div className="text-center">
            <div className="mb-2">
              {gameState.winners.map((w) => {
                const player = gameState.players.find((p) => p.id === w.playerId);
                return <div key={w.playerId} className="text-green-400 font-bold">{player?.name} wins {w.amount}</div>;
              })}
            </div>
            <Button onClick={dealNewHand}>Deal Next Hand</Button>
          </div>
        )}
        {!gameState.isHandComplete && gameState.pot === 0 && <Button onClick={dealNewHand}>Deal Hand</Button>}
      </div>
      {showCoaching && <CoachingPanel advice={advice} visible={showCoaching} onToggle={toggleCoaching} />}
    </div>
  );
}
