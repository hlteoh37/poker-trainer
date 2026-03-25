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
