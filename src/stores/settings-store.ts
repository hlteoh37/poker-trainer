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
