import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealCards } from '../../src/engine/deck';

describe('createDeck', () => {
  it('creates a standard 52-card deck', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('has no duplicate cards', () => {
    const deck = createDeck();
    const keys = deck.map((c) => `${c.rank}-${c.suit}`);
    expect(new Set(keys).size).toBe(52);
  });
});

describe('shuffleDeck', () => {
  it('returns a deck with the same 52 cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(52);
    const originalKeys = new Set(deck.map((c) => `${c.rank}-${c.suit}`));
    shuffled.forEach((c) => {
      expect(originalKeys.has(`${c.rank}-${c.suit}`)).toBe(true);
    });
  });

  it('does not mutate the original deck', () => {
    const deck = createDeck();
    const copy = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(copy);
  });
});

describe('dealCards', () => {
  it('removes cards from the top of the deck', () => {
    const deck = createDeck();
    const { dealt, remaining } = dealCards(deck, 2);
    expect(dealt).toHaveLength(2);
    expect(remaining).toHaveLength(50);
    expect(dealt[0]).toEqual(deck[0]);
    expect(dealt[1]).toEqual(deck[1]);
  });

  it('throws if not enough cards', () => {
    const deck = createDeck();
    expect(() => dealCards(deck, 53)).toThrow('Not enough cards');
  });
});
