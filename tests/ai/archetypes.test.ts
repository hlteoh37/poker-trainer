import { describe, it, expect } from 'vitest';
import { getArchetype, ARCHETYPES } from '../../src/ai/archetypes';

describe('ARCHETYPES', () => {
  it('has 4 archetypes', () => {
    expect(Object.keys(ARCHETYPES)).toHaveLength(4);
  });

  it('TAG has low VPIP and high aggression', () => {
    const tag = ARCHETYPES.TAG;
    expect(tag.vpip).toBeLessThan(0.3);
    expect(tag.aggression).toBeGreaterThan(0.6);
  });

  it('LP has high VPIP and low aggression', () => {
    const lp = ARCHETYPES.LP;
    expect(lp.vpip).toBeGreaterThan(0.5);
    expect(lp.aggression).toBeLessThan(0.4);
  });
});

describe('getArchetype', () => {
  it('returns the matching archetype profile', () => {
    const tag = getArchetype('TAG');
    expect(tag.id).toBe('TAG');
    expect(tag.name).toBe('Tight-Aggressive');
  });
});
