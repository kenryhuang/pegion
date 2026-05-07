import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { spawnTimedEncounters, updateBosses } from '../systems/BossSystem';
import { fireAutoAttack, updateProjectiles } from '../systems/CombatSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { addExperience } from '../systems/ExperienceSystem';
import { updateMovement } from '../systems/MovementSystem';
import { spawnEnemy } from '../systems/SpawnSystem';
import { updateStage } from '../systems/StageSystem';
import { unlockSkill } from '../systems/SkillSystem';

describe('core run flow', () => {
  it('covers start, spawn, XP, level-up, skill pick, elite, boss, and death', () => {
    const state = createGameState('flow');
    state.mode = 'running';
    state.input.moveX = 1;
    updateMovement(state, 0.016);

    spawnEnemy(state, 'slow_mob', { x: 80, y: 0 });
    fireAutoAttack(state);
    state.projectiles[0].position = { x: 80, y: 0 };
    state.projectiles[0].damage = 999;
    applyCollisions(state);
    expect(state.stats.kills).toBe(1);

    addExperience(state, 10);
    expect(state.mode).toBe('levelUp');
    unlockSkill(state, 'office_paperclip');
    expect(state.mode).toBe('running');

    state.time = 180;
    updateStage(state);
    spawnTimedEncounters(state);
    expect(state.enemies.some((enemy) => enemy.isElite)).toBe(true);

    state.time = 360;
    spawnTimedEncounters(state);
    updateBosses(state, 10);
    expect(state.bosses.length).toBeGreaterThan(0);

    state.player.hp = 1;
    state.enemies[0].position = { ...state.player.position };
    state.player.invincibleRemaining = 0;
    applyCollisions(state);
    expect(state.mode).toBe('gameOver');

    updateProjectiles(state, 0.016);
  });

  it('auto-fires at bosses when no smaller enemies are available', () => {
    const state = createGameState('boss-target');
    state.mode = 'running';
    state.time = 360;
    spawnTimedEncounters(state);
    state.enemies = [];
    state.bosses[0].position = { x: 100, y: 0 };

    fireAutoAttack(state);

    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].velocity.x).toBeGreaterThan(0);
  });
});
