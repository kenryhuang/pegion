import { balance } from '../data/balance';
import type { Enemy } from '../entities/Enemy';
import type { Pickup } from '../entities/Pickup';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import { addExperience } from './ExperienceSystem';

export function applyCollisions(state: GameState): void {
  applyPickupCollisions(state);
  applyProjectileEnemyCollisions(state);
  applyEnemyPlayerCollisions(state);
}

function applyProjectileEnemyCollisions(state: GameState): void {
  const deadEnemyIds = new Set<string>();

  for (const projectile of state.projectiles) {
    for (const enemy of state.enemies) {
      if (deadEnemyIds.has(enemy.id) || projectile.hitEnemyIds.has(enemy.id)) {
        continue;
      }
      if (!circlesOverlap(projectile, enemy)) {
        continue;
      }

      enemy.hp -= projectile.damage;
      projectile.hitEnemyIds.add(enemy.id);

      if (enemy.hp <= 0) {
        deadEnemyIds.add(enemy.id);
        createXpPickup(state, enemy);
        state.stats.kills += 1;
        state.stats.score += enemy.isElite ? 250 : 25;
        if (enemy.isElite) {
          state.stats.elitesDefeated += 1;
        }
      }

      if (projectile.pierceRemaining > 0) {
        projectile.pierceRemaining -= 1;
      } else {
        projectile.lifeRemaining = 0;
        break;
      }
    }
  }

  state.enemies = state.enemies.filter((enemy) => !deadEnemyIds.has(enemy.id));
  state.projectiles = state.projectiles.filter((projectile) => projectile.lifeRemaining > 0);
}

function applyEnemyPlayerCollisions(state: GameState): void {
  if (state.player.invincibleRemaining > 0) {
    return;
  }

  for (const enemy of state.enemies) {
    if (!circlesOverlap(state.player, enemy)) {
      continue;
    }

    state.player.hp = Math.max(0, state.player.hp - enemy.damage);
    state.player.invincibleRemaining = balance.player.contactInvincibility;
    if (state.player.hp === 0) {
      state.mode = 'gameOver';
    }
    return;
  }
}

function applyPickupCollisions(state: GameState): void {
  const collected = new Set<string>();
  for (const pickup of state.pickups) {
    const distance = Math.hypot(pickup.position.x - state.player.position.x, pickup.position.y - state.player.position.y);
    if (distance > state.player.pickupRadius + pickup.body.radius) {
      continue;
    }

    collected.add(pickup.id);
    if (pickup.kind === 'xp_crystal') {
      addExperience(state, pickup.value);
    }
    if (pickup.kind === 'health_pack') {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + pickup.value);
    }
  }

  state.pickups = state.pickups.filter((pickup) => !collected.has(pickup.id));
}

function createXpPickup(state: GameState, enemy: Enemy): void {
  const pickup: Pickup = {
    id: createEntityId(state, 'pickup'),
    kind: 'xp_crystal',
    position: { ...enemy.position },
    body: { radius: 8 },
    value: enemy.xpValue,
    magnetized: false,
    lifeRemaining: 120,
  };
  state.pickups.push(pickup);
}

function circlesOverlap(a: { position: { x: number; y: number }; body: { radius: number } }, b: { position: { x: number; y: number }; body: { radius: number } }): boolean {
  const distance = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
  return distance <= a.body.radius + b.body.radius;
}
