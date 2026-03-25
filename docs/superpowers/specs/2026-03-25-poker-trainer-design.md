# Poker Trainer — Design Spec

## Overview

A browser-based Texas Hold'em poker training application that teaches players strategy through interactive play and targeted drills. Runs entirely client-side with no backend. Mobile-first responsive design, deployed to GitHub Pages.

**Target audience:** Players who know the rules of Hold'em but want to improve their strategic play (hand selection, position, pot odds, EV thinking, range estimation).

## Core Architecture

### Game Engine

A pure TypeScript module handling all poker mechanics:

- Deck shuffling (Fisher-Yates) and dealing
- Betting round management (preflop, flop, turn, river)
- Hand evaluation (ranking, comparison, winner determination)
- Pot calculation (including side pots)
- Showdown logic

The engine is stateless and deterministic — it takes a game state object as input and returns a new game state. This same engine powers both Play Mode and Drill Mode.

### AI System

Layered opponent intelligence with three difficulty tiers:

**Player Archetypes (Beginner difficulty):**
- Tight-Aggressive (TAG): Plays few hands, bets/raises when in
- Loose-Aggressive (LAG): Plays many hands, applies pressure
- Tight-Passive (TP): Plays few hands, mostly calls
- Loose-Passive (LP): Plays many hands, rarely raises

Each archetype has weighted probability tables for actions, adjusted by:
- Position (early/middle/late/blinds)
- Hand strength (relative to board)
- Pot odds
- Intentional "leaks" to mimic real beginner/intermediate players

**Intermediate difficulty:**
- Tighter ranges, fewer leaks
- Position-aware aggression
- Basic bluff detection

**Advanced difficulty (near-GTO):**
- Precomputed decision tables for common spots
- Balanced ranges (mixed strategies with correct frequencies)
- Position-dependent opening, 3-betting, and c-betting frequencies
- No exploitable leaks

### Statistics Engine

- **Equity Calculator:** Monte Carlo simulation running in a Web Worker. Given your hand, the board, and estimated opponent ranges, simulates thousands of runouts to compute win/tie/loss percentages.
- **EV Calculator:** For each available action (fold/call/raise), computes expected value based on equity, pot size, and bet sizing.
- **Pot Odds Display:** Real-time pot odds vs required equity to call.
- **Opponent Range Estimation:** Narrows opponent's likely holdings based on their actions throughout the hand (position they opened from, sizing, aggression).

## App Modes

### 1. Play Mode

Full poker table experience with AI opponents and real-time coaching.

**Table Configuration:**
- 6-max or heads-up (user selectable)
- 1-5 AI opponents
- Selectable difficulty per opponent
- Selectable archetype per opponent (or random)

**Coaching Overlay (togglable):**
- Your hand's equity vs estimated opponent ranges
- EV of each available action
- Pot odds vs required equity
- Recommended action with brief strategic explanation
- Can be toggled on/off (swipe on mobile, button on desktop)

**Post-Hand Review:**
- Summary after each hand showing:
  - Whether each of your decisions was +EV or -EV
  - What the optimal play would have been at each decision point
  - How your actual action compared to the recommendation

**Session Stats:**
- Running totals: hands played, big blinds won/lost
- Decision accuracy percentage
- Positional win rates

### 2. Drill Mode

Targeted practice scenarios graded against established strategy:

**Preflop Trainer:**
- Given a position and hole cards, choose: open/fold/3-bet
- Graded against standard opening range charts by position
- Tracks accuracy by position and hand category

**Pot Odds Quiz:**
- Given a pot size, bet size, and your draw, determine if you have correct odds to call
- Teaches the math of pot odds and implied odds

**Equity Estimation:**
- Shown your hand vs a defined range
- Estimate your equity within a margin
- Builds intuition for hand-vs-range matchups

**Postflop Scenarios:**
- Board texture, your hand, and opponent action history presented
- Choose the best play from available actions
- Graded on EV, with explanation of why the correct answer is best

**Progress Tracking:**
- Each drill type tracks accuracy over time
- Identifies weak areas and suggests drills to practice
- Streak tracking for motivation

### 3. Stats & Progress Dashboard

- Historical accuracy across all drill categories
- Play mode trends (win rate over sessions, positional stats)
- Weak spot identification with actionable suggestions (e.g., "You're folding too much in the cutoff", "You're overvaluing suited connectors")
- Visual charts for progress over time

## UI & Mobile Design

### Layout Strategy

Mobile-first responsive design targeting 360px+ screens, scaling up for tablet and desktop.

### Play Mode Layout

- **Top:** Opponent cards and chip counts in a semi-circle arrangement
- **Center:** Community cards and pot display
- **Bottom:** Player's hole cards, action buttons (fold/call/raise with slider), coaching overlay
- **Mobile:** Coaching panel slides up from bottom sheet
- **Desktop:** Coaching panel sits as a right sidebar

### Drill Mode Layout

- Card-based UI — each drill presented as a scenario card
- Large, tap-friendly action buttons
- Immediate color-coded feedback (green = correct, red = suboptimal)
- Explanation shown after each answer

### Visual Design

- Dark theme (standard for poker, easy on the eyes)
- Cards rendered via CSS + SVG (no image assets, small bundle)
- Subtle animations for dealing, chip movement, card reveals
- Tailwind CSS for responsive breakpoints and utility-first styling

### Navigation

- **Mobile:** Bottom tab bar (Play / Drills / Stats)
- **Desktop:** Top nav bar
- Responsive switch based on viewport width

## Data & State Management

### State Management: Zustand

Separate stores for distinct concerns:

- **Game Store:** Current hand state, player states, pot, community cards, betting round
- **AI Store:** Opponent profiles, action history for range narrowing
- **Stats Store:** Session and historical statistics, drill results, progress data
- **Settings Store:** Difficulty, coaching overlay preferences, table size, theme

### Persistence: localStorage

- Stats and progress serialized to localStorage on each meaningful update
- Settings persisted across sessions
- Export/import as JSON for user backup

### Static Data (bundled JSON)

- Preflop opening ranges by position (standard charts for all positions)
- Hand strength rankings and precomputed equity lookup tables
- GTO frequencies for common spots (preflop opens, 3-bets, c-bets, check-raises)
- Ships with the app — no network requests needed at runtime

### Web Workers

- Monte Carlo equity simulation runs in a dedicated Web Worker
- Keeps UI thread free for smooth 60fps animations
- Worker API: receives (hand, board, opponent ranges) → returns equity percentages

## Technology Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Equity Calculation | Monte Carlo simulation in Web Worker |
| Card Rendering | CSS + SVG |
| Persistence | localStorage |
| Deployment | GitHub Pages |
| Testing | Vitest + React Testing Library |

## Project Structure

```
src/
  engine/        — pure game logic (deck, hand eval, betting, pot)
  ai/            — opponent archetypes, GTO tables, decision logic
  stats/         — equity calculator, EV computation, range estimation
  workers/       — Web Worker for Monte Carlo simulation
  stores/        — Zustand stores (game, ai, stats, settings)
  components/
    table/       — poker table, cards, chips, community cards
    coaching/    — overlay panels, recommendations, explanations
    drills/      — drill scenarios, quiz UI, feedback
    dashboard/   — stats charts, progress tracking, weak spots
    common/      — buttons, nav, layout, card rendering
  data/          — static JSON (ranges, GTO tables, hand rankings)
  pages/         — Play, Drills, Stats top-level views
  App.tsx
  main.tsx
```

## Deployment

- Static site built with Vite, deployed to GitHub Pages
- No backend, no authentication, no API calls
- Works fully offline once loaded (service worker for caching could be added later)
- Single repository with GitHub Actions for automated builds and deploys

## Out of Scope

- Tournament mode / ICM calculations
- Multiplayer / real opponents
- User accounts or server-side persistence
- Variants other than Texas Hold'em
- Real money or play money economy
- Chat or social features
