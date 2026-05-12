import { describe, expect, it } from 'vitest';
import { BOSSES } from '../data/bosses';
import { ENEMIES } from '../data/enemies';
import { createGameState } from '../state/GameState';
import { spawnTimedEncounters, updateBosses } from '../systems/BossSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { spawnEnemy } from '../systems/SpawnSystem';

describe('boss and elite timing', () => {
  it('spawns the first elite at three minutes', () => {
    const state = createGameState('elite');
    state.mode = 'running';
    state.time = 180;

    spawnTimedEncounters(state);

    expect(state.enemies.some((enemy) => enemy.isElite)).toBe(true);
  });

  it('spawns the chef as the first boss at level ten', () => {
    const state = createGameState('boss');
    state.mode = 'running';
    state.player.level = 10;

    spawnTimedEncounters(state);

    expect(state.bosses[0].kind).toBe('chef_boss');
  });

  it('spawns the clown as the second boss at level twenty', () => {
    const state = createGameState('clown-boss');
    state.mode = 'running';
    state.player.level = 20;

    spawnTimedEncounters(state);

    expect(state.bosses[0].kind).toBe('clown_boss');
  });

  it('does not spawn bosses after level twenty yet', () => {
    const state = createGameState('only-two-bosses');
    state.mode = 'running';
    state.player.level = 30;

    spawnTimedEncounters(state);

    expect(state.bosses).toHaveLength(0);
  });

  it('does not spawn the same level boss twice', () => {
    const state = createGameState('boss-once');
    state.mode = 'running';
    state.player.level = 10;

    spawnTimedEncounters(state);
    spawnTimedEncounters(state);

    expect(state.bosses).toHaveLength(1);
  });

  it('creates a boss warning before damage resolves', () => {
    const state = createGameState('warning');
    state.mode = 'running';
    state.player.level = 10;
    spawnTimedEncounters(state);

    updateBosses(state, 10);

    expect(state.bosses[0].activeWarning).not.toBeNull();
  });

  it('has a black elite that is faster but lower hp', () => {
    const blackElite = ENEMIES.black_elite;

    expect(blackElite.isElite).toBe(true);
    expect(blackElite.speed).toBeGreaterThan(ENEMIES.fast_mob.speed);
    expect(blackElite.hp).toBeLessThan(ENEMIES.charge_elite.hp);
  });

  it('spawns the black elite as an elite enemy', () => {
    const state = createGameState('black-elite');
    state.mode = 'running';

    const enemy = spawnEnemy(state, 'black_elite', { x: 10, y: 0 });

    expect(enemy.isElite).toBe(true);
    expect(enemy.kind).toBe('black_elite');
  });

  it('chef fireball leaves a damaging fire pit', () => {
    const state = createGameState('chef-fireball');
    state.mode = 'running';
    state.bosses.push({
      id: 'boss-1',
      kind: 'chef_boss',
      position: { x: 200, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 44 },
      hp: 3200,
      maxHp: 3200,
      speed: 32,
      damageMultiplier: 1,
      phase: 1,
      skillCooldownRemaining: 10,
      activeWarning: {
        id: 'warning-1',
        skillId: 'chef_fireball',
        kind: 'circle',
        position: { x: 0, y: 0 },
        direction: { x: 1, y: 0 },
        radius: 64,
        width: 64,
        damage: 22,
        remaining: 0.01,
      },
    });

    updateBosses(state, 0.02);

    expect(state.visualEffects).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'fire_pit', radius: 64 })]));
    expect(state.player.hp).toBeLessThan(100);
  });

  it('chef leap lands near the warning and deals huge damage', () => {
    const state = createGameState('chef-leap');
    state.mode = 'running';
    state.bosses.push({
      id: 'boss-1',
      kind: 'chef_boss',
      position: { x: 400, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 44 },
      hp: 3200,
      maxHp: 3200,
      speed: 32,
      damageMultiplier: 1,
      phase: 1,
      skillCooldownRemaining: 10,
      activeWarning: {
        id: 'warning-1',
        skillId: 'chef_leap',
        kind: 'circle',
        position: { x: 18, y: 0 },
        direction: { x: 1, y: 0 },
        radius: 96,
        width: 96,
        damage: 55,
        remaining: 0.01,
      },
    });

    updateBosses(state, 0.02);

    expect(state.bosses[0].position).toEqual({ x: 18, y: 0 });
    expect(state.player.hp).toBe(45);
    expect(state.visualEffects).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'boss_slam' })]));
  });

  it('clown boss is faster with lower hp than chef', () => {
    const clown = stateBossDefinition('clown_boss');
    const chef = stateBossDefinition('chef_boss');

    expect(clown.speed).toBeGreaterThan(chef.speed);
    expect(clown.hp).toBeLessThan(chef.hp);
  });

  it('clown dash resolves after a warning and damages the player', () => {
    const state = createGameState('clown-dash');
    state.mode = 'running';
    state.bosses.push({
      id: 'boss-1',
      kind: 'clown_boss',
      position: { x: 220, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 34 },
      hp: 1500,
      maxHp: 1500,
      speed: 86,
      damageMultiplier: 1,
      phase: 1,
      skillCooldownRemaining: 10,
      activeWarning: {
        id: 'warning-1',
        skillId: 'clown_dash',
        kind: 'line',
        position: { x: 0, y: 0 },
        direction: { x: -1, y: 0 },
        radius: 42,
        width: 42,
        damage: 34,
        remaining: 0.01,
      },
    });

    updateBosses(state, 0.02);

    expect(state.bosses[0].position).toEqual({ x: 0, y: 0 });
    expect(state.player.hp).toBe(66);
    expect(state.visualEffects).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'clown_dash' })]));
  });

  it('clown dart creates a boss projectile that can damage the player', () => {
    const state = createGameState('clown-dart');
    state.mode = 'running';
    state.bosses.push({
      id: 'boss-1',
      kind: 'clown_boss',
      position: { x: 160, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 34 },
      hp: 1500,
      maxHp: 1500,
      speed: 86,
      damageMultiplier: 1,
      phase: 1,
      skillCooldownRemaining: 10,
      activeWarning: {
        id: 'warning-1',
        skillId: 'clown_dart',
        kind: 'line',
        position: { x: 0, y: 0 },
        direction: { x: -1, y: 0 },
        radius: 18,
        width: 18,
        damage: 24,
        remaining: 0.01,
      },
    });

    updateBosses(state, 0.02);
    expect(state.projectiles).toEqual(expect.arrayContaining([expect.objectContaining({ owner: 'boss', damage: 24 })]));
    state.projectiles[0].position = { ...state.player.position };

    applyCollisions(state);

    expect(state.player.hp).toBe(76);
  });
});

function stateBossDefinition(kind: 'chef_boss' | 'clown_boss') {
  return BOSSES[kind];
}
