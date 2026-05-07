import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { fireAutoAttack, updateProjectiles } from '../systems/CombatSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { updateMovement } from '../systems/MovementSystem';
import { spawnEnemy } from '../systems/SpawnSystem';
import { updateStage } from '../systems/StageSystem';

describe('simulation systems', () => {
  it('moves and dashes the player with cooldown', () => {
    const state = createGameState('move');
    state.mode = 'running';
    state.input.moveX = 1;
    state.input.dashPressed = true;

    updateMovement(state, 0.016);

    expect(state.player.position.x).toBeGreaterThan(3);
    expect(state.player.dashCooldownRemaining).toBeGreaterThan(0);
    expect(state.player.invincibleRemaining).toBeGreaterThan(0);
  });

  it('spawns an enemy and auto-fires at the nearest target', () => {
    const state = createGameState('combat');
    state.mode = 'running';
    spawnEnemy(state, 'slow_mob', { x: 100, y: 0 });

    fireAutoAttack(state);

    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].velocity.x).toBeGreaterThan(0);
  });

  it('turns killed enemies into XP pickups', () => {
    const state = createGameState('collision');
    state.mode = 'running';
    spawnEnemy(state, 'slow_mob', { x: 20, y: 0 });
    state.projectiles.push({
      id: 'projectile-test',
      owner: 'player',
      position: { x: 20, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 5 },
      damage: 999,
      pierceRemaining: 0,
      lifeRemaining: 1,
      hitEnemyIds: new Set<string>(),
    });

    applyCollisions(state);

    expect(state.enemies).toHaveLength(0);
    expect(state.pickups[0].kind).toBe('xp_crystal');
    expect(state.stats.kills).toBe(1);
  });

  it('advances stage by run time', () => {
    const state = createGameState('stage');
    state.time = 601;

    updateStage(state);

    expect(state.stageId).toBe('dense');
  });
});
