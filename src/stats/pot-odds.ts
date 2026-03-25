export function calculatePotOdds(potSize: number, costToCall: number): number {
  if (costToCall === 0) return 0;
  return costToCall / (potSize + costToCall);
}

export function isCallProfitable(equity: number, potSize: number, costToCall: number): boolean {
  const potOdds = calculatePotOdds(potSize, costToCall);
  return equity > potOdds;
}
