import type { Card } from '../../engine/types';
import { CardDisplay } from '../common/Card';

interface CommunityCardsProps { cards: Card[]; }

export function CommunityCards({ cards }: CommunityCardsProps) {
  return (
    <div className="flex gap-2 justify-center">
      {cards.map((card, i) => (
        <CardDisplay key={`${card.rank}-${card.suit}-${i}`} card={card} size="md" />
      ))}
      {Array.from({ length: 5 - cards.length }).map((_, i) => (
        <div key={`empty-${i}`} className="w-12 h-18 rounded-lg border border-gray-600 border-dashed" />
      ))}
    </div>
  );
}
