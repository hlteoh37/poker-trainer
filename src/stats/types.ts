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
