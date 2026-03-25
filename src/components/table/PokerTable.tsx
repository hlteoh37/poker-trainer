import type { GameState, PlayerAction } from '../../engine/types';
import type { ValidAction } from '../../engine/betting';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { ActionBar } from './ActionBar';

interface PokerTableProps {
  gameState: GameState;
  validActions: ValidAction[];
  isWaitingForHuman: boolean;
  onAction: (action: PlayerAction) => void;
}

export function PokerTable({ gameState, validActions, isWaitingForHuman, onAction }: PokerTableProps) {
  const humanIndex = gameState.players.findIndex((p) => p.isHuman);
  const opponents = gameState.players.filter((p) => !p.isHuman);
  const human = gameState.players[humanIndex];
  const highestBet = Math.max(...gameState.players.map((p) => p.currentBet));
  const toCall = highestBet - (human?.currentBet ?? 0);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex justify-center gap-4 flex-wrap">
        {opponents.map((player) => (
          <PlayerSeat key={player.id} player={player}
            isCurrentPlayer={gameState.players[gameState.currentPlayerIndex]?.id === player.id}
            showCards={gameState.isHandComplete} />
        ))}
      </div>
      <div className="bg-green-800 rounded-3xl p-6 w-full max-w-lg border-4 border-green-900 flex flex-col items-center gap-4">
        <CommunityCards cards={gameState.communityCards} />
        <div className="text-yellow-400 font-bold">Pot: {gameState.pot}</div>
      </div>
      {human && (
        <PlayerSeat player={human}
          isCurrentPlayer={gameState.players[gameState.currentPlayerIndex]?.id === human.id}
          showCards={true} />
      )}
      {isWaitingForHuman && !gameState.isHandComplete && (
        <ActionBar validActions={validActions} onAction={onAction} potSize={gameState.pot} toCall={toCall} />
      )}
    </div>
  );
}
