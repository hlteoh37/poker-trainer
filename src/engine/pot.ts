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

  const maxAllIn = allInAmounts[allInAmounts.length - 1];
  const remainingContributors = players.filter((p) => p.currentBet > maxAllIn);
  if (remainingContributors.length > 0) {
    const remaining = remainingContributors.reduce((sum, p) => sum + (p.currentBet - maxAllIn), 0);
    const eligible = remainingContributors.filter((p) => !p.hasFolded);
    if (remaining > 0) {
      pots.push({ amount: remaining, eligiblePlayerIds: eligible.map((p) => p.id) });
    }
  }
  return pots;
}
