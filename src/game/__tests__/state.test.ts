import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { RNG } from '../utils/RNG';

describe('game state', () => {
  it('creates a stable initial player and empty run lists', () => {
    const state = createGameState('seed-a');

    expect(state.player.id).toBe('player-1');
    expect(state.player.hp).toBe(100);
    expect(state.enemies).toHaveLength(0);
    expect(state.projectiles).toHaveLength(0);
    expect(state.pickups).toHaveLength(0);
    expect(state.stats.kills).toBe(0);
  });

  it('generates repeatable random numbers for the same seed', () => {
    const first = new RNG('same-seed');
    const second = new RNG('same-seed');

    expect([first.next(), first.next(), first.next()]).toEqual([
      second.next(),
      second.next(),
      second.next(),
    ]);
  });
});
