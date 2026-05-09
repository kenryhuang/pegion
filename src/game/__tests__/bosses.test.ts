import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { spawnTimedEncounters, updateBosses } from '../systems/BossSystem';

describe('boss and elite timing', () => {
  it('spawns the first elite at three minutes', () => {
    const state = createGameState('elite');
    state.mode = 'running';
    state.time = 180;

    spawnTimedEncounters(state);

    expect(state.enemies.some((enemy) => enemy.isElite)).toBe(true);
  });

  it('spawns the first boss at six minutes', () => {
    const state = createGameState('boss');
    state.mode = 'running';
    state.time = 360;

    spawnTimedEncounters(state);

    expect(state.bosses[0].kind).toBe('printer_boss');
  });

  it('creates a boss warning before damage resolves', () => {
    const state = createGameState('warning');
    state.mode = 'running';
    state.time = 360;
    spawnTimedEncounters(state);

    updateBosses(state, 10);

    expect(state.bosses[0].activeWarning).not.toBeNull();
  });
});
