import { describe, it, expect } from 'vitest';
import { createCard, cardToString, SUITS, RANKS } from '../../src/engine/card';

describe('createCard', () => {
  it('creates a card with suit and rank', () => {
    const card = createCard('hearts', 'A');
    expect(card.suit).toBe('hearts');
    expect(card.rank).toBe('A');
  });
});

describe('cardToString', () => {
  it('formats card as rank+suit symbol', () => {
    expect(cardToString(createCard('spades', 'A'))).toBe('A♠');
    expect(cardToString(createCard('hearts', 'K'))).toBe('K♥');
    expect(cardToString(createCard('diamonds', '10'))).toBe('10♦');
    expect(cardToString(createCard('clubs', '2'))).toBe('2♣');
  });
});

describe('constants', () => {
  it('has 4 suits', () => {
    expect(SUITS).toEqual(['hearts', 'diamonds', 'clubs', 'spades']);
  });

  it('has 13 ranks', () => {
    expect(RANKS).toHaveLength(13);
    expect(RANKS[0]).toBe('2');
    expect(RANKS[12]).toBe('A');
  });
});
