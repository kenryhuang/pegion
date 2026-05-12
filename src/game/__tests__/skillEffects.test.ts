import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { unlockSkill } from '../systems/SkillSystem';
import { updateClones } from '../systems/CloneSystem';
import { fireAutoAttack } from '../systems/CombatSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { updateSkillEffects } from '../systems/SkillEffectSystem';
import { updateBosses } from '../systems/BossSystem';

describe('visible skill effects', () => {
  it('creates bold critical damage text and sparks on projectile hit', () => {
    const state = createGameState('critical-effects');
    state.mode = 'running';
    state.player.weapon.critChance = 1;
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 80, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damage: 0,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    fireAutoAttack(state);
    state.projectiles[0].position = { x: 80, y: 0 };
    applyCollisions(state);

    expect(state.visualEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'damage_text', value: 24, isCritical: true }),
        expect.objectContaining({ kind: 'spark' }),
      ]),
    );
  });

  it('spawns temporary clones that fire inherited projectiles', () => {
    const state = createGameState('clone-effects');
    state.mode = 'running';
    state.player.skillPoints = 1;
    unlockSkill(state, 'clone_temporary');
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 160, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damage: 0,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    updateClones(state, 10);

    expect(state.clones.length).toBe(1);
    expect(state.projectiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ owner: 'player', damage: 5 }),
      ]),
    );
  });

  it('deals visible aura damage from shredder field', () => {
    const state = createGameState('aura-effects');
    state.mode = 'running';
    state.player.skillPoints = 5;
    for (const id of ['office_paperclip', 'office_stapler', 'office_folder_pierce', 'office_shredder_field']) {
      unlockSkill(state, id);
    }
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 40, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damage: 0,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    updateSkillEffects(state, 0.5);

    expect(state.enemies[0].hp).toBeLessThan(100);
    expect(state.visualEffects).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'damage_text' })]));
  });

  it('applies chili burn damage after projectile hits', () => {
    const state = createGameState('burn-effects');
    state.mode = 'running';
    state.player.skillPoints = 2;
    unlockSkill(state, 'kitchen_pan');
    unlockSkill(state, 'kitchen_chili');
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 50, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damage: 0,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    fireAutoAttack(state);
    state.projectiles[0].position = { x: 50, y: 0 };
    applyCollisions(state);
    updateSkillEffects(state, 1);

    expect(state.enemies[0].status.burnRemaining).toBeGreaterThan(0);
    expect(state.enemies[0].hp).toBeLessThan(88);
  });

  it('leaves a visible fire pit when chili burn starts', () => {
    const state = createGameState('fire-pit-effects');
    state.mode = 'running';
    state.player.skillPoints = 2;
    unlockSkill(state, 'kitchen_pan');
    unlockSkill(state, 'kitchen_chili');
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 50, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damage: 0,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    fireAutoAttack(state);
    state.projectiles[0].position = { x: 50, y: 0 };
    applyCollisions(state);

    expect(state.visualEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'fire_pit', position: { x: 50, y: 0 } }),
      ]),
    );
  });

  it('shows an ice wall and blocks damage when fridge shield triggers', () => {
    const state = createGameState('ice-shield-effects');
    state.mode = 'running';
    state.player.skillPoints = 3;
    unlockSkill(state, 'kitchen_pan');
    unlockSkill(state, 'kitchen_chili');
    unlockSkill(state, 'kitchen_fridge_shield');
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 12, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damage: 9,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    applyCollisions(state);

    expect(state.player.hp).toBe(100);
    expect(state.visualEffects).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'ice_wall' })]));
  });

  it('shows player damage text when an enemy hurts the player', () => {
    const state = createGameState('player-damage-text');
    state.mode = 'running';
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 12, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damage: 9,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    applyCollisions(state);

    expect(state.player.hp).toBe(91);
    expect(state.visualEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'player_damage_text', value: 9 })]),
    );
  });

  it('shows player damage text when a boss warning hurts the player', () => {
    const state = createGameState('boss-player-damage-text');
    state.mode = 'running';
    state.bosses.push({
      id: 'boss-1',
      kind: 'printer_boss',
      position: { x: 180, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 42 },
      hp: 100,
      maxHp: 100,
      speed: 0,
      damageMultiplier: 1,
      phase: 1,
      skillCooldownRemaining: 10,
      activeWarning: {
        id: 'warning-1',
        kind: 'circle',
        position: { x: 0, y: 0 },
        direction: { x: 1, y: 0 },
        radius: 80,
        width: 80,
        damage: 18,
        remaining: 0.01,
      },
    });

    updateBosses(state, 0.02);

    expect(state.player.hp).toBe(82);
    expect(state.visualEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'player_damage_text', value: 18 })]),
    );
  });

  it('microwave overload damages enemies, stuns them for three seconds, and shows an explosion ring', () => {
    const state = createGameState('microwave-overload-effects');
    state.mode = 'running';
    state.player.skillPoints = 6;
    for (const id of [
      'kitchen_pan',
      'kitchen_chili',
      'kitchen_fridge_shield',
      'kitchen_smoke_spread',
      'kitchen_frozen_leftovers',
      'kitchen_microwave_overload',
    ]) {
      unlockSkill(state, id);
    }
    state.enemies.push({
      id: 'enemy-1',
      kind: 'slow_mob',
      isElite: false,
      position: { x: 80, y: 0 },
      velocity: { x: 20, y: 0 },
      body: { radius: 13 },
      hp: 100,
      maxHp: 100,
      speed: 80,
      damage: 9,
      xpValue: 1,
      attackCooldownRemaining: 0,
      warningRemaining: 0,
      status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
    });

    updateSkillEffects(state, 0.1);

    expect(state.enemies[0].hp).toBe(30);
    expect(state.enemies[0].status.stunRemaining).toBe(3);
    expect(state.visualEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: 'microwave_blast', radius: 220 })]),
    );
  });

  it('pan projectiles can bounce through an enemy group three times', () => {
    const state = createGameState('pan-bounce-effects');
    state.mode = 'running';
    state.player.skillPoints = 1;
    unlockSkill(state, 'kitchen_pan');
    state.enemies.push(
      {
        id: 'enemy-1',
        kind: 'slow_mob',
        isElite: false,
        position: { x: 50, y: 0 },
        velocity: { x: 0, y: 0 },
        body: { radius: 13 },
        hp: 100,
        maxHp: 100,
        speed: 0,
        damage: 0,
        xpValue: 1,
        attackCooldownRemaining: 0,
        warningRemaining: 0,
        status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
      },
      {
        id: 'enemy-2',
        kind: 'slow_mob',
        isElite: false,
        position: { x: 120, y: 0 },
        velocity: { x: 0, y: 0 },
        body: { radius: 13 },
        hp: 100,
        maxHp: 100,
        speed: 0,
        damage: 0,
        xpValue: 1,
        attackCooldownRemaining: 0,
        warningRemaining: 0,
        status: { burnRemaining: 0, slowRemaining: 0, stunRemaining: 0 },
      },
    );

    fireAutoAttack(state);
    state.skillState.panBounceChance = 1;
    state.projectiles[0].position = { x: 50, y: 0 };
    applyCollisions(state);

    expect(state.projectiles).toEqual(
      expect.arrayContaining([expect.objectContaining({ bounceRemaining: 2, hitEnemyIds: expect.any(Set) })]),
    );
    expect(state.visualEffects).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'pan_bounce' })]));
  });
});
