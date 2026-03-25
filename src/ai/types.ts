export type ArchetypeId = 'TAG' | 'LAG' | 'TP' | 'LP';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ArchetypeProfile {
  id: ArchetypeId;
  name: string;
  vpip: number;
  pfr: number;
  aggression: number;
  bluffFrequency: number;
  foldToRaise: number;
}

export interface AIConfig {
  archetype: ArchetypeId;
  difficulty: Difficulty;
}
