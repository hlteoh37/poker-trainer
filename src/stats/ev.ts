export function calculateFoldEV(): number { return 0; }

export function calculateCallEV(equity: number, potSize: number, costToCall: number): number {
  return equity * (potSize + costToCall) - costToCall;
}

export function calculateRaiseEV(equity: number, potSize: number, raiseAmount: number, opponentFoldProbability: number): number {
  const foldEV = opponentFoldProbability * potSize;
  const callEV = (1 - opponentFoldProbability) * (equity * (potSize + raiseAmount * 2) - raiseAmount);
  return foldEV + callEV;
}
