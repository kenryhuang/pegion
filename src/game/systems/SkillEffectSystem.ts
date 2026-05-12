import type { Enemy } from '../entities/Enemy';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import { addBurstRing, addDamageText, addFirePit, addMicrowaveBlast, addSpark } from './VisualEffectSystem';

export function updateSkillEffects(state: GameState, deltaSeconds: number): void {
  updateShieldCooldown(state, deltaSeconds);
  updateMicrowaveOverload(state, deltaSeconds);
  updateAuraDamage(state, deltaSeconds);
  updateBurnDamage(state, deltaSeconds);
  updateBurstProjectiles(state, deltaSeconds);
}

export function applyHitSkillEffects(state: GameState, enemy: Enemy): void {
  if (state.skillState.burnDamage <= 0) {
    return;
  }
  enemy.status.burnRemaining = Math.max(enemy.status.burnRemaining, state.skillState.burnDuration);
  if (state.skillState.burnSlow > 0) {
    enemy.status.slowRemaining = Math.max(enemy.status.slowRemaining, state.skillState.burnDuration);
  }
  addFirePit(state, enemy.position, state.skillState.burnDuration);
  addSpark(state, enemy.position);
}

function updateShieldCooldown(state: GameState, deltaSeconds: number): void {
  if (state.skillState.shieldInterval <= 0 || state.skillState.shieldCooldownRemaining <= 0) {
    return;
  }
  state.skillState.shieldCooldownRemaining = Math.max(0, state.skillState.shieldCooldownRemaining - deltaSeconds);
}

function updateMicrowaveOverload(state: GameState, deltaSeconds: number): void {
  if (state.skillState.microwaveDamage <= 0 || state.skillState.microwaveRadius <= 0) {
    return;
  }

  state.skillState.microwaveCooldownRemaining -= deltaSeconds;
  if (state.skillState.microwaveCooldownRemaining > 0) {
    return;
  }

  state.skillState.microwaveCooldownRemaining = state.skillState.microwaveCooldown;
  addMicrowaveBlast(state, state.player.position, state.skillState.microwaveRadius);

  for (const enemy of state.enemies) {
    const distance = Math.hypot(enemy.position.x - state.player.position.x, enemy.position.y - state.player.position.y);
    if (distance > state.skillState.microwaveRadius + enemy.body.radius) {
      continue;
    }
    enemy.hp -= state.skillState.microwaveDamage;
    enemy.status.stunRemaining = Math.max(enemy.status.stunRemaining, state.skillState.microwaveStunDuration);
    addDamageText(state, enemy.position, state.skillState.microwaveDamage, true);
    addSpark(state, enemy.position);
  }
}

function updateAuraDamage(state: GameState, deltaSeconds: number): void {
  if (state.skillState.auraDamage <= 0 || state.skillState.auraRadius <= 0) {
    return;
  }

  state.skillState.auraTickRemaining -= deltaSeconds;
  if (state.skillState.auraTickRemaining > 0) {
    return;
  }
  state.skillState.auraTickRemaining = 0.35;

  for (const enemy of state.enemies) {
    const distance = Math.hypot(enemy.position.x - state.player.position.x, enemy.position.y - state.player.position.y);
    if (distance > state.skillState.auraRadius + enemy.body.radius) {
      continue;
    }
    enemy.hp -= state.skillState.auraDamage;
    addDamageText(state, enemy.position, state.skillState.auraDamage, false);
    addSpark(state, enemy.position);
  }
}

function updateBurnDamage(state: GameState, deltaSeconds: number): void {
  if (state.skillState.burnDamage <= 0) {
    return;
  }

  for (const enemy of state.enemies) {
    if (enemy.status.burnRemaining <= 0) {
      continue;
    }
    const damage = state.skillState.burnDamage * deltaSeconds;
    enemy.hp -= damage;
    addDamageText(state, enemy.position, Math.max(1, Math.ceil(damage)), false);
    if (state.skillState.burnSlow > 0) {
      enemy.status.slowRemaining = Math.max(enemy.status.slowRemaining, enemy.status.burnRemaining);
    }
  }
}

function updateBurstProjectiles(state: GameState, deltaSeconds: number): void {
  if (state.skillState.burstProjectileCount <= 0) {
    return;
  }

  state.skillState.burstCooldownRemaining -= deltaSeconds;
  if (state.skillState.burstCooldownRemaining > 0) {
    return;
  }
  state.skillState.burstCooldownRemaining = 4;
  addBurstRing(state, state.player.position);

  const count = state.skillState.burstProjectileCount;
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count;
    state.projectiles.push({
      id: createEntityId(state, 'burst-projectile'),
      owner: 'player',
      position: { ...state.player.position },
      velocity: {
        x: Math.cos(angle) * state.player.weapon.projectileSpeed,
        y: Math.sin(angle) * state.player.weapon.projectileSpeed,
      },
      body: { radius: 6 },
      damage: Math.ceil(state.player.weapon.damage * 1.25),
      pierceRemaining: Math.max(1, state.player.weapon.pierce),
      lifeRemaining: 1.2,
      hitEnemyIds: new Set<string>(),
      isCritical: true,
    });
  }
}
