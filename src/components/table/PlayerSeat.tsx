import type { Player } from '../../engine/types';
import { CardDisplay } from '../common/Card';

interface PlayerSeatProps {
  player: Player;
  isCurrentPlayer: boolean;
  showCards: boolean;
}

export function PlayerSeat({ player, isCurrentPlayer, showCards }: PlayerSeatProps) {
  return (
    <div className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isCurrentPlayer ? 'ring-2 ring-green-400' : ''} ${player.hasFolded ? 'opacity-40' : ''}`}>
      <div className="flex gap-1">
        {player.holeCards && showCards ? (
          <><CardDisplay card={player.holeCards[0]} size="sm" /><CardDisplay card={player.holeCards[1]} size="sm" /></>
        ) : player.holeCards ? (
          <><CardDisplay card={player.holeCards[0]} size="sm" faceDown /><CardDisplay card={player.holeCards[1]} size="sm" faceDown /></>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-300 truncate max-w-20">{player.name}</span>
        <span className="text-[10px] text-gray-500 font-mono">{player.position}</span>
      </div>
      <span className="text-xs text-yellow-400">{player.chips}</span>
      {player.currentBet > 0 && <span className="text-xs text-green-300">Bet: {player.currentBet}</span>}
      {player.hasFolded && <span className="text-xs text-red-400">Folded</span>}
      {player.isAllIn && <span className="text-xs text-orange-400">All-In</span>}
    </div>
  );
}
