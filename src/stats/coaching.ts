import type { Card, GameState } from '../engine/types';
import type { CoachingAdvice, ActionEV } from './types';
import { calculateEquity } from './equity';
import { calculateCallEV, calculateFoldEV, calculateRaiseEV } from './ev';
import { calculatePotOdds } from './pot-odds';
import { isInOpeningRange } from '../data/preflop-ranges';
import { getHandPercentile } from '../data/hand-rankings';
import { rankValue } from '../engine/card';

/** Convert two hole cards to standard notation like "AKs", "72o", "JJ" */
export function holeCardsToNotation(cards: [Card, Card]): string {
  const [a, b] = cards;
  const rv1 = rankValue(a.rank);
  const rv2 = rankValue(b.rank);
  const high = rv1 >= rv2 ? a : b;
  const low = rv1 >= rv2 ? b : a;

  const rankStr = (r: string) => (r === '10' ? 'T' : r);
  const highR = rankStr(high.rank);
  const lowR = rankStr(low.rank);

  if (highR === lowR) return `${highR}${lowR}`;
  const suited = high.suit === low.suit ? 's' : 'o';
  return `${highR}${lowR}${suited}`;
}

type HandCategory = 'premium' | 'strong' | 'playable' | 'marginal' | 'trash';

function categorizeHand(percentile: number): HandCategory {
  if (percentile <= 5) return 'premium';
  if (percentile <= 15) return 'strong';
  if (percentile <= 30) return 'playable';
  if (percentile <= 50) return 'marginal';
  return 'trash';
}

function handCategoryLabel(cat: HandCategory): string {
  switch (cat) {
    case 'premium': return 'a premium hand';
    case 'strong': return 'a strong hand';
    case 'playable': return 'a playable hand';
    case 'marginal': return 'a marginal hand';
    case 'trash': return 'a weak hand';
  }
}

/** Estimate opponent fold probability based on context instead of hardcoded 0.3 */
function estimateFoldProbability(gameState: GameState): number {
  const activePlayers = gameState.players.filter((p) => !p.hasFolded && !p.isHuman);
  if (activePlayers.length === 0) return 0.3;

  // If opponents have already put in significant chips, they're less likely to fold
  const highestBet = Math.max(...gameState.players.map((p) => p.currentBet));
  const avgOpponentInvestment = activePlayers.reduce((sum, p) => sum + p.currentBet, 0) / activePlayers.length;

  if (gameState.currentBettingRound === 'preflop') {
    // Preflop: more opponents = lower individual fold probability matters less
    // If no one has raised, moderate fold probability
    if (highestBet <= gameState.bigBlind) return 0.5;
    // If there's been a raise, opponents who called are less likely to fold to another raise
    return 0.2;
  }

  // Postflop: if opponents have invested heavily relative to pot, they're committed
  const potCommitment = avgOpponentInvestment / Math.max(gameState.pot, 1);
  if (potCommitment > 0.3) return 0.15;
  if (potCommitment > 0.1) return 0.25;
  return 0.4;
}

function describePreflopSituation(
  notation: string,
  position: string,
  inRange: boolean,
  percentile: number,
  category: HandCategory,
): string {
  const posName = position;
  if (inRange) {
    if (category === 'premium') {
      return `${notation} is ${handCategoryLabel(category)} (top ${Math.round(percentile)}%) — one of the best starting hands. From ${posName}, you should always be raising for value.`;
    }
    return `${notation} is ${handCategoryLabel(category)} (top ${Math.round(percentile)}%) and is in your opening range from ${posName}.`;
  }
  return `${notation} is ${handCategoryLabel(category)} (top ${Math.round(percentile)}%) and is outside your recommended opening range from ${posName}. You'll find better spots — folding preserves chips for stronger hands.`;
}

function describePostflopSituation(
  equity: number,
  potOdds: number,
  toCall: number,
  pot: number,
): string {
  const eqPct = Math.round(equity * 100);
  const oddsPct = Math.round(potOdds * 100);

  if (toCall === 0) {
    if (equity > 0.6) return `With ${eqPct}% equity, you have a strong hand. Consider betting for value.`;
    if (equity > 0.4) return `With ${eqPct}% equity, you have a decent hand. You can check or make a small bet.`;
    return `With ${eqPct}% equity, your hand is vulnerable. Checking is safe here.`;
  }

  if (equity > potOdds) {
    const margin = eqPct - oddsPct;
    if (margin > 20) return `Your ${eqPct}% equity far exceeds the ${oddsPct}% pot odds needed to call — this is a profitable spot.`;
    return `Your ${eqPct}% equity beats the ${oddsPct}% pot odds (${toCall} to win ${pot}) — calling is +EV here.`;
  }
  return `Your ${eqPct}% equity doesn't meet the ${oddsPct}% pot odds required. You need ${oddsPct}% but only have ${eqPct}%.`;
}

export function generateCoachingAdvice(gameState: GameState): CoachingAdvice | null {
  const human = gameState.players.find((p) => p.isHuman);
  if (!human?.holeCards) return null;

  const notation = holeCardsToNotation(human.holeCards);
  const percentile = getHandPercentile(notation);
  const category = categorizeHand(percentile);
  const position = human.position;
  const inRange = isInOpeningRange(notation, position);
  const isPreflop = gameState.currentBettingRound === 'preflop';

  const equity = calculateEquity(human.holeCards, gameState.communityCards, 500);
  const highestBet = Math.max(...gameState.players.map((p) => p.currentBet));
  const toCall = highestBet - human.currentBet;
  const potOdds = calculatePotOdds(gameState.pot, toCall);
  const foldProb = estimateFoldProbability(gameState);

  const actionEVs: ActionEV[] = [];

  // Fold
  const foldExplanation = toCall === 0
    ? 'No cost to see more cards — checking is free.'
    : isPreflop && !inRange
      ? `${notation} from ${position} is outside your opening range. Folding saves ${toCall} chips for better opportunities.`
      : equity.win < potOdds
        ? `Your equity (${Math.round(equity.win * 100)}%) doesn't justify the ${toCall} chip call. Fold and wait for a better spot.`
        : 'You lose nothing more by folding.';

  actionEVs.push({ action: { type: 'fold' }, ev: calculateFoldEV(), explanation: foldExplanation });

  // Call / Check
  if (toCall > 0) {
    const callEV = calculateCallEV(equity.win, gameState.pot, toCall);
    let callExplanation: string;
    if (callEV > 0) {
      callExplanation = `Calling ${toCall} with ${Math.round(equity.win * 100)}% equity into a ${gameState.pot} pot is profitable (need ${Math.round(potOdds * 100)}% equity).`;
    } else {
      callExplanation = `Calling ${toCall} with only ${Math.round(equity.win * 100)}% equity is slightly -EV — you need ${Math.round(potOdds * 100)}% to break even.`;
    }
    actionEVs.push({ action: { type: 'call' }, ev: callEV, explanation: callExplanation });
  } else {
    actionEVs.push({ action: { type: 'check' }, ev: 0, explanation: 'Checking is free — no risk to see what develops.' });
  }

  // Raise
  const raiseAmount = gameState.bigBlind * 3;
  const raiseEV = calculateRaiseEV(equity.win, gameState.pot, raiseAmount, foldProb);
  let raiseExplanation: string;

  if (isPreflop) {
    if (category === 'premium' || category === 'strong') {
      raiseExplanation = `${notation} is ${handCategoryLabel(category)} — raising builds the pot with a hand that plays well against calling ranges.`;
    } else if (inRange) {
      raiseExplanation = `${notation} is in your opening range from ${position}. A standard raise is appropriate.`;
    } else {
      raiseExplanation = `${notation} is outside your opening range from ${position}. Raising here is a bluff — risky without a strong read on opponents.`;
    }
  } else {
    if (equity.win > 0.6) {
      raiseExplanation = `With ${Math.round(equity.win * 100)}% equity, raising for value is strong — you're likely ahead and want to grow the pot.`;
    } else if (equity.win > 0.4) {
      raiseExplanation = `With ${Math.round(equity.win * 100)}% equity, a raise is semi-bluff territory — you might win now or improve later.`;
    } else {
      raiseExplanation = `With only ${Math.round(equity.win * 100)}% equity, raising is a pure bluff. You're likely behind and relying on opponents to fold.`;
    }
  }
  actionEVs.push({ action: { type: 'raise' }, ev: raiseEV, explanation: raiseExplanation });

  // Pick best action
  const best = actionEVs.reduce((a, b) => (a.ev > b.ev ? a : b));

  // Build top-level explanation
  let explanation: string;
  if (isPreflop) {
    explanation = describePreflopSituation(notation, position, inRange, percentile, category);
  } else {
    explanation = describePostflopSituation(equity.win, potOdds, toCall, gameState.pot);
  }

  // Override: if hand is trash preflop and not in range, strongly recommend fold
  if (isPreflop && !inRange && (category === 'trash' || category === 'marginal') && toCall > 0) {
    return {
      equity: equity.win,
      potOdds,
      actionEVs,
      recommendedAction: { type: 'fold' },
      explanation,
    };
  }

  return {
    equity: equity.win,
    potOdds,
    actionEVs,
    recommendedAction: best.action,
    explanation,
  };
}
