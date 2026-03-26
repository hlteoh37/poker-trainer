import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/game-store';
import { useSettingsStore } from '../stores/settings-store';
import { getValidActions } from '../engine/betting';
import { generateCoachingAdvice } from '../stats/coaching';
import type { CoachingAdvice } from '../stats/types';
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
    setAdvice(generateCoachingAdvice(gameState));
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
