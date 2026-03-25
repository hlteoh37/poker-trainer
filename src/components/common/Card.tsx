import type { Card } from '../../engine/types';

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
};

interface CardDisplayProps {
  card: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CardDisplay({ card, faceDown = false, size = 'md' }: CardDisplayProps) {
  const sizeClasses = { sm: 'w-8 h-12 text-xs', md: 'w-12 h-18 text-sm', lg: 'w-16 h-24 text-base' };
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  if (faceDown) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-blue-800 border border-blue-600 flex items-center justify-center shadow-md`}>
        <div className="w-3/4 h-3/4 rounded border border-blue-500 bg-blue-700" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-white border border-gray-300 flex flex-col items-center justify-center shadow-md ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
      <span className="font-bold leading-none">{card.rank}</span>
      <span className="leading-none">{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}
