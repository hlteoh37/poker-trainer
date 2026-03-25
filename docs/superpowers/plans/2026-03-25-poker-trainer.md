# Poker Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based Texas Hold'em poker trainer with play mode, drill mode, and stats dashboard.

**Architecture:** Pure TypeScript game engine drives both play and drill modes. AI opponents use archetype-based decision tables at lower difficulties and precomputed GTO tables at higher. Monte Carlo equity calculation runs in a Web Worker. All state managed by Zustand, persisted to localStorage. Mobile-first responsive UI with dark theme.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Vitest, React Testing Library

---

## File Structure

```
poker/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── .github/workflows/deploy.yml
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── engine/
│   │   ├── card.ts              — Card, Suit, Rank types and utilities
│   │   ├── deck.ts              — Deck creation, shuffle, deal
│   │   ├── hand-eval.ts         — 7-card hand evaluation and ranking
│   │   ├── betting.ts           — Betting round logic, action validation
│   │   ├── pot.ts               — Pot and side pot calculation
│   │   ├── game.ts              — Game state machine orchestrating rounds
│   │   └── types.ts             — Shared engine types (GameState, Player, Action, etc.)
│   ├── ai/
│   │   ├── archetypes.ts        — TAG, LAG, TP, LP profiles with action weights
│   │   ├── hand-strength.ts     — Hand strength relative to board evaluation
│   │   ├── gto-tables.ts        — Precomputed GTO decision frequencies
│   │   ├── decision.ts          — AI decision engine combining archetype + difficulty
│   │   └── types.ts             — AI-specific types
│   ├── stats/
│   │   ├── equity.ts            — Monte Carlo equity calculation logic
│   │   ├── ev.ts                — Expected value computation for actions
│   │   ├── pot-odds.ts          — Pot odds calculation
│   │   ├── range.ts             — Opponent range estimation from actions
│   │   └── types.ts             — Stats types
│   ├── workers/
│   │   └── equity-worker.ts     — Web Worker for Monte Carlo simulation
│   ├── stores/
│   │   ├── game-store.ts        — Current hand/table state
│   │   ├── stats-store.ts       — Historical stats, drill results, progress
│   │   └── settings-store.ts    — User preferences, difficulty, table config
│   ├── data/
│   │   ├── preflop-ranges.ts    — Opening ranges by position
│   │   ├── hand-rankings.ts     — All 169 hand combos ranked
│   │   └── gto-frequencies.ts   — GTO frequencies for common spots
│   ├── components/
│   │   ├── common/
│   │   │   ├── Card.tsx         — Single card SVG component
│   │   │   ├── Button.tsx       — Styled action button
│   │   │   ├── NavBar.tsx       — Responsive top/bottom nav
│   │   │   └── Layout.tsx       — Page layout wrapper
│   │   ├── table/
│   │   │   ├── PokerTable.tsx   — Table felt, seat positions, pot display
│   │   │   ├── PlayerSeat.tsx   — Player name, cards, chips, status
│   │   │   ├── CommunityCards.tsx — Board cards display
│   │   │   └── ActionBar.tsx    — Fold/Call/Raise buttons and slider
│   │   ├── coaching/
│   │   │   ├── CoachingPanel.tsx — Main coaching overlay container
│   │   │   ├── EquityDisplay.tsx — Equity bar/percentage
│   │   │   ├── EvDisplay.tsx    — EV for each action
│   │   │   └── Recommendation.tsx — Recommended action with explanation
│   │   ├── drills/
│   │   │   ├── DrillSelector.tsx — Grid of available drill types
│   │   │   ├── PreflopDrill.tsx — Preflop hand decision drill
│   │   │   ├── PotOddsDrill.tsx — Pot odds calculation quiz
│   │   │   ├── EquityDrill.tsx  — Equity estimation drill
│   │   │   ├── PostflopDrill.tsx — Postflop scenario drill
│   │   │   └── DrillFeedback.tsx — Correct/incorrect feedback with explanation
│   │   └── dashboard/
│   │       ├── StatsOverview.tsx — Summary cards for key metrics
│   │       ├── AccuracyChart.tsx — Drill accuracy over time
│   │       ├── WinRateChart.tsx  — Play mode win rate trend
│   │       └── WeakSpots.tsx    — Identified weak areas with suggestions
│   └── pages/
│       ├── PlayPage.tsx         — Play mode page composing table + coaching
│       ├── DrillsPage.tsx       — Drill mode page with drill selector
│       └── StatsPage.tsx        — Stats dashboard page
└── tests/
    ├── engine/
    │   ├── card.test.ts
    │   ├── deck.test.ts
    │   ├── hand-eval.test.ts
    │   ├── betting.test.ts
    │   ├── pot.test.ts
    │   └── game.test.ts
    ├── ai/
    │   ├── archetypes.test.ts
    │   ├── hand-strength.test.ts
    │   └── decision.test.ts
    ├── stats/
    │   ├── equity.test.ts
    │   ├── ev.test.ts
    │   ├── pot-odds.test.ts
    │   └── range.test.ts
    └── components/
        ├── Card.test.tsx
        ├── ActionBar.test.tsx
        └── PreflopDrill.test.tsx
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Initialize Vite project**

```bash
cd /Users/hongteoh/Documents/claude/poker
npm create vite@latest . -- --template react-ts
```

Select: React, TypeScript

- [ ] **Step 2: Install dependencies**

```bash
npm install zustand
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Tailwind via Vite plugin**

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/poker/',
});
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
```

- [ ] **Step 5: Set up Tailwind CSS entry**

Replace `src/index.css`:

```css
@import "tailwindcss";
```

- [ ] **Step 6: Create minimal App shell**

Replace `src/App.tsx`:

```tsx
import { useState } from 'react';

type Page = 'play' | 'drills' | 'stats';

export default function App() {
  const [page, setPage] = useState<Page>('play');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-1 p-4">
        {page === 'play' && <div>Play Mode</div>}
        {page === 'drills' && <div>Drill Mode</div>}
        {page === 'stats' && <div>Stats</div>}
      </main>
      <nav className="flex justify-around bg-gray-800 p-3 md:hidden">
        <button
          className={`text-sm ${page === 'play' ? 'text-green-400' : 'text-gray-400'}`}
          onClick={() => setPage('play')}
        >
          Play
        </button>
        <button
          className={`text-sm ${page === 'drills' ? 'text-green-400' : 'text-gray-400'}`}
          onClick={() => setPage('drills')}
        >
          Drills
        </button>
        <button
          className={`text-sm ${page === 'stats' ? 'text-green-400' : 'text-gray-400'}`}
          onClick={() => setPage('stats')}
        >
          Stats
        </button>
      </nav>
    </div>
  );
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: App loads at localhost:5173 with dark background and bottom nav.

- [ ] **Step 8: Verify tests run**

```bash
npx vitest run
```

Expected: Vitest runs with no test files found (no failures).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with Vite, React, TypeScript, Tailwind, Vitest"
```

---

## Task 2: Card Types and Deck

**Files:**
- Create: `src/engine/card.ts`, `src/engine/deck.ts`, `src/engine/types.ts`
- Test: `tests/engine/card.test.ts`, `tests/engine/deck.test.ts`

- [ ] **Step 1: Write failing tests for card utilities**

Create `tests/engine/card.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/engine/card.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement card types and utilities**

Create `src/engine/types.ts`:

```ts
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface PlayerAction {
  type: ActionType;
  amount?: number;
}

export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river';

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: [Card, Card] | null;
  position: Position;
  currentBet: number;
  hasFolded: boolean;
  isAllIn: boolean;
  isHuman: boolean;
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: { amount: number; eligiblePlayerIds: string[] }[];
  currentBettingRound: BettingRound;
  currentPlayerIndex: number;
  dealerIndex: number;
  deck: Card[];
  smallBlind: number;
  bigBlind: number;
  isHandComplete: boolean;
  winners: { playerId: string; amount: number }[];
}
```

Create `src/engine/card.ts`:

```ts
import type { Card, Suit, Rank } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export function createCard(suit: Suit, rank: Rank): Card {
  return { suit, rank };
}

export function cardToString(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

export function rankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return values[rank];
}
```

- [ ] **Step 4: Run card tests to verify they pass**

```bash
npx vitest run tests/engine/card.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Write failing tests for deck**

Create `tests/engine/deck.test.ts`:

```ts
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
```

- [ ] **Step 6: Run deck tests to verify they fail**

```bash
npx vitest run tests/engine/deck.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement deck**

Create `src/engine/deck.ts`:

```ts
import type { Card } from './types';
import { SUITS, RANKS, createCard } from './card';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  if (count > deck.length) {
    throw new Error('Not enough cards in deck');
  }
  return {
    dealt: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}
```

- [ ] **Step 8: Run all engine tests**

```bash
npx vitest run tests/engine/
```

Expected: All PASS.

- [ ] **Step 9: Commit**

```bash
git add src/engine/types.ts src/engine/card.ts src/engine/deck.ts tests/engine/card.test.ts tests/engine/deck.test.ts
git commit -m "feat: add card types, utilities, and deck with shuffle/deal"
```

---

## Task 3: Hand Evaluation

**Files:**
- Create: `src/engine/hand-eval.ts`
- Test: `tests/engine/hand-eval.test.ts`

- [ ] **Step 1: Write failing tests for hand evaluation**

Create `tests/engine/hand-eval.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { evaluateHand, compareHands, HandRank } from '../../src/engine/hand-eval';
import { createCard } from '../../src/engine/card';

describe('evaluateHand', () => {
  it('detects royal flush', () => {
    const cards = [
      createCard('spades', 'A'),
      createCard('spades', 'K'),
      createCard('spades', 'Q'),
      createCard('spades', 'J'),
      createCard('spades', '10'),
      createCard('hearts', '2'),
      createCard('diamonds', '3'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.RoyalFlush);
  });

  it('detects straight flush', () => {
    const cards = [
      createCard('hearts', '9'),
      createCard('hearts', '8'),
      createCard('hearts', '7'),
      createCard('hearts', '6'),
      createCard('hearts', '5'),
      createCard('clubs', 'A'),
      createCard('diamonds', 'K'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.StraightFlush);
  });

  it('detects four of a kind', () => {
    const cards = [
      createCard('hearts', 'K'),
      createCard('diamonds', 'K'),
      createCard('clubs', 'K'),
      createCard('spades', 'K'),
      createCard('hearts', '2'),
      createCard('diamonds', '5'),
      createCard('clubs', '8'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FourOfAKind);
  });

  it('detects full house', () => {
    const cards = [
      createCard('hearts', 'J'),
      createCard('diamonds', 'J'),
      createCard('clubs', 'J'),
      createCard('spades', '9'),
      createCard('hearts', '9'),
      createCard('diamonds', '2'),
      createCard('clubs', '5'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.FullHouse);
  });

  it('detects flush', () => {
    const cards = [
      createCard('hearts', 'A'),
      createCard('hearts', '10'),
      createCard('hearts', '7'),
      createCard('hearts', '4'),
      createCard('hearts', '2'),
      createCard('clubs', 'K'),
      createCard('diamonds', 'Q'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Flush);
  });

  it('detects straight', () => {
    const cards = [
      createCard('hearts', '8'),
      createCard('diamonds', '7'),
      createCard('clubs', '6'),
      createCard('spades', '5'),
      createCard('hearts', '4'),
      createCard('diamonds', 'K'),
      createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Straight);
  });

  it('detects ace-low straight (wheel)', () => {
    const cards = [
      createCard('hearts', 'A'),
      createCard('diamonds', '2'),
      createCard('clubs', '3'),
      createCard('spades', '4'),
      createCard('hearts', '5'),
      createCard('diamonds', 'K'),
      createCard('clubs', '9'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.Straight);
  });

  it('detects three of a kind', () => {
    const cards = [
      createCard('hearts', '7'),
      createCard('diamonds', '7'),
      createCard('clubs', '7'),
      createCard('spades', 'K'),
      createCard('hearts', '3'),
      createCard('diamonds', '9'),
      createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.ThreeOfAKind);
  });

  it('detects two pair', () => {
    const cards = [
      createCard('hearts', 'Q'),
      createCard('diamonds', 'Q'),
      createCard('clubs', '8'),
      createCard('spades', '8'),
      createCard('hearts', 'A'),
      createCard('diamonds', '3'),
      createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.TwoPair);
  });

  it('detects one pair', () => {
    const cards = [
      createCard('hearts', '10'),
      createCard('diamonds', '10'),
      createCard('clubs', 'A'),
      createCard('spades', 'K'),
      createCard('hearts', '5'),
      createCard('diamonds', '3'),
      createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.OnePair);
  });

  it('detects high card', () => {
    const cards = [
      createCard('hearts', 'A'),
      createCard('diamonds', '10'),
      createCard('clubs', '8'),
      createCard('spades', '6'),
      createCard('hearts', '4'),
      createCard('diamonds', '3'),
      createCard('clubs', '2'),
    ];
    const result = evaluateHand(cards);
    expect(result.rank).toBe(HandRank.HighCard);
  });
});

describe('compareHands', () => {
  it('flush beats straight', () => {
    const flush = [
      createCard('hearts', 'A'),
      createCard('hearts', '10'),
      createCard('hearts', '7'),
      createCard('hearts', '4'),
      createCard('hearts', '2'),
      createCard('clubs', 'K'),
      createCard('diamonds', '3'),
    ];
    const straight = [
      createCard('hearts', '8'),
      createCard('diamonds', '7'),
      createCard('clubs', '6'),
      createCard('spades', '5'),
      createCard('hearts', '4'),
      createCard('diamonds', 'K'),
      createCard('clubs', '2'),
    ];
    expect(compareHands(flush, straight)).toBeGreaterThan(0);
  });

  it('higher pair beats lower pair', () => {
    const pairKings = [
      createCard('hearts', 'K'),
      createCard('diamonds', 'K'),
      createCard('clubs', '5'),
      createCard('spades', '3'),
      createCard('hearts', '2'),
      createCard('diamonds', '9'),
      createCard('clubs', '7'),
    ];
    const pairTens = [
      createCard('hearts', '10'),
      createCard('diamonds', '10'),
      createCard('clubs', 'A'),
      createCard('spades', '3'),
      createCard('hearts', '2'),
      createCard('diamonds', '9'),
      createCard('clubs', '7'),
    ];
    expect(compareHands(pairKings, pairTens)).toBeGreaterThan(0);
  });

  it('returns 0 for identical hand ranks and kickers', () => {
    const hand1 = [
      createCard('hearts', 'A'),
      createCard('diamonds', 'K'),
      createCard('clubs', 'Q'),
      createCard('spades', 'J'),
      createCard('hearts', '9'),
      createCard('diamonds', '3'),
      createCard('clubs', '2'),
    ];
    const hand2 = [
      createCard('spades', 'A'),
      createCard('clubs', 'K'),
      createCard('hearts', 'Q'),
      createCard('diamonds', 'J'),
      createCard('clubs', '9'),
      createCard('hearts', '3'),
      createCard('spades', '2'),
    ];
    expect(compareHands(hand1, hand2)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/engine/hand-eval.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement hand evaluation**

Create `src/engine/hand-eval.ts`:

```ts
import type { Card } from './types';
import { rankValue } from './card';

export enum HandRank {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

export interface HandResult {
  rank: HandRank;
  values: number[]; // Tiebreaker values, highest first
  bestCards: Card[];
}

function getCombinations(cards: Card[], size: number): Card[][] {
  if (size === 0) return [[]];
  if (cards.length < size) return [];
  const [first, ...rest] = cards;
  const withFirst = getCombinations(rest, size - 1).map((combo) => [first, ...combo]);
  const withoutFirst = getCombinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

function evaluateFive(cards: Card[]): HandResult {
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  const values = sorted.map((c) => rankValue(c.rank));

  const isFlush = sorted.every((c) => c.suit === sorted[0].suit);

  let isStraight = false;
  let straightHighValue = 0;

  // Check normal straight
  if (
    values[0] - values[1] === 1 &&
    values[1] - values[2] === 1 &&
    values[2] - values[3] === 1 &&
    values[3] - values[4] === 1
  ) {
    isStraight = true;
    straightHighValue = values[0];
  }

  // Check ace-low straight (A-2-3-4-5)
  if (!isStraight && values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
    isStraight = true;
    straightHighValue = 5; // 5-high straight
  }

  // Count ranks
  const rankCounts = new Map<number, number>();
  for (const v of values) {
    rankCounts.set(v, (rankCounts.get(v) ?? 0) + 1);
  }
  const counts = [...rankCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // By count desc
    return b[0] - a[0]; // By rank desc
  });

  if (isFlush && isStraight) {
    const rank = straightHighValue === 14 ? HandRank.RoyalFlush : HandRank.StraightFlush;
    return { rank, values: [straightHighValue], bestCards: sorted };
  }

  if (counts[0][1] === 4) {
    return {
      rank: HandRank.FourOfAKind,
      values: [counts[0][0], counts[1][0]],
      bestCards: sorted,
    };
  }

  if (counts[0][1] === 3 && counts[1][1] === 2) {
    return {
      rank: HandRank.FullHouse,
      values: [counts[0][0], counts[1][0]],
      bestCards: sorted,
    };
  }

  if (isFlush) {
    return { rank: HandRank.Flush, values, bestCards: sorted };
  }

  if (isStraight) {
    return { rank: HandRank.Straight, values: [straightHighValue], bestCards: sorted };
  }

  if (counts[0][1] === 3) {
    const kickers = counts.filter((c) => c[1] === 1).map((c) => c[0]);
    return {
      rank: HandRank.ThreeOfAKind,
      values: [counts[0][0], ...kickers],
      bestCards: sorted,
    };
  }

  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const pairs = [counts[0][0], counts[1][0]].sort((a, b) => b - a);
    const kicker = counts.find((c) => c[1] === 1)![0];
    return {
      rank: HandRank.TwoPair,
      values: [...pairs, kicker],
      bestCards: sorted,
    };
  }

  if (counts[0][1] === 2) {
    const kickers = counts.filter((c) => c[1] === 1).map((c) => c[0]).sort((a, b) => b - a);
    return {
      rank: HandRank.OnePair,
      values: [counts[0][0], ...kickers],
      bestCards: sorted,
    };
  }

  return { rank: HandRank.HighCard, values, bestCards: sorted };
}

export function evaluateHand(cards: Card[]): HandResult {
  const combos = getCombinations(cards, 5);
  let best: HandResult | null = null;

  for (const combo of combos) {
    const result = evaluateFive(combo);
    if (!best || compareResults(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

function compareResults(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) return a.values[i] - b.values[i];
  }
  return 0;
}

export function compareHands(handA: Card[], handB: Card[]): number {
  const resultA = evaluateHand(handA);
  const resultB = evaluateHand(handB);
  return compareResults(resultA, resultB);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/engine/hand-eval.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/hand-eval.ts tests/engine/hand-eval.test.ts
git commit -m "feat: add hand evaluation with all poker hand rankings"
```

---

## Task 4: Betting Logic

**Files:**
- Create: `src/engine/betting.ts`, `src/engine/pot.ts`
- Test: `tests/engine/betting.test.ts`, `tests/engine/pot.test.ts`

- [ ] **Step 1: Write failing tests for betting**

Create `tests/engine/betting.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getValidActions, applyAction } from '../../src/engine/betting';
import type { GameState, Player } from '../../src/engine/types';
import { createCard } from '../../src/engine/card';

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Player 1',
    chips: 1000,
    holeCards: [createCard('hearts', 'A'), createCard('spades', 'K')],
    position: 'BTN',
    currentBet: 0,
    hasFolded: false,
    isAllIn: false,
    isHuman: true,
    ...overrides,
  };
}

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [
      makePlayer({ id: 'p1', position: 'SB', currentBet: 5, chips: 995 }),
      makePlayer({ id: 'p2', position: 'BB', currentBet: 10, chips: 990, isHuman: false }),
      makePlayer({ id: 'p3', position: 'BTN', chips: 1000, isHuman: false }),
    ],
    communityCards: [],
    pot: 15,
    sidePots: [],
    currentBettingRound: 'preflop',
    currentPlayerIndex: 2,
    dealerIndex: 2,
    deck: [],
    smallBlind: 5,
    bigBlind: 10,
    isHandComplete: false,
    winners: [],
    ...overrides,
  };
}

describe('getValidActions', () => {
  it('allows fold, call, raise when facing a bet', () => {
    const state = makeGameState();
    const actions = getValidActions(state);
    const types = actions.map((a) => a.type);
    expect(types).toContain('fold');
    expect(types).toContain('call');
    expect(types).toContain('raise');
  });

  it('allows check when no bet to call', () => {
    const state = makeGameState({
      currentBettingRound: 'flop',
      players: [
        makePlayer({ id: 'p1', position: 'SB', currentBet: 0 }),
        makePlayer({ id: 'p2', position: 'BB', currentBet: 0, isHuman: false }),
      ],
      currentPlayerIndex: 0,
      pot: 20,
    });
    const actions = getValidActions(state);
    const types = actions.map((a) => a.type);
    expect(types).toContain('check');
    expect(types).not.toContain('call');
  });

  it('includes all-in when raise would exceed chips', () => {
    const state = makeGameState({
      players: [
        makePlayer({ id: 'p1', position: 'SB', currentBet: 0, chips: 15 }),
        makePlayer({ id: 'p2', position: 'BB', currentBet: 10, chips: 990, isHuman: false }),
      ],
      currentPlayerIndex: 0,
      pot: 10,
    });
    const actions = getValidActions(state);
    const types = actions.map((a) => a.type);
    expect(types).toContain('all-in');
  });
});

describe('applyAction', () => {
  it('fold marks player as folded', () => {
    const state = makeGameState();
    const next = applyAction(state, { type: 'fold' });
    expect(next.players[2].hasFolded).toBe(true);
  });

  it('call matches the current highest bet', () => {
    const state = makeGameState();
    const next = applyAction(state, { type: 'call' });
    expect(next.players[2].currentBet).toBe(10);
    expect(next.players[2].chips).toBe(990);
    expect(next.pot).toBe(25);
  });

  it('raise increases the bet', () => {
    const state = makeGameState();
    const next = applyAction(state, { type: 'raise', amount: 30 });
    expect(next.players[2].currentBet).toBe(30);
    expect(next.players[2].chips).toBe(970);
    expect(next.pot).toBe(45);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/engine/betting.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement betting logic**

Create `src/engine/betting.ts`:

```ts
import type { GameState, PlayerAction } from './types';

export interface ValidAction {
  type: PlayerAction['type'];
  minAmount?: number;
  maxAmount?: number;
}

export function getValidActions(state: GameState): ValidAction[] {
  const player = state.players[state.currentPlayerIndex];
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  const toCall = highestBet - player.currentBet;
  const actions: ValidAction[] = [];

  if (toCall > 0) {
    actions.push({ type: 'fold' });

    if (toCall >= player.chips) {
      actions.push({ type: 'all-in' });
    } else {
      actions.push({ type: 'call' });
      const minRaise = highestBet + state.bigBlind;
      if (minRaise <= player.chips + player.currentBet) {
        actions.push({
          type: 'raise',
          minAmount: minRaise,
          maxAmount: player.chips + player.currentBet,
        });
      } else {
        actions.push({ type: 'all-in' });
      }
    }
  } else {
    actions.push({ type: 'check' });
    const minRaise = highestBet + state.bigBlind;
    if (minRaise <= player.chips + player.currentBet) {
      actions.push({
        type: 'raise',
        minAmount: minRaise,
        maxAmount: player.chips + player.currentBet,
      });
    }
  }

  return actions;
}

export function applyAction(state: GameState, action: PlayerAction): GameState {
  const next: GameState = {
    ...state,
    players: state.players.map((p) => ({ ...p })),
  };
  const player = next.players[next.currentPlayerIndex];
  const highestBet = Math.max(...state.players.map((p) => p.currentBet));

  switch (action.type) {
    case 'fold':
      player.hasFolded = true;
      break;

    case 'check':
      break;

    case 'call': {
      const toCall = highestBet - player.currentBet;
      const actualCall = Math.min(toCall, player.chips);
      player.chips -= actualCall;
      player.currentBet += actualCall;
      next.pot += actualCall;
      if (player.chips === 0) player.isAllIn = true;
      break;
    }

    case 'raise': {
      const amount = action.amount!;
      const increase = amount - player.currentBet;
      player.chips -= increase;
      next.pot += increase;
      player.currentBet = amount;
      if (player.chips === 0) player.isAllIn = true;
      break;
    }

    case 'all-in': {
      const allInAmount = player.chips;
      next.pot += allInAmount;
      player.currentBet += allInAmount;
      player.chips = 0;
      player.isAllIn = true;
      break;
    }
  }

  return next;
}
```

- [ ] **Step 4: Run betting tests**

```bash
npx vitest run tests/engine/betting.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Write failing tests for pot calculation**

Create `tests/engine/pot.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateSidePots } from '../../src/engine/pot';
import type { Player } from '../../src/engine/types';
import { createCard } from '../../src/engine/card';

function makePlayer(id: string, currentBet: number, isAllIn: boolean, hasFolded = false): Player {
  return {
    id,
    name: id,
    chips: isAllIn ? 0 : 1000,
    holeCards: [createCard('hearts', 'A'), createCard('spades', 'K')],
    position: 'BTN',
    currentBet,
    hasFolded,
    isAllIn,
    isHuman: false,
  };
}

describe('calculateSidePots', () => {
  it('returns single pot when no all-ins', () => {
    const players = [
      makePlayer('p1', 100, false),
      makePlayer('p2', 100, false),
      makePlayer('p3', 100, false),
    ];
    const pots = calculateSidePots(players);
    expect(pots).toEqual([{ amount: 300, eligiblePlayerIds: ['p1', 'p2', 'p3'] }]);
  });

  it('creates side pot when player is all-in for less', () => {
    const players = [
      makePlayer('p1', 50, true),   // all-in for 50
      makePlayer('p2', 100, false),
      makePlayer('p3', 100, false),
    ];
    const pots = calculateSidePots(players);
    expect(pots).toHaveLength(2);
    expect(pots[0]).toEqual({ amount: 150, eligiblePlayerIds: ['p1', 'p2', 'p3'] });
    expect(pots[1]).toEqual({ amount: 100, eligiblePlayerIds: ['p2', 'p3'] });
  });

  it('excludes folded players from pot eligibility', () => {
    const players = [
      makePlayer('p1', 50, false, true), // folded
      makePlayer('p2', 100, false),
      makePlayer('p3', 100, false),
    ];
    const pots = calculateSidePots(players);
    expect(pots).toEqual([{ amount: 250, eligiblePlayerIds: ['p2', 'p3'] }]);
  });
});
```

- [ ] **Step 6: Run pot tests to verify they fail**

```bash
npx vitest run tests/engine/pot.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement pot calculation**

Create `src/engine/pot.ts`:

```ts
import type { Player } from './types';

export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export function calculateSidePots(players: Player[]): SidePot[] {
  const activePlayers = players.filter((p) => !p.hasFolded);
  const allInAmounts = [...new Set(
    players.filter((p) => p.isAllIn).map((p) => p.currentBet)
  )].sort((a, b) => a - b);

  if (allInAmounts.length === 0) {
    const total = players.reduce((sum, p) => sum + p.currentBet, 0);
    return [{ amount: total, eligiblePlayerIds: activePlayers.map((p) => p.id) }];
  }

  const pots: SidePot[] = [];
  let previousLevel = 0;

  for (const level of allInAmounts) {
    const contribution = level - previousLevel;
    const contributors = players.filter((p) => p.currentBet > previousLevel);
    const eligible = contributors.filter((p) => !p.hasFolded);
    const amount = contribution * contributors.length;

    if (amount > 0) {
      pots.push({ amount, eligiblePlayerIds: eligible.map((p) => p.id) });
    }
    previousLevel = level;
  }

  // Remaining pot above highest all-in
  const maxAllIn = allInAmounts[allInAmounts.length - 1];
  const remainingContributors = players.filter((p) => p.currentBet > maxAllIn);
  if (remainingContributors.length > 0) {
    const remaining = remainingContributors.reduce(
      (sum, p) => sum + (p.currentBet - maxAllIn),
      0
    );
    const eligible = remainingContributors.filter((p) => !p.hasFolded);
    if (remaining > 0) {
      pots.push({ amount: remaining, eligiblePlayerIds: eligible.map((p) => p.id) });
    }
  }

  return pots;
}
```

- [ ] **Step 8: Run all engine tests**

```bash
npx vitest run tests/engine/
```

Expected: All PASS.

- [ ] **Step 9: Commit**

```bash
git add src/engine/betting.ts src/engine/pot.ts tests/engine/betting.test.ts tests/engine/pot.test.ts
git commit -m "feat: add betting logic and side pot calculation"
```

---

## Task 5: Game State Machine

**Files:**
- Create: `src/engine/game.ts`
- Test: `tests/engine/game.test.ts`

- [ ] **Step 1: Write failing tests for game orchestration**

Create `tests/engine/game.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createGame, startHand, advanceToNextPlayer, isRoundComplete, advanceRound } from '../../src/engine/game';

describe('createGame', () => {
  it('creates a game with specified number of players', () => {
    const state = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    expect(state.players).toHaveLength(3);
    expect(state.players[0].isHuman).toBe(true);
    expect(state.players[1].isHuman).toBe(false);
    expect(state.players[2].isHuman).toBe(false);
    expect(state.smallBlind).toBe(5);
    expect(state.bigBlind).toBe(10);
  });
});

describe('startHand', () => {
  it('deals hole cards and posts blinds', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players.forEach((p) => {
      expect(p.holeCards).not.toBeNull();
      expect(p.holeCards).toHaveLength(2);
    });
    expect(state.pot).toBe(15); // SB + BB
    expect(state.currentBettingRound).toBe('preflop');
    expect(state.deck).toHaveLength(52 - 6); // 3 players * 2 cards
  });
});

describe('advanceToNextPlayer', () => {
  it('skips folded players', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players[1].hasFolded = true;
    state.currentPlayerIndex = 0;
    const next = advanceToNextPlayer(state);
    expect(next.currentPlayerIndex).toBe(2);
  });

  it('skips all-in players', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players[1].isAllIn = true;
    state.currentPlayerIndex = 0;
    const next = advanceToNextPlayer(state);
    expect(next.currentPlayerIndex).toBe(2);
  });
});

describe('isRoundComplete', () => {
  it('returns true when all active players have matched the highest bet', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    // Simulate both players at 10
    state.players[0].currentBet = 10;
    state.players[0].chips = 990;
    state.players[1].currentBet = 10;
    state.players[1].chips = 990;
    expect(isRoundComplete(state)).toBe(true);
  });
});

describe('advanceRound', () => {
  it('deals 3 community cards on flop', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.players.forEach((p) => { p.currentBet = 10; p.chips = 990; });
    const next = advanceRound(state);
    expect(next.currentBettingRound).toBe('flop');
    expect(next.communityCards).toHaveLength(3);
  });

  it('deals 1 community card on turn', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    let state = startHand(game);
    state.players.forEach((p) => { p.currentBet = 10; p.chips = 990; });
    state = advanceRound(state); // flop
    state.players.forEach((p) => { p.currentBet = 0; });
    state = advanceRound(state); // turn
    expect(state.currentBettingRound).toBe('turn');
    expect(state.communityCards).toHaveLength(4);
  });

  it('deals 1 community card on river', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 1, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    let state = startHand(game);
    state.players.forEach((p) => { p.currentBet = 10; p.chips = 990; });
    state = advanceRound(state); // flop
    state.players.forEach((p) => { p.currentBet = 0; });
    state = advanceRound(state); // turn
    state.players.forEach((p) => { p.currentBet = 0; });
    state = advanceRound(state); // river
    expect(state.currentBettingRound).toBe('river');
    expect(state.communityCards).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/engine/game.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement game state machine**

Create `src/engine/game.ts`:

```ts
import type { GameState, Player, Position, Card } from './types';
import { createDeck, shuffleDeck, dealCards } from './deck';

const POSITIONS_BY_SIZE: Record<number, Position[]> = {
  2: ['SB', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'CO', 'SB', 'BB'],
  5: ['BTN', 'CO', 'MP', 'SB', 'BB'],
  6: ['BTN', 'CO', 'MP', 'UTG', 'SB', 'BB'],
};

interface CreateGameOptions {
  humanName: string;
  aiCount: number;
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
}

export function createGame(options: CreateGameOptions): GameState {
  const totalPlayers = options.aiCount + 1;
  const positions = POSITIONS_BY_SIZE[totalPlayers] ?? POSITIONS_BY_SIZE[6];

  const players: Player[] = [];
  for (let i = 0; i < totalPlayers; i++) {
    players.push({
      id: `player-${i}`,
      name: i === 0 ? options.humanName : `Bot ${i}`,
      chips: options.startingChips,
      holeCards: null,
      position: positions[i % positions.length],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
      isHuman: i === 0,
    });
  }

  return {
    players,
    communityCards: [],
    pot: 0,
    sidePots: [],
    currentBettingRound: 'preflop',
    currentPlayerIndex: 0,
    dealerIndex: 0,
    deck: [],
    smallBlind: options.smallBlind,
    bigBlind: options.bigBlind,
    isHandComplete: false,
    winners: [],
  };
}

export function startHand(gameState: GameState): GameState {
  const deck = shuffleDeck(createDeck());
  const players = gameState.players.map((p) => ({
    ...p,
    holeCards: null as [Card, Card] | null,
    currentBet: 0,
    hasFolded: false,
    isAllIn: false,
  }));

  let remaining = deck;
  for (let i = 0; i < players.length; i++) {
    const result = dealCards(remaining, 2);
    players[i].holeCards = result.dealt as [Card, Card];
    remaining = result.remaining;
  }

  // Post blinds
  const sbIndex = players.findIndex((p) => p.position === 'SB');
  const bbIndex = players.findIndex((p) => p.position === 'BB');

  const sbAmount = Math.min(gameState.smallBlind, players[sbIndex].chips);
  players[sbIndex].chips -= sbAmount;
  players[sbIndex].currentBet = sbAmount;

  const bbAmount = Math.min(gameState.bigBlind, players[bbIndex].chips);
  players[bbIndex].chips -= bbAmount;
  players[bbIndex].currentBet = bbAmount;

  // First to act preflop is after BB
  const firstToAct = (bbIndex + 1) % players.length;

  return {
    ...gameState,
    players,
    deck: remaining,
    communityCards: [],
    pot: sbAmount + bbAmount,
    sidePots: [],
    currentBettingRound: 'preflop',
    currentPlayerIndex: firstToAct,
    isHandComplete: false,
    winners: [],
  };
}

export function advanceToNextPlayer(state: GameState): GameState {
  const n = state.players.length;
  let nextIndex = (state.currentPlayerIndex + 1) % n;
  let checked = 0;

  while (checked < n) {
    const player = state.players[nextIndex];
    if (!player.hasFolded && !player.isAllIn) {
      return { ...state, currentPlayerIndex: nextIndex };
    }
    nextIndex = (nextIndex + 1) % n;
    checked++;
  }

  return { ...state, currentPlayerIndex: state.currentPlayerIndex };
}

export function isRoundComplete(state: GameState): boolean {
  const activePlayers = state.players.filter((p) => !p.hasFolded && !p.isAllIn);
  if (activePlayers.length === 0) return true;

  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  return activePlayers.every((p) => p.currentBet === highestBet);
}

export function advanceRound(state: GameState): GameState {
  const next = {
    ...state,
    players: state.players.map((p) => ({ ...p, currentBet: 0 })),
  };

  let cardsToDeal: number;
  switch (state.currentBettingRound) {
    case 'preflop':
      next.currentBettingRound = 'flop';
      cardsToDeal = 3;
      break;
    case 'flop':
      next.currentBettingRound = 'turn';
      cardsToDeal = 1;
      break;
    case 'turn':
      next.currentBettingRound = 'river';
      cardsToDeal = 1;
      break;
    case 'river':
      next.isHandComplete = true;
      return next;
    default:
      return next;
  }

  const { dealt, remaining } = dealCards(next.deck, cardsToDeal);
  next.communityCards = [...state.communityCards, ...dealt];
  next.deck = remaining;

  // First to act postflop is SB (or first active after dealer)
  const sbIndex = next.players.findIndex((p) => p.position === 'SB');
  let firstToAct = sbIndex;
  let checked = 0;
  while (checked < next.players.length) {
    const p = next.players[firstToAct];
    if (!p.hasFolded && !p.isAllIn) break;
    firstToAct = (firstToAct + 1) % next.players.length;
    checked++;
  }
  next.currentPlayerIndex = firstToAct;

  return next;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/engine/game.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/game.ts tests/engine/game.test.ts
git commit -m "feat: add game state machine with hand setup and round progression"
```

---

## Task 6: Hand Strength and AI Archetypes

**Files:**
- Create: `src/ai/types.ts`, `src/ai/hand-strength.ts`, `src/ai/archetypes.ts`, `src/ai/decision.ts`
- Test: `tests/ai/hand-strength.test.ts`, `tests/ai/archetypes.test.ts`, `tests/ai/decision.test.ts`

- [ ] **Step 1: Write failing tests for hand strength**

Create `tests/ai/hand-strength.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateHandStrength } from '../../src/ai/hand-strength';
import { createCard } from '../../src/engine/card';

describe('calculateHandStrength', () => {
  it('rates pocket aces as very strong preflop', () => {
    const holeCards = [createCard('hearts', 'A'), createCard('spades', 'A')] as [import('../../src/engine/types').Card, import('../../src/engine/types').Card];
    const strength = calculateHandStrength(holeCards, []);
    expect(strength).toBeGreaterThan(0.8);
  });

  it('rates 7-2 offsuit as very weak preflop', () => {
    const holeCards = [createCard('hearts', '7'), createCard('spades', '2')] as [import('../../src/engine/types').Card, import('../../src/engine/types').Card];
    const strength = calculateHandStrength(holeCards, []);
    expect(strength).toBeLessThan(0.4);
  });

  it('returns strength between 0 and 1', () => {
    const holeCards = [createCard('hearts', 'K'), createCard('diamonds', 'Q')] as [import('../../src/engine/types').Card, import('../../src/engine/types').Card];
    const strength = calculateHandStrength(holeCards, []);
    expect(strength).toBeGreaterThanOrEqual(0);
    expect(strength).toBeLessThanOrEqual(1);
  });

  it('evaluates postflop hand strength with community cards', () => {
    const holeCards = [createCard('hearts', 'A'), createCard('hearts', 'K')] as [import('../../src/engine/types').Card, import('../../src/engine/types').Card];
    const community = [
      createCard('hearts', 'Q'),
      createCard('hearts', 'J'),
      createCard('hearts', '10'),
    ];
    const strength = calculateHandStrength(holeCards, community);
    expect(strength).toBeGreaterThan(0.95); // Royal flush
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/ai/hand-strength.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AI types**

Create `src/ai/types.ts`:

```ts
export type ArchetypeId = 'TAG' | 'LAG' | 'TP' | 'LP';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ArchetypeProfile {
  id: ArchetypeId;
  name: string;
  vpip: number;          // Voluntarily Put $ In Pot (0-1), how often they play hands
  pfr: number;           // Preflop Raise (0-1), how often they raise preflop
  aggression: number;    // Postflop aggression (0-1)
  bluffFrequency: number; // How often they bluff (0-1)
  foldToRaise: number;   // How often they fold to a raise (0-1)
}

export interface AIConfig {
  archetype: ArchetypeId;
  difficulty: Difficulty;
}
```

- [ ] **Step 4: Implement hand strength calculator**

Create `src/ai/hand-strength.ts`:

```ts
import type { Card } from '../engine/types';
import { rankValue } from '../engine/card';
import { evaluateHand, HandRank } from '../engine/hand-eval';
import { createDeck } from '../engine/deck';

export function calculateHandStrength(holeCards: [Card, Card], communityCards: Card[]): number {
  if (communityCards.length === 0) {
    return preflopStrength(holeCards);
  }
  return postflopStrength(holeCards, communityCards);
}

function preflopStrength(holeCards: [Card, Card]): number {
  const [c1, c2] = holeCards;
  const r1 = rankValue(c1.rank);
  const r2 = rankValue(c2.rank);
  const high = Math.max(r1, r2);
  const low = Math.min(r1, r2);
  const isPair = r1 === r2;
  const isSuited = c1.suit === c2.suit;
  const gap = high - low;

  let score = 0;

  // Base score from high card (2-14 mapped to 0-1)
  score += (high - 2) / 12 * 0.3;

  // Pair bonus
  if (isPair) {
    score += 0.3 + (high - 2) / 12 * 0.2;
  } else {
    // Second card contribution
    score += (low - 2) / 12 * 0.15;
  }

  // Suited bonus
  if (isSuited) score += 0.05;

  // Connectedness bonus (smaller gap = better)
  if (gap <= 2) score += 0.05;
  if (gap === 1) score += 0.03;

  return Math.min(1, Math.max(0, score));
}

function postflopStrength(holeCards: [Card, Card], communityCards: Card[]): number {
  const allCards = [...holeCards, ...communityCards];
  const ourResult = evaluateHand(allCards);

  // Quick Monte Carlo: sample opponent hands to estimate relative strength
  const deck = createDeck().filter(
    (c) => !allCards.some((ac) => ac.rank === c.rank && ac.suit === c.suit)
  );

  const iterations = 200;
  let wins = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    // Random opponent hole cards
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    const oppHole = shuffled.slice(0, 2);
    const oppCards = [...oppHole, ...communityCards];
    const oppResult = evaluateHand(oppCards);

    const cmp = compareResults(ourResult, oppResult);
    if (cmp > 0) wins++;
    else if (cmp === 0) ties++;
  }

  return (wins + ties * 0.5) / iterations;
}

function compareResults(
  a: { rank: HandRank; values: number[] },
  b: { rank: HandRank; values: number[] },
): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) return a.values[i] - b.values[i];
  }
  return 0;
}
```

- [ ] **Step 5: Run hand strength tests**

```bash
npx vitest run tests/ai/hand-strength.test.ts
```

Expected: All PASS.

- [ ] **Step 6: Write failing tests for archetypes and decision**

Create `tests/ai/archetypes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getArchetype, ARCHETYPES } from '../../src/ai/archetypes';

describe('ARCHETYPES', () => {
  it('has 4 archetypes', () => {
    expect(Object.keys(ARCHETYPES)).toHaveLength(4);
  });

  it('TAG has low VPIP and high aggression', () => {
    const tag = ARCHETYPES.TAG;
    expect(tag.vpip).toBeLessThan(0.3);
    expect(tag.aggression).toBeGreaterThan(0.6);
  });

  it('LP has high VPIP and low aggression', () => {
    const lp = ARCHETYPES.LP;
    expect(lp.vpip).toBeGreaterThan(0.5);
    expect(lp.aggression).toBeLessThan(0.4);
  });
});

describe('getArchetype', () => {
  it('returns the matching archetype profile', () => {
    const tag = getArchetype('TAG');
    expect(tag.id).toBe('TAG');
    expect(tag.name).toBe('Tight-Aggressive');
  });
});
```

Create `tests/ai/decision.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { makeAIDecision } from '../../src/ai/decision';
import type { GameState } from '../../src/engine/types';
import { createGame, startHand } from '../../src/engine/game';

describe('makeAIDecision', () => {
  it('returns a valid action type', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    // Set current player to an AI
    state.currentPlayerIndex = 1;
    const action = makeAIDecision(state, { archetype: 'TAG', difficulty: 'beginner' });
    expect(['fold', 'check', 'call', 'raise', 'all-in']).toContain(action.type);
  });

  it('never returns an invalid action', () => {
    const game = createGame({ humanName: 'Hero', aiCount: 2, startingChips: 1000, smallBlind: 5, bigBlind: 10 });
    const state = startHand(game);
    state.currentPlayerIndex = 1;
    // Run multiple times to test randomness
    for (let i = 0; i < 50; i++) {
      const action = makeAIDecision(state, { archetype: 'LAG', difficulty: 'intermediate' });
      expect(['fold', 'check', 'call', 'raise', 'all-in']).toContain(action.type);
    }
  });
});
```

- [ ] **Step 7: Run tests to verify they fail**

```bash
npx vitest run tests/ai/
```

Expected: FAIL — modules not found.

- [ ] **Step 8: Implement archetypes**

Create `src/ai/archetypes.ts`:

```ts
import type { ArchetypeId, ArchetypeProfile } from './types';

export const ARCHETYPES: Record<ArchetypeId, ArchetypeProfile> = {
  TAG: {
    id: 'TAG',
    name: 'Tight-Aggressive',
    vpip: 0.22,
    pfr: 0.18,
    aggression: 0.75,
    bluffFrequency: 0.15,
    foldToRaise: 0.4,
  },
  LAG: {
    id: 'LAG',
    name: 'Loose-Aggressive',
    vpip: 0.45,
    pfr: 0.3,
    aggression: 0.8,
    bluffFrequency: 0.35,
    foldToRaise: 0.25,
  },
  TP: {
    id: 'TP',
    name: 'Tight-Passive',
    vpip: 0.18,
    pfr: 0.08,
    aggression: 0.3,
    bluffFrequency: 0.05,
    foldToRaise: 0.6,
  },
  LP: {
    id: 'LP',
    name: 'Loose-Passive',
    vpip: 0.55,
    pfr: 0.1,
    aggression: 0.25,
    bluffFrequency: 0.1,
    foldToRaise: 0.5,
  },
};

export function getArchetype(id: ArchetypeId): ArchetypeProfile {
  return ARCHETYPES[id];
}
```

- [ ] **Step 9: Implement AI decision engine**

Create `src/ai/decision.ts`:

```ts
import type { GameState, PlayerAction } from '../engine/types';
import type { AIConfig } from './types';
import { getArchetype } from './archetypes';
import { getValidActions } from '../engine/betting';
import { calculateHandStrength } from './hand-strength';

export function makeAIDecision(state: GameState, config: AIConfig): PlayerAction {
  const profile = getArchetype(config.archetype);
  const player = state.players[state.currentPlayerIndex];
  const validActions = getValidActions(state);
  const validTypes = validActions.map((a) => a.type);

  const handStrength = calculateHandStrength(
    player.holeCards!,
    state.communityCards,
  );

  // Apply difficulty modifier — beginners play worse, advanced play closer to optimal
  const difficultyNoise = config.difficulty === 'beginner' ? 0.15
    : config.difficulty === 'intermediate' ? 0.07 : 0;
  const noise = (Math.random() - 0.5) * difficultyNoise * 2;
  const adjustedStrength = Math.min(1, Math.max(0, handStrength + noise));

  const highestBet = Math.max(...state.players.map((p) => p.currentBet));
  const toCall = highestBet - player.currentBet;
  const isPreflop = state.currentBettingRound === 'preflop';

  // Decision logic based on archetype and hand strength
  if (isPreflop && toCall > 0) {
    // Facing a bet preflop
    if (adjustedStrength < (1 - profile.vpip)) {
      return { type: 'fold' };
    }
    if (adjustedStrength > profile.pfr + 0.3 && validTypes.includes('raise')) {
      const raiseAction = validActions.find((a) => a.type === 'raise')!;
      const raiseAmount = raiseAction.minAmount ?? highestBet * 2.5;
      return { type: 'raise', amount: Math.min(raiseAmount, raiseAction.maxAmount ?? raiseAmount) };
    }
    if (validTypes.includes('call')) {
      return { type: 'call' };
    }
    return { type: 'fold' };
  }

  if (toCall === 0) {
    // No bet to face
    if (validTypes.includes('check') && adjustedStrength < profile.aggression * 0.5) {
      return { type: 'check' };
    }
    if (adjustedStrength > 0.6 && validTypes.includes('raise')) {
      const raiseAction = validActions.find((a) => a.type === 'raise')!;
      const sizingMultiplier = adjustedStrength * profile.aggression;
      const betSize = Math.round(state.pot * (0.5 + sizingMultiplier));
      const amount = Math.max(
        raiseAction.minAmount ?? state.bigBlind,
        Math.min(betSize, raiseAction.maxAmount ?? betSize),
      );
      return { type: 'raise', amount };
    }
    // Bluff occasionally
    if (Math.random() < profile.bluffFrequency && validTypes.includes('raise')) {
      const raiseAction = validActions.find((a) => a.type === 'raise')!;
      const bluffSize = Math.round(state.pot * 0.6);
      return {
        type: 'raise',
        amount: Math.max(raiseAction.minAmount ?? state.bigBlind, Math.min(bluffSize, raiseAction.maxAmount ?? bluffSize)),
      };
    }
    if (validTypes.includes('check')) {
      return { type: 'check' };
    }
  }

  // Facing a postflop bet
  if (adjustedStrength > 0.7 && validTypes.includes('raise')) {
    const raiseAction = validActions.find((a) => a.type === 'raise')!;
    const raiseSize = Math.round(highestBet * (2 + profile.aggression));
    return {
      type: 'raise',
      amount: Math.max(raiseAction.minAmount ?? state.bigBlind, Math.min(raiseSize, raiseAction.maxAmount ?? raiseSize)),
    };
  }

  if (adjustedStrength > (1 - profile.vpip) * 0.8) {
    if (validTypes.includes('call')) return { type: 'call' };
  }

  if (Math.random() < profile.foldToRaise) {
    return { type: 'fold' };
  }

  if (validTypes.includes('call')) return { type: 'call' };
  return { type: 'fold' };
}
```

- [ ] **Step 10: Run all AI tests**

```bash
npx vitest run tests/ai/
```

Expected: All PASS.

- [ ] **Step 11: Commit**

```bash
git add src/ai/ tests/ai/
git commit -m "feat: add AI system with archetypes, hand strength, and decision engine"
```

---

## Task 7: Statistics Engine (Pot Odds, EV, Range)

**Files:**
- Create: `src/stats/pot-odds.ts`, `src/stats/ev.ts`, `src/stats/equity.ts`, `src/stats/range.ts`, `src/stats/types.ts`
- Test: `tests/stats/pot-odds.test.ts`, `tests/stats/ev.test.ts`, `tests/stats/range.test.ts`

- [ ] **Step 1: Write failing tests for pot odds**

Create `tests/stats/pot-odds.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculatePotOdds, isCallProfitable } from '../../src/stats/pot-odds';

describe('calculatePotOdds', () => {
  it('calculates pot odds as a percentage', () => {
    // Pot is 100, cost to call is 50 => 50 / (100 + 50) = 33.3%
    const odds = calculatePotOdds(100, 50);
    expect(odds).toBeCloseTo(0.333, 2);
  });

  it('returns 0 when cost to call is 0', () => {
    expect(calculatePotOdds(100, 0)).toBe(0);
  });
});

describe('isCallProfitable', () => {
  it('returns true when equity exceeds pot odds', () => {
    expect(isCallProfitable(0.4, 100, 50)).toBe(true); // 40% equity > 33% pot odds
  });

  it('returns false when equity is below pot odds', () => {
    expect(isCallProfitable(0.2, 100, 50)).toBe(false); // 20% equity < 33% pot odds
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/stats/pot-odds.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement pot odds**

Create `src/stats/types.ts`:

```ts
import type { PlayerAction } from '../engine/types';

export interface ActionEV {
  action: PlayerAction;
  ev: number;
  explanation: string;
}

export interface CoachingAdvice {
  equity: number;
  potOdds: number;
  actionEVs: ActionEV[];
  recommendedAction: PlayerAction;
  explanation: string;
}
```

Create `src/stats/pot-odds.ts`:

```ts
export function calculatePotOdds(potSize: number, costToCall: number): number {
  if (costToCall === 0) return 0;
  return costToCall / (potSize + costToCall);
}

export function isCallProfitable(equity: number, potSize: number, costToCall: number): boolean {
  const potOdds = calculatePotOdds(potSize, costToCall);
  return equity > potOdds;
}
```

- [ ] **Step 4: Run pot odds tests**

```bash
npx vitest run tests/stats/pot-odds.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Write failing tests for EV**

Create `tests/stats/ev.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateCallEV, calculateFoldEV, calculateRaiseEV } from '../../src/stats/ev';

describe('calculateFoldEV', () => {
  it('is always 0 (you win nothing, lose nothing more)', () => {
    expect(calculateFoldEV()).toBe(0);
  });
});

describe('calculateCallEV', () => {
  it('calculates expected value of calling', () => {
    // equity 0.4, pot 100, cost 50 => 0.4 * (100 + 50) - 50 = 60 - 50 = 10
    const ev = calculateCallEV(0.4, 100, 50);
    expect(ev).toBeCloseTo(10, 1);
  });

  it('returns negative EV for bad calls', () => {
    // equity 0.1, pot 100, cost 50 => 0.1 * 150 - 50 = -35
    const ev = calculateCallEV(0.1, 100, 50);
    expect(ev).toBeLessThan(0);
  });
});

describe('calculateRaiseEV', () => {
  it('accounts for fold equity', () => {
    // equity 0.5, pot 100, raise 100, fold probability 0.3
    // EV = foldProb * pot + (1-foldProb) * (equity * (pot + raise*2) - raise)
    const ev = calculateRaiseEV(0.5, 100, 100, 0.3);
    expect(ev).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6: Run EV tests to verify they fail**

```bash
npx vitest run tests/stats/ev.test.ts
```

Expected: FAIL.

- [ ] **Step 7: Implement EV calculator**

Create `src/stats/ev.ts`:

```ts
export function calculateFoldEV(): number {
  return 0;
}

export function calculateCallEV(equity: number, potSize: number, costToCall: number): number {
  return equity * (potSize + costToCall) - costToCall;
}

export function calculateRaiseEV(
  equity: number,
  potSize: number,
  raiseAmount: number,
  opponentFoldProbability: number,
): number {
  const foldEV = opponentFoldProbability * potSize;
  const callEV = (1 - opponentFoldProbability) * (equity * (potSize + raiseAmount * 2) - raiseAmount);
  return foldEV + callEV;
}
```

- [ ] **Step 8: Run EV tests**

```bash
npx vitest run tests/stats/ev.test.ts
```

Expected: All PASS.

- [ ] **Step 9: Write failing tests for range estimation**

Create `tests/stats/range.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { estimateRange, type RangeEntry } from '../../src/stats/range';

describe('estimateRange', () => {
  it('returns a narrower range after a raise than after a limp', () => {
    const raiseRange = estimateRange({
      position: 'UTG',
      actions: [{ type: 'raise', amount: 30 }],
      difficulty: 'intermediate',
    });
    const limpRange = estimateRange({
      position: 'UTG',
      actions: [{ type: 'call' }],
      difficulty: 'intermediate',
    });
    expect(raiseRange.length).toBeLessThan(limpRange.length);
  });

  it('returns entries with hand labels and weights', () => {
    const range = estimateRange({
      position: 'BTN',
      actions: [{ type: 'raise', amount: 25 }],
      difficulty: 'beginner',
    });
    expect(range.length).toBeGreaterThan(0);
    range.forEach((entry: RangeEntry) => {
      expect(entry.hand).toBeDefined();
      expect(entry.weight).toBeGreaterThan(0);
      expect(entry.weight).toBeLessThanOrEqual(1);
    });
  });
});
```

- [ ] **Step 10: Run range tests to verify they fail**

```bash
npx vitest run tests/stats/range.test.ts
```

Expected: FAIL.

- [ ] **Step 11: Implement range estimation**

Create `src/stats/range.ts`:

```ts
import type { PlayerAction, Position } from '../engine/types';
import type { Difficulty } from '../ai/types';

export interface RangeEntry {
  hand: string;    // e.g. "AKs", "QJo", "TT"
  weight: number;  // 0-1 probability this hand is in range
}

interface RangeEstimateInput {
  position: Position;
  actions: PlayerAction[];
  difficulty: Difficulty;
}

// Simplified hand rankings (169 combos grouped by tiers)
const TIER_1 = ['AA', 'KK', 'QQ', 'AKs'];
const TIER_2 = ['JJ', 'TT', 'AKo', 'AQs', 'AQo', 'AJs'];
const TIER_3 = ['99', '88', 'ATs', 'AJo', 'KQs', 'KQo', 'KJs', 'QJs'];
const TIER_4 = ['77', '66', 'A9s', 'A8s', 'ATo', 'KJo', 'KTs', 'QTs', 'JTs'];
const TIER_5 = ['55', '44', '33', '22', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'Q9s', 'J9s', 'T9s', '98s', '87s', '76s'];
const TIER_6 = ['A9o', 'A8o', 'K9o', 'K8s', 'Q8s', 'J8s', 'T8s', '97s', '86s', '75s', '65s', '54s'];

const ALL_TIERS = [TIER_1, TIER_2, TIER_3, TIER_4, TIER_5, TIER_6];

// How many tiers to include by position (tighter from early positions)
const POSITION_TIERS: Record<Position, number> = {
  UTG: 2,
  MP: 3,
  CO: 4,
  BTN: 5,
  SB: 4,
  BB: 6, // BB defends wide
};

export function estimateRange(input: RangeEstimateInput): RangeEntry[] {
  const baseTiers = POSITION_TIERS[input.position];
  const lastAction = input.actions[input.actions.length - 1];

  let tiersToInclude: number;
  let weightMultiplier: number;

  if (!lastAction || lastAction.type === 'check') {
    tiersToInclude = baseTiers;
    weightMultiplier = 0.8;
  } else if (lastAction.type === 'call') {
    tiersToInclude = Math.min(baseTiers + 1, ALL_TIERS.length);
    weightMultiplier = 0.7;
  } else if (lastAction.type === 'raise') {
    tiersToInclude = Math.max(1, baseTiers - 1);
    weightMultiplier = 0.9;
  } else {
    tiersToInclude = baseTiers;
    weightMultiplier = 0.8;
  }

  // Difficulty affects precision — beginners have wider, less accurate ranges
  if (input.difficulty === 'beginner') {
    tiersToInclude = Math.min(tiersToInclude + 1, ALL_TIERS.length);
    weightMultiplier *= 0.8;
  } else if (input.difficulty === 'advanced') {
    weightMultiplier *= 1.0;
  }

  const range: RangeEntry[] = [];
  for (let t = 0; t < tiersToInclude; t++) {
    const tierWeight = ((tiersToInclude - t) / tiersToInclude) * weightMultiplier;
    for (const hand of ALL_TIERS[t]) {
      range.push({ hand, weight: Math.min(1, tierWeight) });
    }
  }

  return range;
}
```

- [ ] **Step 12: Implement equity calculator (for Web Worker)**

Create `src/stats/equity.ts`:

```ts
import type { Card } from '../engine/types';
import { createDeck } from '../engine/deck';
import { evaluateHand, HandRank } from '../engine/hand-eval';

export interface EquityResult {
  win: number;
  tie: number;
  lose: number;
}

export function calculateEquity(
  holeCards: [Card, Card],
  communityCards: Card[],
  iterations: number = 1000,
): EquityResult {
  const usedCards = [...holeCards, ...communityCards];
  const remainingDeck = createDeck().filter(
    (c) => !usedCards.some((used) => used.rank === c.rank && used.suit === c.suit),
  );

  const cardsNeeded = 5 - communityCards.length;
  let wins = 0;
  let ties = 0;
  let losses = 0;

  for (let i = 0; i < iterations; i++) {
    const shuffled = [...remainingDeck].sort(() => Math.random() - 0.5);

    // Deal remaining community cards
    const futureCards = shuffled.slice(0, cardsNeeded);
    const fullBoard = [...communityCards, ...futureCards];

    // Deal opponent hand
    const oppCards = shuffled.slice(cardsNeeded, cardsNeeded + 2);

    const ourHand = evaluateHand([...holeCards, ...fullBoard]);
    const oppHand = evaluateHand([...oppCards, ...fullBoard]);

    const cmp = compareResults(ourHand, oppHand);
    if (cmp > 0) wins++;
    else if (cmp === 0) ties++;
    else losses++;
  }

  return {
    win: wins / iterations,
    tie: ties / iterations,
    lose: losses / iterations,
  };
}

function compareResults(
  a: { rank: HandRank; values: number[] },
  b: { rank: HandRank; values: number[] },
): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) return a.values[i] - b.values[i];
  }
  return 0;
}
```

- [ ] **Step 13: Run all stats tests**

```bash
npx vitest run tests/stats/
```

Expected: All PASS.

- [ ] **Step 14: Commit**

```bash
git add src/stats/ tests/stats/
git commit -m "feat: add statistics engine with pot odds, EV, equity, and range estimation"
```

---

## Task 8: Web Worker for Equity Calculation

**Files:**
- Create: `src/workers/equity-worker.ts`

- [ ] **Step 1: Create the Web Worker**

Create `src/workers/equity-worker.ts`:

```ts
import { calculateEquity } from '../stats/equity';
import type { Card } from '../engine/types';

export interface EquityWorkerRequest {
  holeCards: [Card, Card];
  communityCards: Card[];
  iterations: number;
}

export interface EquityWorkerResponse {
  win: number;
  tie: number;
  lose: number;
}

self.onmessage = (event: MessageEvent<EquityWorkerRequest>) => {
  const { holeCards, communityCards, iterations } = event.data;
  const result = calculateEquity(holeCards, communityCards, iterations);
  self.postMessage(result satisfies EquityWorkerResponse);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/workers/equity-worker.ts
git commit -m "feat: add Web Worker for off-thread equity calculation"
```

---

## Task 9: Static Data (Preflop Ranges, Hand Rankings, GTO Frequencies)

**Files:**
- Create: `src/data/preflop-ranges.ts`, `src/data/hand-rankings.ts`, `src/data/gto-frequencies.ts`

- [ ] **Step 1: Create preflop ranges data**

Create `src/data/preflop-ranges.ts`:

```ts
import type { Position } from '../engine/types';

// Standard opening ranges by position: set of hands that should be opened
// Hands are in standard notation: "AKs" (suited), "AKo" (offsuit), "AA" (pair)
export const OPENING_RANGES: Record<Position, Set<string>> = {
  UTG: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99',
    'AKs', 'AQs', 'AJs', 'ATs',
    'AKo', 'AQo',
    'KQs',
  ]),
  MP: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s',
    'AKo', 'AQo', 'AJo',
    'KQs', 'KJs', 'KQo',
    'QJs',
  ]),
  CO: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s',
    'AKo', 'AQo', 'AJo', 'ATo',
    'KQs', 'KJs', 'KTs', 'KQo', 'KJo',
    'QJs', 'QTs',
    'JTs',
  ]),
  BTN: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
    'KQs', 'KJs', 'KTs', 'K9s', 'KQo', 'KJo', 'KTo',
    'QJs', 'QTs', 'Q9s', 'QJo',
    'JTs', 'J9s', 'JTo',
    'T9s', 'T8s',
    '98s', '87s', '76s', '65s',
  ]),
  SB: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'A4s',
    'AKo', 'AQo', 'AJo', 'ATo',
    'KQs', 'KJs', 'KTs', 'KQo', 'KJo',
    'QJs', 'QTs', 'QJo',
    'JTs', 'J9s',
    'T9s',
    '98s',
  ]),
  BB: new Set([
    // BB defends very wide vs a raise, this represents 3-bet range
    'AA', 'KK', 'QQ', 'JJ',
    'AKs', 'AQs', 'AJs',
    'AKo',
  ]),
};

export function isInOpeningRange(hand: string, position: Position): boolean {
  return OPENING_RANGES[position].has(hand);
}
```

- [ ] **Step 2: Create hand rankings data**

Create `src/data/hand-rankings.ts`:

```ts
// All 169 distinct starting hands ranked from strongest to weakest
// Format: pair "AA", suited "AKs", offsuit "AKo"
export const HAND_RANKINGS: string[] = [
  'AA', 'KK', 'QQ', 'AKs', 'JJ', 'AQs', 'KQs', 'AJs', 'KJs', 'TT',
  'AKo', 'ATs', 'QJs', 'KTs', 'QTs', 'JTs', '99', 'AQo', 'A9s', 'KQo',
  '88', 'K9s', 'T9s', 'A8s', 'Q9s', 'J9s', 'AJo', 'A5s', '77', 'A7s',
  'KJo', 'A4s', 'A3s', 'A6s', 'QJo', '66', 'K8s', 'T8s', 'A2s', '98s',
  'J8s', 'ATo', 'Q8s', 'K7s', 'KTo', '55', 'JTo', '87s', 'QTo', '44',
  '33', '22', 'K6s', '97s', 'K5s', '76s', 'T7s', 'K4s', 'K3s', 'K2s',
  'Q7s', '86s', '65s', 'J7s', '54s', 'Q6s', '75s', '96s', 'Q5s', '64s',
  'Q4s', 'Q3s', 'T6s', '53s', 'Q2s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
  '85s', '43s', 'T5s', 'T4s', 'T3s', 'T2s', '74s', '95s', '84s', '63s',
  '94s', '93s', '92s', '52s', '42s', '32s', 'A9o', 'K9o', 'Q9o', 'J9o',
  'T9o', '98o', '87o', '76o', '65o', '54o', 'A8o', 'K8o', 'Q8o', 'J8o',
  'T8o', '97o', '86o', '75o', '64o', '53o', '43o', 'A7o', 'K7o', 'Q7o',
  'J7o', 'T7o', '96o', '85o', '74o', '63o', '52o', '42o', '32o', 'A6o',
  'K6o', 'Q6o', 'J6o', 'T6o', '95o', '84o', '73o', '62o', 'A5o', 'K5o',
  'Q5o', 'J5o', 'T5o', '94o', '83o', '72o', 'A4o', 'K4o', 'Q4o', 'J4o',
  'T4o', '93o', '82o', 'A3o', 'K3o', 'Q3o', 'J3o', 'T3o', '92o', 'A2o',
  'K2o', 'Q2o', 'J2o', 'T2o',
];

export function getHandRank(hand: string): number {
  const index = HAND_RANKINGS.indexOf(hand);
  return index === -1 ? HAND_RANKINGS.length : index;
}

export function getHandPercentile(hand: string): number {
  const rank = getHandRank(hand);
  return (rank / HAND_RANKINGS.length) * 100;
}
```

- [ ] **Step 3: Create GTO frequencies data**

Create `src/data/gto-frequencies.ts`:

```ts
import type { Position } from '../engine/types';

// GTO-approximated frequencies for common spots
// Values represent percentage of time an action should be taken

export interface GTOSpot {
  raise: number;
  call: number;
  fold: number;
}

// Preflop open-raise frequencies by position (% of hands)
export const PREFLOP_OPEN_FREQ: Record<Position, number> = {
  UTG: 0.12,
  MP: 0.16,
  CO: 0.25,
  BTN: 0.40,
  SB: 0.35,
  BB: 0.0, // BB can't open
};

// Preflop 3-bet frequencies by position vs opener position
export const THREE_BET_FREQ: Record<Position, Record<Position, number>> = {
  UTG: { UTG: 0, MP: 0, CO: 0, BTN: 0, SB: 0, BB: 0 },
  MP: { UTG: 0.04, MP: 0, CO: 0, BTN: 0, SB: 0, BB: 0 },
  CO: { UTG: 0.05, MP: 0.06, CO: 0, BTN: 0, SB: 0, BB: 0 },
  BTN: { UTG: 0.06, MP: 0.07, CO: 0.08, BTN: 0, SB: 0, BB: 0 },
  SB: { UTG: 0.07, MP: 0.08, CO: 0.09, BTN: 0.10, SB: 0, BB: 0 },
  BB: { UTG: 0.08, MP: 0.09, CO: 0.10, BTN: 0.12, SB: 0.13, BB: 0 },
};

// Continuation bet frequencies by board texture
export const CBET_FREQ = {
  dry: 0.70,     // e.g., K72 rainbow
  medium: 0.55,  // e.g., QT4 two-tone
  wet: 0.35,     // e.g., JT9 two-tone
};

// Check-raise frequencies on flop
export const CHECK_RAISE_FREQ = {
  asDefender: 0.10,
  withStrongHand: 0.25,
  asSemiBluff: 0.12,
};
```

- [ ] **Step 4: Commit**

```bash
git add src/data/
git commit -m "feat: add static data for preflop ranges, hand rankings, and GTO frequencies"
```

---

## Task 10: GTO Tables for Advanced AI

**Files:**
- Create: `src/ai/gto-tables.ts`

- [ ] **Step 1: Create GTO decision tables**

Create `src/ai/gto-tables.ts`:

```ts
import type { Position } from '../engine/types';
import { OPENING_RANGES } from '../data/preflop-ranges';
import { PREFLOP_OPEN_FREQ, THREE_BET_FREQ, CBET_FREQ } from '../data/gto-frequencies';

export interface GTODecision {
  raise: number;  // Probability [0-1]
  call: number;
  fold: number;
}

export function getPreflopGTODecision(
  hand: string,
  position: Position,
  facingAction: 'unopened' | 'raise' | '3bet',
): GTODecision {
  const inRange = OPENING_RANGES[position].has(hand);

  if (facingAction === 'unopened') {
    if (inRange) {
      return { raise: 0.9, call: 0, fold: 0.1 };
    }
    return { raise: 0.05, call: 0, fold: 0.95 };
  }

  if (facingAction === 'raise') {
    // Simplified: top 30% of range 3-bets, next 30% calls, rest folds
    if (inRange) {
      const freq = THREE_BET_FREQ[position];
      const avgThreeBet = Object.values(freq).reduce((a, b) => a + b, 0) / 6;
      return { raise: avgThreeBet * 3, call: 0.5, fold: Math.max(0, 1 - avgThreeBet * 3 - 0.5) };
    }
    return { raise: 0.02, call: 0.08, fold: 0.90 };
  }

  // Facing 3-bet
  if (inRange) {
    return { raise: 0.15, call: 0.35, fold: 0.50 };
  }
  return { raise: 0.02, call: 0.05, fold: 0.93 };
}

export function getPostflopGTOCbetDecision(
  boardTexture: 'dry' | 'medium' | 'wet',
  handStrength: number,
): GTODecision {
  const cbetFreq = CBET_FREQ[boardTexture];

  if (handStrength > 0.7) {
    // Strong hand — bet for value most of the time
    return { raise: cbetFreq + 0.1, call: 0, fold: 0 };
  }

  if (handStrength > 0.4) {
    // Medium — bet at normal cbet freq
    return { raise: cbetFreq, call: 0, fold: 1 - cbetFreq };
  }

  // Weak — sometimes bluff cbet, mostly check
  return { raise: cbetFreq * 0.4, call: 0, fold: 1 - cbetFreq * 0.4 };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ai/gto-tables.ts
git commit -m "feat: add GTO decision tables for advanced AI difficulty"
```

---

## Task 11: Zustand Stores

**Files:**
- Create: `src/stores/game-store.ts`, `src/stores/stats-store.ts`, `src/stores/settings-store.ts`

- [ ] **Step 1: Create settings store**

Create `src/stores/settings-store.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty, ArchetypeId } from '../ai/types';

interface OpponentConfig {
  archetype: ArchetypeId;
  difficulty: Difficulty;
}

interface SettingsState {
  tableSize: 2 | 3 | 4 | 5 | 6;
  opponents: OpponentConfig[];
  showCoaching: boolean;
  smallBlind: number;
  bigBlind: number;
  startingChips: number;
  setTableSize: (size: 2 | 3 | 4 | 5 | 6) => void;
  setOpponents: (opponents: OpponentConfig[]) => void;
  toggleCoaching: () => void;
  setBlinds: (small: number, big: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      tableSize: 6,
      opponents: [
        { archetype: 'TAG', difficulty: 'beginner' },
        { archetype: 'LAG', difficulty: 'beginner' },
        { archetype: 'TP', difficulty: 'beginner' },
        { archetype: 'LP', difficulty: 'beginner' },
        { archetype: 'TAG', difficulty: 'intermediate' },
      ],
      showCoaching: true,
      smallBlind: 5,
      bigBlind: 10,
      startingChips: 1000,
      setTableSize: (size) =>
        set((state) => {
          const opponents = state.opponents.slice(0, size - 1);
          while (opponents.length < size - 1) {
            opponents.push({ archetype: 'TAG', difficulty: 'beginner' });
          }
          return { tableSize: size, opponents };
        }),
      setOpponents: (opponents) => set({ opponents }),
      toggleCoaching: () => set((state) => ({ showCoaching: !state.showCoaching })),
      setBlinds: (small, big) => set({ smallBlind: small, bigBlind: big }),
    }),
    { name: 'poker-trainer-settings' },
  ),
);
```

- [ ] **Step 2: Create game store**

Create `src/stores/game-store.ts`:

```ts
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

    // Check if only one player remains
    const activePlayers = state.players.filter((p) => !p.hasFolded);
    if (activePlayers.length === 1) {
      state = {
        ...state,
        isHandComplete: true,
        winners: [{ playerId: activePlayers[0].id, amount: state.pot }],
      };
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

    set({
      gameState: state,
      handHistory: history,
      isWaitingForHuman: state.players[state.currentPlayerIndex].isHuman,
    });

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
      history.actions.push({
        playerId: player.id,
        action,
        round: state.currentBettingRound,
      });

      const activePlayers = state.players.filter((p) => !p.hasFolded);
      if (activePlayers.length === 1) {
        state = {
          ...state,
          isHandComplete: true,
          winners: [{ playerId: activePlayers[0].id, amount: state.pot }],
        };
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
      const cmp =
        result.rank !== bestResult.rank
          ? result.rank - bestResult.rank
          : (() => {
              for (let j = 0; j < Math.min(result.values.length, bestResult.values.length); j++) {
                if (result.values[j] !== bestResult.values[j]) return result.values[j] - bestResult.values[j];
              }
              return 0;
            })();

      if (cmp > 0) {
        bestResult = result;
        bestPlayers = [eligible[i]];
      } else if (cmp === 0) {
        bestPlayers.push(eligible[i]);
      }
    }

    const share = Math.floor(pot.amount / bestPlayers.length);
    for (const p of bestPlayers) {
      const existing = winners.find((w) => w.playerId === p.id);
      if (existing) {
        existing.amount += share;
      } else {
        winners.push({ playerId: p.id, amount: share });
      }
    }
  }

  // Award winnings to players
  const updatedPlayers = state.players.map((p) => {
    const won = winners.find((w) => w.playerId === p.id);
    return won ? { ...p, chips: p.chips + won.amount } : { ...p };
  });

  return { ...state, players: updatedPlayers, winners, isHandComplete: true };
}
```

- [ ] **Step 3: Create stats store**

Create `src/stores/stats-store.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DrillResult {
  drillType: 'preflop' | 'potOdds' | 'equity' | 'postflop';
  correct: boolean;
  timestamp: number;
}

interface SessionStats {
  handsPlayed: number;
  bbWonLost: number;
  correctDecisions: number;
  totalDecisions: number;
}

interface StatsState {
  drillResults: DrillResult[];
  sessions: SessionStats[];
  currentSession: SessionStats;
  addDrillResult: (result: DrillResult) => void;
  recordDecision: (correct: boolean, bbAmount: number) => void;
  endSession: () => void;
  getAccuracy: (drillType?: DrillResult['drillType']) => number;
  exportData: () => string;
  importData: (json: string) => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      drillResults: [],
      sessions: [],
      currentSession: { handsPlayed: 0, bbWonLost: 0, correctDecisions: 0, totalDecisions: 0 },

      addDrillResult: (result) =>
        set((state) => ({
          drillResults: [...state.drillResults, result],
        })),

      recordDecision: (correct, bbAmount) =>
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            handsPlayed: state.currentSession.handsPlayed + 1,
            bbWonLost: state.currentSession.bbWonLost + bbAmount,
            correctDecisions: state.currentSession.correctDecisions + (correct ? 1 : 0),
            totalDecisions: state.currentSession.totalDecisions + 1,
          },
        })),

      endSession: () =>
        set((state) => ({
          sessions: [...state.sessions, state.currentSession],
          currentSession: { handsPlayed: 0, bbWonLost: 0, correctDecisions: 0, totalDecisions: 0 },
        })),

      getAccuracy: (drillType) => {
        const results = drillType
          ? get().drillResults.filter((r) => r.drillType === drillType)
          : get().drillResults;
        if (results.length === 0) return 0;
        return results.filter((r) => r.correct).length / results.length;
      },

      exportData: () => {
        const { drillResults, sessions, currentSession } = get();
        return JSON.stringify({ drillResults, sessions, currentSession });
      },

      importData: (json) => {
        const data = JSON.parse(json);
        set({
          drillResults: data.drillResults ?? [],
          sessions: data.sessions ?? [],
          currentSession: data.currentSession ?? { handsPlayed: 0, bbWonLost: 0, correctDecisions: 0, totalDecisions: 0 },
        });
      },
    }),
    { name: 'poker-trainer-stats' },
  ),
);
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand stores for game state, settings, and stats with localStorage persistence"
```

---

## Task 12: Common UI Components (Card, Button, NavBar, Layout)

**Files:**
- Create: `src/components/common/Card.tsx`, `src/components/common/Button.tsx`, `src/components/common/NavBar.tsx`, `src/components/common/Layout.tsx`
- Test: `tests/components/Card.test.tsx`

- [ ] **Step 1: Write failing test for Card component**

Create `tests/components/Card.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardDisplay } from '../../src/components/common/Card';

describe('CardDisplay', () => {
  it('renders card rank and suit', () => {
    render(<CardDisplay card={{ suit: 'hearts', rank: 'A' }} />);
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('♥')).toBeDefined();
  });

  it('renders face down when faceDown prop is true', () => {
    render(<CardDisplay card={{ suit: 'hearts', rank: 'A' }} faceDown />);
    expect(screen.queryByText('A')).toBeNull();
  });

  it('applies red color for hearts and diamonds', () => {
    const { container } = render(<CardDisplay card={{ suit: 'hearts', rank: 'K' }} />);
    expect(container.querySelector('.text-red-500')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/components/Card.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement Card component**

Create `src/components/common/Card.tsx`:

```tsx
import type { Card } from '../../engine/types';

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

interface CardDisplayProps {
  card: Card;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CardDisplay({ card, faceDown = false, size = 'md' }: CardDisplayProps) {
  const sizeClasses = {
    sm: 'w-8 h-12 text-xs',
    md: 'w-12 h-18 text-sm',
    lg: 'w-16 h-24 text-base',
  };

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  if (faceDown) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-blue-800 border border-blue-600 flex items-center justify-center shadow-md`}
      >
        <div className="w-3/4 h-3/4 rounded border border-blue-500 bg-blue-700" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-white border border-gray-300 flex flex-col items-center justify-center shadow-md ${
        isRed ? 'text-red-500' : 'text-gray-900'
      }`}
    >
      <span className="font-bold leading-none">{card.rank}</span>
      <span className="leading-none">{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run Card test**

```bash
npx vitest run tests/components/Card.test.tsx
```

Expected: All PASS.

- [ ] **Step 5: Implement Button, NavBar, and Layout**

Create `src/components/common/Button.tsx`:

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', disabled = false, className = '' }: ButtonProps) {
  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
```

Create `src/components/common/NavBar.tsx`:

```tsx
type Page = 'play' | 'drills' | 'stats';

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function NavBar({ currentPage, onNavigate }: NavBarProps) {
  const tabs: { id: Page; label: string }[] = [
    { id: 'play', label: 'Play' },
    { id: 'drills', label: 'Drills' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex bg-gray-800 px-6 py-3 gap-6">
        <span className="text-green-400 font-bold text-lg mr-auto">Poker Trainer</span>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`text-sm font-medium transition-colors ${
              currentPage === tab.id ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around bg-gray-800 py-3 border-t border-gray-700 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`text-sm font-medium transition-colors ${
              currentPage === tab.id ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
```

Create `src/components/common/Layout.tsx`:

```tsx
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <main className="flex-1 p-4 pb-20 md:pb-4 max-w-6xl mx-auto w-full">
      {children}
    </main>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/common/ tests/components/Card.test.tsx
git commit -m "feat: add common UI components — Card, Button, NavBar, Layout"
```

---

## Task 13: Poker Table UI (PokerTable, PlayerSeat, CommunityCards, ActionBar)

**Files:**
- Create: `src/components/table/PokerTable.tsx`, `src/components/table/PlayerSeat.tsx`, `src/components/table/CommunityCards.tsx`, `src/components/table/ActionBar.tsx`
- Test: `tests/components/ActionBar.test.tsx`

- [ ] **Step 1: Write failing test for ActionBar**

Create `tests/components/ActionBar.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from '../../src/components/table/ActionBar';

describe('ActionBar', () => {
  it('renders fold, call, and raise buttons', () => {
    render(
      <ActionBar
        validActions={[
          { type: 'fold' },
          { type: 'call' },
          { type: 'raise', minAmount: 20, maxAmount: 1000 },
        ]}
        onAction={vi.fn()}
        potSize={100}
        toCall={10}
      />,
    );
    expect(screen.getByText(/Fold/)).toBeDefined();
    expect(screen.getByText(/Call/)).toBeDefined();
    expect(screen.getByText(/Raise/)).toBeDefined();
  });

  it('calls onAction with fold when fold button clicked', () => {
    const onAction = vi.fn();
    render(
      <ActionBar
        validActions={[{ type: 'fold' }, { type: 'call' }]}
        onAction={onAction}
        potSize={100}
        toCall={10}
      />,
    );
    fireEvent.click(screen.getByText(/Fold/));
    expect(onAction).toHaveBeenCalledWith({ type: 'fold' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/components/ActionBar.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement PlayerSeat**

Create `src/components/table/PlayerSeat.tsx`:

```tsx
import type { Player } from '../../engine/types';
import { CardDisplay } from '../common/Card';

interface PlayerSeatProps {
  player: Player;
  isCurrentPlayer: boolean;
  showCards: boolean;
}

export function PlayerSeat({ player, isCurrentPlayer, showCards }: PlayerSeatProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
        isCurrentPlayer ? 'ring-2 ring-green-400' : ''
      } ${player.hasFolded ? 'opacity-40' : ''}`}
    >
      <div className="flex gap-1">
        {player.holeCards && showCards ? (
          <>
            <CardDisplay card={player.holeCards[0]} size="sm" />
            <CardDisplay card={player.holeCards[1]} size="sm" />
          </>
        ) : player.holeCards ? (
          <>
            <CardDisplay card={player.holeCards[0]} size="sm" faceDown />
            <CardDisplay card={player.holeCards[1]} size="sm" faceDown />
          </>
        ) : null}
      </div>
      <span className="text-xs text-gray-300 truncate max-w-20">{player.name}</span>
      <span className="text-xs text-yellow-400">{player.chips}</span>
      {player.currentBet > 0 && (
        <span className="text-xs text-green-300">Bet: {player.currentBet}</span>
      )}
      {player.hasFolded && <span className="text-xs text-red-400">Folded</span>}
      {player.isAllIn && <span className="text-xs text-orange-400">All-In</span>}
    </div>
  );
}
```

- [ ] **Step 4: Implement CommunityCards**

Create `src/components/table/CommunityCards.tsx`:

```tsx
import type { Card } from '../../engine/types';
import { CardDisplay } from '../common/Card';

interface CommunityCardsProps {
  cards: Card[];
}

export function CommunityCards({ cards }: CommunityCardsProps) {
  return (
    <div className="flex gap-2 justify-center">
      {cards.map((card, i) => (
        <CardDisplay key={`${card.rank}-${card.suit}-${i}`} card={card} size="md" />
      ))}
      {/* Placeholder slots for unrevealed cards */}
      {Array.from({ length: 5 - cards.length }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-12 h-18 rounded-lg border border-gray-600 border-dashed"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Implement ActionBar**

Create `src/components/table/ActionBar.tsx`:

```tsx
import { useState } from 'react';
import type { PlayerAction } from '../../engine/types';
import type { ValidAction } from '../../engine/betting';
import { Button } from '../common/Button';

interface ActionBarProps {
  validActions: ValidAction[];
  onAction: (action: PlayerAction) => void;
  potSize: number;
  toCall: number;
}

export function ActionBar({ validActions, onAction, potSize, toCall }: ActionBarProps) {
  const raiseAction = validActions.find((a) => a.type === 'raise');
  const [raiseAmount, setRaiseAmount] = useState(raiseAction?.minAmount ?? 0);

  const hasAction = (type: string) => validActions.some((a) => a.type === type);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      <div className="flex gap-2 justify-center">
        {hasAction('fold') && (
          <Button variant="danger" onClick={() => onAction({ type: 'fold' })}>
            Fold
          </Button>
        )}
        {hasAction('check') && (
          <Button variant="secondary" onClick={() => onAction({ type: 'check' })}>
            Check
          </Button>
        )}
        {hasAction('call') && (
          <Button variant="primary" onClick={() => onAction({ type: 'call' })}>
            Call {toCall}
          </Button>
        )}
        {hasAction('all-in') && (
          <Button variant="primary" onClick={() => onAction({ type: 'all-in' })}>
            All-In
          </Button>
        )}
      </div>
      {raiseAction && (
        <div className="flex gap-2 items-center justify-center">
          <input
            type="range"
            min={raiseAction.minAmount}
            max={raiseAction.maxAmount}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="flex-1 max-w-48"
          />
          <Button onClick={() => onAction({ type: 'raise', amount: raiseAmount })}>
            Raise {raiseAmount}
          </Button>
        </div>
      )}
      <div className="text-center text-xs text-gray-400">
        Pot: {potSize}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Implement PokerTable**

Create `src/components/table/PokerTable.tsx`:

```tsx
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
      {/* Opponents */}
      <div className="flex justify-center gap-4 flex-wrap">
        {opponents.map((player) => (
          <PlayerSeat
            key={player.id}
            player={player}
            isCurrentPlayer={gameState.players[gameState.currentPlayerIndex]?.id === player.id}
            showCards={gameState.isHandComplete}
          />
        ))}
      </div>

      {/* Table felt */}
      <div className="bg-green-800 rounded-3xl p-6 w-full max-w-lg border-4 border-green-900 flex flex-col items-center gap-4">
        <CommunityCards cards={gameState.communityCards} />
        <div className="text-yellow-400 font-bold">Pot: {gameState.pot}</div>
      </div>

      {/* Human player */}
      {human && (
        <PlayerSeat
          player={human}
          isCurrentPlayer={gameState.players[gameState.currentPlayerIndex]?.id === human.id}
          showCards={true}
        />
      )}

      {/* Action bar */}
      {isWaitingForHuman && !gameState.isHandComplete && (
        <ActionBar
          validActions={validActions}
          onAction={onAction}
          potSize={gameState.pot}
          toCall={toCall}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Run ActionBar test**

```bash
npx vitest run tests/components/ActionBar.test.tsx
```

Expected: All PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/table/ tests/components/ActionBar.test.tsx
git commit -m "feat: add poker table UI components — table, seats, community cards, action bar"
```

---

## Task 14: Coaching Panel

**Files:**
- Create: `src/components/coaching/CoachingPanel.tsx`, `src/components/coaching/EquityDisplay.tsx`, `src/components/coaching/EvDisplay.tsx`, `src/components/coaching/Recommendation.tsx`

- [ ] **Step 1: Implement EquityDisplay**

Create `src/components/coaching/EquityDisplay.tsx`:

```tsx
interface EquityDisplayProps {
  equity: number; // 0-1
}

export function EquityDisplay({ equity }: EquityDisplayProps) {
  const percentage = Math.round(equity * 100);
  const barColor = percentage > 60 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">Your Equity</span>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-700 rounded-full h-3">
          <div
            className={`${barColor} h-3 rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-bold text-white w-12 text-right">{percentage}%</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement EvDisplay**

Create `src/components/coaching/EvDisplay.tsx`:

```tsx
import type { ActionEV } from '../../stats/types';

interface EvDisplayProps {
  actionEVs: ActionEV[];
}

export function EvDisplay({ actionEVs }: EvDisplayProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">Expected Value</span>
      <div className="flex flex-col gap-1">
        {actionEVs.map((ev) => (
          <div key={ev.action.type} className="flex justify-between text-sm">
            <span className="capitalize text-gray-300">{ev.action.type}</span>
            <span className={ev.ev >= 0 ? 'text-green-400' : 'text-red-400'}>
              {ev.ev >= 0 ? '+' : ''}{ev.ev.toFixed(1)} BB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement Recommendation**

Create `src/components/coaching/Recommendation.tsx`:

```tsx
import type { PlayerAction } from '../../engine/types';

interface RecommendationProps {
  action: PlayerAction;
  explanation: string;
}

export function Recommendation({ action, explanation }: RecommendationProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-400">Recommended</span>
        <span className="text-sm font-bold text-green-400 capitalize">{action.type}</span>
        {action.amount && <span className="text-sm text-green-400">({action.amount})</span>}
      </div>
      <p className="text-xs text-gray-300">{explanation}</p>
    </div>
  );
}
```

- [ ] **Step 4: Implement CoachingPanel**

Create `src/components/coaching/CoachingPanel.tsx`:

```tsx
import type { CoachingAdvice } from '../../stats/types';
import { EquityDisplay } from './EquityDisplay';
import { EvDisplay } from './EvDisplay';
import { Recommendation } from './Recommendation';

interface CoachingPanelProps {
  advice: CoachingAdvice | null;
  visible: boolean;
  onToggle: () => void;
}

export function CoachingPanel({ advice, visible, onToggle }: CoachingPanelProps) {
  if (!advice) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 md:static md:w-72 z-40">
      <button
        onClick={onToggle}
        className="w-full bg-gray-800 text-gray-400 text-xs py-1 text-center md:hidden"
      >
        {visible ? 'Hide Coaching' : 'Show Coaching'}
      </button>
      {visible && (
        <div className="bg-gray-800 border-t border-gray-700 md:border md:rounded-lg p-4 flex flex-col gap-3">
          <EquityDisplay equity={advice.equity} />
          <div className="text-xs text-gray-400">
            Pot Odds: {Math.round(advice.potOdds * 100)}%
          </div>
          <EvDisplay actionEVs={advice.actionEVs} />
          <Recommendation action={advice.recommendedAction} explanation={advice.explanation} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/coaching/
git commit -m "feat: add coaching panel with equity display, EV analysis, and recommendations"
```

---

## Task 15: Drill Components

**Files:**
- Create: `src/components/drills/DrillSelector.tsx`, `src/components/drills/PreflopDrill.tsx`, `src/components/drills/PotOddsDrill.tsx`, `src/components/drills/EquityDrill.tsx`, `src/components/drills/PostflopDrill.tsx`, `src/components/drills/DrillFeedback.tsx`
- Test: `tests/components/PreflopDrill.test.tsx`

- [ ] **Step 1: Write failing test for PreflopDrill**

Create `tests/components/PreflopDrill.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreflopDrill } from '../../src/components/drills/PreflopDrill';

describe('PreflopDrill', () => {
  it('renders a hand and position', () => {
    render(<PreflopDrill onResult={vi.fn()} />);
    expect(screen.getByText(/Position:/)).toBeDefined();
    expect(screen.getByText(/Open/)).toBeDefined();
    expect(screen.getByText(/Fold/)).toBeDefined();
  });

  it('shows feedback after selecting an action', () => {
    render(<PreflopDrill onResult={vi.fn()} />);
    fireEvent.click(screen.getByText(/Fold/));
    // Should show either Correct or Incorrect
    const feedback = screen.getByTestId('drill-feedback');
    expect(feedback).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/components/PreflopDrill.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement DrillFeedback**

Create `src/components/drills/DrillFeedback.tsx`:

```tsx
interface DrillFeedbackProps {
  correct: boolean;
  explanation: string;
  onNext: () => void;
}

export function DrillFeedback({ correct, explanation, onNext }: DrillFeedbackProps) {
  return (
    <div
      data-testid="drill-feedback"
      className={`rounded-lg p-4 ${correct ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'}`}
    >
      <div className="font-bold text-lg mb-2">
        {correct ? 'Correct!' : 'Incorrect'}
      </div>
      <p className="text-sm text-gray-300 mb-3">{explanation}</p>
      <button
        onClick={onNext}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
      >
        Next
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Implement PreflopDrill**

Create `src/components/drills/PreflopDrill.tsx`:

```tsx
import { useState, useCallback } from 'react';
import type { Position, Card } from '../../engine/types';
import { createDeck, shuffleDeck, dealCards } from '../../engine/deck';
import { rankValue } from '../../engine/card';
import { isInOpeningRange } from '../../data/preflop-ranges';
import { CardDisplay } from '../common/Card';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';

interface PreflopDrillProps {
  onResult: (correct: boolean) => void;
}

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB'];

function handToNotation(cards: [Card, Card]): string {
  const r1 = rankValue(cards[0].rank);
  const r2 = rankValue(cards[1].rank);
  const high = r1 >= r2 ? cards[0] : cards[1];
  const low = r1 >= r2 ? cards[1] : cards[0];
  const rankStr = (r: Card) => r.rank === '10' ? 'T' : r.rank;

  if (high.rank === low.rank) return `${rankStr(high)}${rankStr(low)}`;
  const suited = high.suit === low.suit ? 's' : 'o';
  return `${rankStr(high)}${rankStr(low)}${suited}`;
}

function generateScenario() {
  const deck = shuffleDeck(createDeck());
  const { dealt } = dealCards(deck, 2);
  const holeCards = dealt as [Card, Card];
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const notation = handToNotation(holeCards);
  const shouldOpen = isInOpeningRange(notation, position);
  return { holeCards, position, notation, shouldOpen };
}

export function PreflopDrill({ onResult }: PreflopDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleAction = useCallback(
    (action: 'open' | 'fold') => {
      const correct =
        (action === 'open' && scenario.shouldOpen) || (action === 'fold' && !scenario.shouldOpen);

      const explanation = scenario.shouldOpen
        ? `${scenario.notation} is in the standard opening range from ${scenario.position}.`
        : `${scenario.notation} is not in the standard opening range from ${scenario.position}. Fold and wait for a better spot.`;

      setFeedback({ correct, explanation });
      onResult(correct);
    },
    [scenario, onResult],
  );

  const handleNext = () => {
    setScenario(generateScenario());
    setFeedback(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Preflop Trainer</h2>
      <p className="text-sm text-gray-400">
        Position: <span className="text-white font-bold">{scenario.position}</span>
      </p>
      <div className="flex gap-2">
        <CardDisplay card={scenario.holeCards[0]} size="lg" />
        <CardDisplay card={scenario.holeCards[1]} size="lg" />
      </div>
      <p className="text-sm text-gray-400">Action is on you. Open or fold?</p>
      {!feedback ? (
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => handleAction('open')}>
            Open
          </Button>
          <Button variant="danger" onClick={() => handleAction('fold')}>
            Fold
          </Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Implement PotOddsDrill**

Create `src/components/drills/PotOddsDrill.tsx`:

```tsx
import { useState, useCallback } from 'react';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';
import { calculatePotOdds, isCallProfitable } from '../../stats/pot-odds';

interface PotOddsDrillProps {
  onResult: (correct: boolean) => void;
}

function generateScenario() {
  const potSize = Math.round((Math.random() * 200 + 20) / 5) * 5;
  const betSize = Math.round((Math.random() * potSize * 0.8 + 10) / 5) * 5;
  const equity = Math.round(Math.random() * 60 + 10) / 100; // 10-70%
  const potOdds = calculatePotOdds(potSize, betSize);
  const shouldCall = isCallProfitable(equity, potSize, betSize);

  return { potSize, betSize, equity, potOdds, shouldCall };
}

export function PotOddsDrill({ onResult }: PotOddsDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleAction = useCallback(
    (action: 'call' | 'fold') => {
      const correct =
        (action === 'call' && scenario.shouldCall) || (action === 'fold' && !scenario.shouldCall);

      const potOddsPct = Math.round(scenario.potOdds * 100);
      const equityPct = Math.round(scenario.equity * 100);
      const explanation = scenario.shouldCall
        ? `Your equity (${equityPct}%) exceeds the pot odds (${potOddsPct}%), making this a profitable call.`
        : `Your equity (${equityPct}%) is below the pot odds (${potOddsPct}%), so folding is correct.`;

      setFeedback({ correct, explanation });
      onResult(correct);
    },
    [scenario, onResult],
  );

  const handleNext = () => {
    setScenario(generateScenario());
    setFeedback(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Pot Odds Quiz</h2>
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-400">Pot Size: <span className="text-white font-bold">{scenario.potSize}</span></p>
        <p className="text-sm text-gray-400">Bet to Call: <span className="text-white font-bold">{scenario.betSize}</span></p>
        <p className="text-sm text-gray-400">Your Equity: <span className="text-white font-bold">{Math.round(scenario.equity * 100)}%</span></p>
      </div>
      <p className="text-sm text-gray-400">Should you call or fold?</p>
      {!feedback ? (
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => handleAction('call')}>
            Call
          </Button>
          <Button variant="danger" onClick={() => handleAction('fold')}>
            Fold
          </Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Implement EquityDrill**

Create `src/components/drills/EquityDrill.tsx`:

```tsx
import { useState, useCallback } from 'react';
import type { Card } from '../../engine/types';
import { createDeck, shuffleDeck, dealCards } from '../../engine/deck';
import { calculateEquity } from '../../stats/equity';
import { CardDisplay } from '../common/Card';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';

interface EquityDrillProps {
  onResult: (correct: boolean) => void;
}

function generateScenario() {
  const deck = shuffleDeck(createDeck());
  const { dealt: hero, remaining: r1 } = dealCards(deck, 2);
  const { dealt: board } = dealCards(r1, 3);
  const holeCards = hero as [Card, Card];
  const equity = calculateEquity(holeCards, board, 500);
  return { holeCards, board, actualEquity: Math.round(equity.win * 100) };
}

export function EquityDrill({ onResult }: EquityDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [guess, setGuess] = useState(50);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleSubmit = useCallback(() => {
    const diff = Math.abs(guess - scenario.actualEquity);
    const correct = diff <= 15; // Within 15% is considered good

    const explanation = correct
      ? `Your estimate of ${guess}% was within 15% of the actual equity (${scenario.actualEquity}%).`
      : `Your estimate of ${guess}% was off by ${diff}%. The actual equity was ${scenario.actualEquity}%.`;

    setFeedback({ correct, explanation });
    onResult(correct);
  }, [guess, scenario, onResult]);

  const handleNext = () => {
    setScenario(generateScenario());
    setGuess(50);
    setFeedback(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Equity Estimation</h2>
      <p className="text-sm text-gray-400">Estimate your equity vs a random hand</p>
      <div className="flex gap-2">
        <CardDisplay card={scenario.holeCards[0]} size="lg" />
        <CardDisplay card={scenario.holeCards[1]} size="lg" />
      </div>
      <div className="flex gap-2">
        {scenario.board.map((card, i) => (
          <CardDisplay key={i} card={card} size="md" />
        ))}
      </div>
      {!feedback ? (
        <div className="flex flex-col items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-48"
          />
          <span className="text-lg font-bold">{guess}%</span>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Implement PostflopDrill**

Create `src/components/drills/PostflopDrill.tsx`:

```tsx
import { useState, useCallback } from 'react';
import type { Card } from '../../engine/types';
import { createDeck, shuffleDeck, dealCards } from '../../engine/deck';
import { calculateEquity } from '../../stats/equity';
import { calculateCallEV, calculateFoldEV, calculateRaiseEV } from '../../stats/ev';
import { CardDisplay } from '../common/Card';
import { Button } from '../common/Button';
import { DrillFeedback } from './DrillFeedback';

interface PostflopDrillProps {
  onResult: (correct: boolean) => void;
}

type DrillAction = 'fold' | 'call' | 'raise';

function generateScenario() {
  const deck = shuffleDeck(createDeck());
  const { dealt: hero, remaining: r1 } = dealCards(deck, 2);
  const { dealt: board } = dealCards(r1, 3);
  const holeCards = hero as [Card, Card];
  const potSize = Math.round((Math.random() * 150 + 30) / 5) * 5;
  const betSize = Math.round((Math.random() * potSize * 0.7 + 10) / 5) * 5;
  const equity = calculateEquity(holeCards, board, 500);
  const eqWin = equity.win;

  const foldEV = calculateFoldEV();
  const callEV = calculateCallEV(eqWin, potSize, betSize);
  const raiseEV = calculateRaiseEV(eqWin, potSize, betSize * 2.5, 0.3);

  const evs: Record<DrillAction, number> = { fold: foldEV, call: callEV, raise: raiseEV };
  const bestAction = (Object.entries(evs) as [DrillAction, number][]).sort((a, b) => b[1] - a[1])[0][0];

  return { holeCards, board, potSize, betSize, equity: eqWin, evs, bestAction };
}

export function PostflopDrill({ onResult }: PostflopDrillProps) {
  const [scenario, setScenario] = useState(generateScenario);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleAction = useCallback(
    (action: DrillAction) => {
      const correct = action === scenario.bestAction;
      const evStr = Object.entries(scenario.evs)
        .map(([a, ev]) => `${a}: ${ev >= 0 ? '+' : ''}${ev.toFixed(1)}`)
        .join(', ');

      const explanation = correct
        ? `Correct! ${action} has the highest EV. EVs: ${evStr}`
        : `The best play was ${scenario.bestAction}. EVs: ${evStr}`;

      setFeedback({ correct, explanation });
      onResult(correct);
    },
    [scenario, onResult],
  );

  const handleNext = () => {
    setScenario(generateScenario());
    setFeedback(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-bold">Postflop Scenario</h2>
      <div className="flex gap-2">
        <CardDisplay card={scenario.holeCards[0]} size="lg" />
        <CardDisplay card={scenario.holeCards[1]} size="lg" />
      </div>
      <div className="flex gap-2">
        {scenario.board.map((card, i) => (
          <CardDisplay key={i} card={card} size="md" />
        ))}
      </div>
      <div className="bg-gray-800 rounded-lg p-3 text-center text-sm">
        <p className="text-gray-400">Pot: <span className="text-white font-bold">{scenario.potSize}</span></p>
        <p className="text-gray-400">Opponent bets: <span className="text-white font-bold">{scenario.betSize}</span></p>
      </div>
      {!feedback ? (
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => handleAction('fold')}>Fold</Button>
          <Button variant="secondary" onClick={() => handleAction('call')}>Call</Button>
          <Button variant="primary" onClick={() => handleAction('raise')}>Raise</Button>
        </div>
      ) : (
        <DrillFeedback correct={feedback.correct} explanation={feedback.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
```

- [ ] **Step 8: Implement DrillSelector**

Create `src/components/drills/DrillSelector.tsx`:

```tsx
type DrillType = 'preflop' | 'potOdds' | 'equity' | 'postflop';

interface DrillSelectorProps {
  onSelect: (drill: DrillType) => void;
  accuracies: Record<DrillType, number>;
}

const DRILLS: { id: DrillType; name: string; description: string }[] = [
  { id: 'preflop', name: 'Preflop Trainer', description: 'Practice opening ranges by position' },
  { id: 'potOdds', name: 'Pot Odds Quiz', description: 'Calculate whether calling is profitable' },
  { id: 'equity', name: 'Equity Estimation', description: 'Estimate your hand equity vs a random hand' },
  { id: 'postflop', name: 'Postflop Scenarios', description: 'Choose the best play in postflop spots' },
];

export function DrillSelector({ onSelect, accuracies }: DrillSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {DRILLS.map((drill) => (
        <button
          key={drill.id}
          onClick={() => onSelect(drill.id)}
          className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg p-4 text-left transition-colors"
        >
          <h3 className="font-bold text-white mb-1">{drill.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{drill.description}</p>
          {accuracies[drill.id] > 0 && (
            <div className="text-xs text-green-400">
              Accuracy: {Math.round(accuracies[drill.id] * 100)}%
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 9: Run PreflopDrill test**

```bash
npx vitest run tests/components/PreflopDrill.test.tsx
```

Expected: All PASS.

- [ ] **Step 10: Commit**

```bash
git add src/components/drills/ tests/components/PreflopDrill.test.tsx
git commit -m "feat: add drill components — preflop, pot odds, equity estimation, postflop scenarios"
```

---

## Task 16: Dashboard Components

**Files:**
- Create: `src/components/dashboard/StatsOverview.tsx`, `src/components/dashboard/AccuracyChart.tsx`, `src/components/dashboard/WinRateChart.tsx`, `src/components/dashboard/WeakSpots.tsx`

- [ ] **Step 1: Implement StatsOverview**

Create `src/components/dashboard/StatsOverview.tsx`:

```tsx
interface StatsOverviewProps {
  handsPlayed: number;
  bbWonLost: number;
  overallAccuracy: number;
  drillsCompleted: number;
}

export function StatsOverview({ handsPlayed, bbWonLost, overallAccuracy, drillsCompleted }: StatsOverviewProps) {
  const cards = [
    { label: 'Hands Played', value: handsPlayed.toString() },
    { label: 'BB Won/Lost', value: `${bbWonLost >= 0 ? '+' : ''}${bbWonLost.toFixed(1)}`, color: bbWonLost >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Drill Accuracy', value: `${Math.round(overallAccuracy * 100)}%` },
    { label: 'Drills Completed', value: drillsCompleted.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">{card.label}</div>
          <div className={`text-xl font-bold ${card.color ?? 'text-white'}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement AccuracyChart (simple bar chart)**

Create `src/components/dashboard/AccuracyChart.tsx`:

```tsx
interface AccuracyChartProps {
  accuracies: { label: string; value: number }[];
}

export function AccuracyChart({ accuracies }: AccuracyChartProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold mb-3">Drill Accuracy</h3>
      <div className="flex flex-col gap-2">
        {accuracies.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.round(item.value * 100)}%` }}
              />
            </div>
            <span className="text-xs text-white w-10 text-right">{Math.round(item.value * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement WinRateChart**

Create `src/components/dashboard/WinRateChart.tsx`:

```tsx
interface SessionData {
  handsPlayed: number;
  bbWonLost: number;
}

interface WinRateChartProps {
  sessions: SessionData[];
}

export function WinRateChart({ sessions }: WinRateChartProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-bold mb-3">Win Rate Trend</h3>
        <p className="text-xs text-gray-400">Play some hands to see your trend.</p>
      </div>
    );
  }

  const maxBB = Math.max(...sessions.map((s) => Math.abs(s.bbWonLost)), 10);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold mb-3">Win Rate Trend (BB/session)</h3>
      <div className="flex items-end gap-1 h-24">
        {sessions.slice(-20).map((session, i) => {
          const height = Math.abs(session.bbWonLost) / maxBB * 100;
          const isPositive = session.bbWonLost >= 0;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ height: `${Math.max(height, 4)}%` }}
              title={`${isPositive ? '+' : ''}${session.bbWonLost.toFixed(1)} BB`}
            />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement WeakSpots**

Create `src/components/dashboard/WeakSpots.tsx`:

```tsx
interface WeakSpotsProps {
  accuracies: { drillType: string; accuracy: number }[];
}

export function WeakSpots({ accuracies }: WeakSpotsProps) {
  const weak = accuracies
    .filter((a) => a.accuracy < 0.6 && a.accuracy > 0)
    .sort((a, b) => a.accuracy - b.accuracy);

  if (weak.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-bold mb-2">Areas to Improve</h3>
        <p className="text-xs text-gray-400">
          {accuracies.some((a) => a.accuracy > 0)
            ? 'Looking good! No major weak spots detected.'
            : 'Complete some drills to see your weak areas.'}
        </p>
      </div>
    );
  }

  const suggestions: Record<string, string> = {
    preflop: 'Practice your opening ranges — focus on position-dependent hand selection.',
    potOdds: 'Work on pot odds math — practice converting bet sizes to required equity.',
    equity: 'Improve your equity intuition — practice estimating hand vs range matchups.',
    postflop: 'Review postflop play — focus on EV-based decision making.',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold mb-2">Areas to Improve</h3>
      <div className="flex flex-col gap-2">
        {weak.map((item) => (
          <div key={item.drillType} className="text-sm">
            <span className="text-red-400 font-medium capitalize">{item.drillType}</span>
            <span className="text-gray-400"> — {Math.round(item.accuracy * 100)}% accuracy</span>
            <p className="text-xs text-gray-500 mt-0.5">{suggestions[item.drillType]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/
git commit -m "feat: add dashboard components — stats overview, accuracy chart, win rate, weak spots"
```

---

## Task 17: Pages (Play, Drills, Stats)

**Files:**
- Create: `src/pages/PlayPage.tsx`, `src/pages/DrillsPage.tsx`, `src/pages/StatsPage.tsx`

- [ ] **Step 1: Implement PlayPage**

Create `src/pages/PlayPage.tsx`:

```tsx
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

    setAdvice({
      equity: equity.win,
      potOdds,
      actionEVs,
      recommendedAction: best.action,
      explanation: best.explanation,
    });
  }, [gameState, isWaitingForHuman]);

  if (!gameState) return <div className="text-center p-8">Loading...</div>;

  const validActions = isWaitingForHuman && !gameState.isHandComplete ? getValidActions(gameState) : [];

  const handleAction = (action: PlayerAction) => {
    humanAct(action);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col items-center gap-4">
        <PokerTable
          gameState={gameState}
          validActions={validActions}
          isWaitingForHuman={isWaitingForHuman && !gameState.isHandComplete}
          onAction={handleAction}
        />

        {gameState.isHandComplete && (
          <div className="text-center">
            <div className="mb-2">
              {gameState.winners.map((w) => {
                const player = gameState.players.find((p) => p.id === w.playerId);
                return (
                  <div key={w.playerId} className="text-green-400 font-bold">
                    {player?.name} wins {w.amount}
                  </div>
                );
              })}
            </div>
            <Button onClick={dealNewHand}>Deal Next Hand</Button>
          </div>
        )}

        {!gameState.isHandComplete && gameState.pot === 0 && (
          <Button onClick={dealNewHand}>Deal Hand</Button>
        )}
      </div>

      {showCoaching && (
        <CoachingPanel advice={advice} visible={showCoaching} onToggle={toggleCoaching} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Implement DrillsPage**

Create `src/pages/DrillsPage.tsx`:

```tsx
import { useState, useCallback } from 'react';
import { useStatsStore } from '../stores/stats-store';
import { DrillSelector } from '../components/drills/DrillSelector';
import { PreflopDrill } from '../components/drills/PreflopDrill';
import { PotOddsDrill } from '../components/drills/PotOddsDrill';
import { EquityDrill } from '../components/drills/EquityDrill';
import { PostflopDrill } from '../components/drills/PostflopDrill';

type DrillType = 'preflop' | 'potOdds' | 'equity' | 'postflop';

export function DrillsPage() {
  const [activeDrill, setActiveDrill] = useState<DrillType | null>(null);
  const { addDrillResult, getAccuracy } = useStatsStore();

  const handleResult = useCallback(
    (drillType: DrillType) => (correct: boolean) => {
      addDrillResult({ drillType, correct, timestamp: Date.now() });
    },
    [addDrillResult],
  );

  const accuracies: Record<DrillType, number> = {
    preflop: getAccuracy('preflop'),
    potOdds: getAccuracy('potOdds'),
    equity: getAccuracy('equity'),
    postflop: getAccuracy('postflop'),
  };

  if (!activeDrill) {
    return (
      <div>
        <h1 className="text-xl font-bold p-4">Training Drills</h1>
        <DrillSelector onSelect={setActiveDrill} accuracies={accuracies} />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setActiveDrill(null)}
        className="text-sm text-gray-400 hover:text-white p-4"
      >
        &larr; Back to Drills
      </button>
      {activeDrill === 'preflop' && <PreflopDrill onResult={handleResult('preflop')} />}
      {activeDrill === 'potOdds' && <PotOddsDrill onResult={handleResult('potOdds')} />}
      {activeDrill === 'equity' && <EquityDrill onResult={handleResult('equity')} />}
      {activeDrill === 'postflop' && <PostflopDrill onResult={handleResult('postflop')} />}
    </div>
  );
}
```

- [ ] **Step 3: Implement StatsPage**

Create `src/pages/StatsPage.tsx`:

```tsx
import { useStatsStore } from '../stores/stats-store';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { AccuracyChart } from '../components/dashboard/AccuracyChart';
import { WinRateChart } from '../components/dashboard/WinRateChart';
import { WeakSpots } from '../components/dashboard/WeakSpots';

export function StatsPage() {
  const { drillResults, sessions, currentSession, getAccuracy, exportData, importData } = useStatsStore();

  const totalHands = sessions.reduce((sum, s) => sum + s.handsPlayed, 0) + currentSession.handsPlayed;
  const totalBB = sessions.reduce((sum, s) => sum + s.bbWonLost, 0) + currentSession.bbWonLost;

  const accuracies = [
    { label: 'Preflop', value: getAccuracy('preflop') },
    { label: 'Pot Odds', value: getAccuracy('potOdds') },
    { label: 'Equity', value: getAccuracy('equity') },
    { label: 'Postflop', value: getAccuracy('postflop') },
  ];

  const weakSpotData = [
    { drillType: 'preflop', accuracy: getAccuracy('preflop') },
    { drillType: 'potOdds', accuracy: getAccuracy('potOdds') },
    { drillType: 'equity', accuracy: getAccuracy('equity') },
    { drillType: 'postflop', accuracy: getAccuracy('postflop') },
  ];

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poker-trainer-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        importData(reader.result as string);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Stats & Progress</h1>
      <StatsOverview
        handsPlayed={totalHands}
        bbWonLost={totalBB}
        overallAccuracy={getAccuracy()}
        drillsCompleted={drillResults.length}
      />
      <AccuracyChart accuracies={accuracies} />
      <WinRateChart sessions={sessions} />
      <WeakSpots accuracies={weakSpotData} />
      <div className="flex gap-2">
        <button onClick={handleExport} className="text-xs text-gray-400 hover:text-white underline">
          Export Data
        </button>
        <button onClick={handleImport} className="text-xs text-gray-400 hover:text-white underline">
          Import Data
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/
git commit -m "feat: add Play, Drills, and Stats pages"
```

---

## Task 18: Wire Up App Shell

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx to use all pages and nav**

Replace `src/App.tsx`:

```tsx
import { useState } from 'react';
import { NavBar } from './components/common/NavBar';
import { Layout } from './components/common/Layout';
import { PlayPage } from './pages/PlayPage';
import { DrillsPage } from './pages/DrillsPage';
import { StatsPage } from './pages/StatsPage';

type Page = 'play' | 'drills' | 'stats';

export default function App() {
  const [page, setPage] = useState<Page>('play');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavBar currentPage={page} onNavigate={setPage} />
      <Layout>
        {page === 'play' && <PlayPage />}
        {page === 'drills' && <DrillsPage />}
        {page === 'stats' && <StatsPage />}
      </Layout>
    </div>
  );
}
```

- [ ] **Step 2: Verify the app builds**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up app shell with nav, pages, and layout"
```

---

## Task 19: GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Pages deployment workflow"
```

---

## Task 20: Final Integration Test and Cleanup

**Files:**
- Modify: `package.json` (add test script if not present)

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Run dev server and manually verify**

```bash
npm run dev
```

Expected: All three pages (Play, Drills, Stats) render. Navigation works. Cards display correctly.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final integration verification"
```
