import type { ArchetypeId, ArchetypeProfile } from './types';

export const ARCHETYPES: Record<ArchetypeId, ArchetypeProfile> = {
  TAG: { id: 'TAG', name: 'Tight-Aggressive', vpip: 0.22, pfr: 0.18, aggression: 0.75, bluffFrequency: 0.15, foldToRaise: 0.4 },
  LAG: { id: 'LAG', name: 'Loose-Aggressive', vpip: 0.45, pfr: 0.3, aggression: 0.8, bluffFrequency: 0.35, foldToRaise: 0.25 },
  TP: { id: 'TP', name: 'Tight-Passive', vpip: 0.18, pfr: 0.08, aggression: 0.3, bluffFrequency: 0.05, foldToRaise: 0.6 },
  LP: { id: 'LP', name: 'Loose-Passive', vpip: 0.55, pfr: 0.1, aggression: 0.25, bluffFrequency: 0.1, foldToRaise: 0.5 },
};

export function getArchetype(id: ArchetypeId): ArchetypeProfile {
  return ARCHETYPES[id];
}
