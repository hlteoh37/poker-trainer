import { describe, it, expect } from 'vitest';
import { evaluateHand, compareHands, HandRank } from '../../src/engine/hand-eval';
import { createCard } from '../../src/engine/card';

describe('evaluateHand', () => {
  it('detects royal flush', () => {
    const cards = [
      createCard('spades', 'A'), createCard('spades', 'K'), createCard('spades', 'Q'),
      createCard('spades', 'J'), createCard('spades', '10'), createCard('hearts', '2'), createCard('diamonds', '3'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.RoyalFlush);
  });

  it('detects straight flush', () => {
    const cards = [
      createCard('hearts', '9'), createCard('hearts', '8'), createCard('hearts', '7'),
      createCard('hearts', '6'), createCard('hearts', '5'), createCard('clubs', 'A'), createCard('diamonds', 'K'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.StraightFlush);
  });

  it('detects four of a kind', () => {
    const cards = [
      createCard('hearts', 'K'), createCard('diamonds', 'K'), createCard('clubs', 'K'),
      createCard('spades', 'K'), createCard('hearts', '2'), createCard('diamonds', '5'), createCard('clubs', '8'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FourOfAKind);
  });

  it('detects full house', () => {
    const cards = [
      createCard('hearts', 'J'), createCard('diamonds', 'J'), createCard('clubs', 'J'),
      createCard('spades', '9'), createCard('hearts', '9'), createCard('diamonds', '2'), createCard('clubs', '5'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FullHouse);
  });

  it('detects flush', () => {
    const cards = [
      createCard('hearts', 'A'), createCard('hearts', '10'), createCard('hearts', '7'),
      createCard('hearts', '4'), createCard('hearts', '2'), createCard('clubs', 'K'), createCard('diamonds', 'Q'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Flush);
  });

  it('detects straight', () => {
    const cards = [
      createCard('hearts', '8'), createCard('diamonds', '7'), createCard('clubs', '6'),
      createCard('spades', '5'), createCard('hearts', '4'), createCard('diamonds', 'K'), createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Straight);
  });

  it('detects ace-low straight (wheel)', () => {
    const cards = [
      createCard('hearts', 'A'), createCard('diamonds', '2'), createCard('clubs', '3'),
      createCard('spades', '4'), createCard('hearts', '5'), createCard('diamonds', 'K'), createCard('clubs', '9'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Straight);
  });

  it('detects three of a kind', () => {
    const cards = [
      createCard('hearts', '7'), createCard('diamonds', '7'), createCard('clubs', '7'),
      createCard('spades', 'K'), createCard('hearts', '3'), createCard('diamonds', '9'), createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.ThreeOfAKind);
  });

  it('detects two pair', () => {
    const cards = [
      createCard('hearts', 'Q'), createCard('diamonds', 'Q'), createCard('clubs', '8'),
      createCard('spades', '8'), createCard('hearts', 'A'), createCard('diamonds', '3'), createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.TwoPair);
  });

  it('detects one pair', () => {
    const cards = [
      createCard('hearts', '10'), createCard('diamonds', '10'), createCard('clubs', 'A'),
      createCard('spades', 'K'), createCard('hearts', '5'), createCard('diamonds', '3'), createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.OnePair);
  });

  it('detects high card', () => {
    const cards = [
      createCard('hearts', 'A'), createCard('diamonds', '10'), createCard('clubs', '8'),
      createCard('spades', '6'), createCard('hearts', '4'), createCard('diamonds', '3'), createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.HighCard);
  });
});

describe('compareHands', () => {
  it('flush beats straight', () => {
    const flush = [
      createCard('hearts', 'A'), createCard('hearts', '10'), createCard('hearts', '7'),
      createCard('hearts', '4'), createCard('hearts', '2'), createCard('clubs', 'K'), createCard('diamonds', '3'),
    ];
    const straight = [
      createCard('hearts', '8'), createCard('diamonds', '7'), createCard('clubs', '6'),
      createCard('spades', '5'), createCard('hearts', '4'), createCard('diamonds', 'K'), createCard('clubs', '2'),
    ];
    expect(compareHands(flush, straight)).toBeGreaterThan(0);
  });

  it('higher pair beats lower pair', () => {
    const pairKings = [
      createCard('hearts', 'K'), createCard('diamonds', 'K'), createCard('clubs', '5'),
      createCard('spades', '3'), createCard('hearts', '2'), createCard('diamonds', '9'), createCard('clubs', '7'),
    ];
    const pairTens = [
      createCard('hearts', '10'), createCard('diamonds', '10'), createCard('clubs', 'A'),
      createCard('spades', '3'), createCard('hearts', '2'), createCard('diamonds', '9'), createCard('clubs', '7'),
    ];
    expect(compareHands(pairKings, pairTens)).toBeGreaterThan(0);
  });

  it('returns 0 for identical hand ranks and kickers', () => {
    const hand1 = [
      createCard('hearts', 'A'), createCard('diamonds', 'K'), createCard('clubs', 'Q'),
      createCard('spades', 'J'), createCard('hearts', '9'), createCard('diamonds', '3'), createCard('clubs', '2'),
    ];
    const hand2 = [
      createCard('spades', 'A'), createCard('clubs', 'K'), createCard('hearts', 'Q'),
      createCard('diamonds', 'J'), createCard('clubs', '9'), createCard('hearts', '3'), createCard('spades', '2'),
    ];
    expect(compareHands(hand1, hand2)).toBe(0);
  });
});
