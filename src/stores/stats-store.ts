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

      addDrillResult: (result) => set((state) => ({ drillResults: [...state.drillResults, result] })),

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
        const results = drillType ? get().drillResults.filter((r) => r.drillType === drillType) : get().drillResults;
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
