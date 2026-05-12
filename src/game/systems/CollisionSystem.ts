import type { Enemy } from '../entities/Enemy';
import type { Pickup } from '../entities/Pickup';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import { addExperience } from './ExperienceSystem';
import { applyPlayerDamage } from './PlayerDamageSystem';
import { applyHitSkillEffects } from './SkillEffectSystem';
import { addDamageText, addPanBounce, addSpark } from './VisualEffectSystem';

export function applyCollisions(state: GameState): void {
  applyPickupCollisions(state);
  applyProjectileEnemyCollisions(state);
  applyEnemyPlayerCollisions(state);
}

function applyProjectileEnemyCollisions(state: GameState): void {
  const deadEnemyIds = new Set<string>();

  for (const projectile of state.projectiles) {
    if (projectile.owner !== 'player') {
      continue;
    }
    for (const enemy of state.enemies) {
      if (deadEnemyIds.has(enemy.id) || projectile.hitEnemyIds.has(enemy.id)) {
        continue;
      }
      if (!circlesOverlap(projectile, enemy)) {
        continue;
      }

      applyProjectileHitVisuals(state, enemy.position, projectile.damage, projectile.isCritical);
      enemy.hp -= projectile.damage;
      projectile.hitEnemyIds.add(enemy.id);
      if (state.skillState.stunChance > 0 && state.rng.next() < state.skillState.stunChance) {
        enemy.status.stunRemaining = Math.max(enemy.status.stunRemaining, 0.45);
      }
      applyHitSkillEffects(state, enemy);
      maybeCreatePanBounce(state, projectile, enemy);

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

  for (const projectile of state.projectiles) {
    if (projectile.owner !== 'player' || projectile.lifeRemaining <= 0) {
      continue;
    }

    for (const boss of state.bosses) {
      if (!circlesOverlap(projectile, boss)) {
        continue;
      }
      applyProjectileHitVisuals(state, boss.position, projectile.damage, projectile.isCritical);
      boss.hp -= projectile.damage;
      projectile.lifeRemaining = 0;
      if (boss.hp <= 0) {
        state.stats.bossesDefeated += 1;
        state.stats.score += 1000;
      }
      break;
    }
  }

  for (const projectile of state.projectiles) {
    if (projectile.owner === 'player' || projectile.lifeRemaining <= 0) {
      continue;
    }
    if (!circlesOverlap(projectile, state.player)) {
      continue;
    }
    applyPlayerDamage(state, projectile.damage, projectile.position);
    projectile.lifeRemaining = 0;
  }

  state.enemies = state.enemies.filter((enemy) => !deadEnemyIds.has(enemy.id));
  state.bosses = state.bosses.filter((boss) => boss.hp > 0);
  state.projectiles = state.projectiles.filter((projectile) => projectile.lifeRemaining > 0);
}

function maybeCreatePanBounce(
  state: GameState,
  projectile: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    damage: number;
    body: { radius: number };
    hitEnemyIds: Set<string>;
    bounceRemaining?: number;
    bounceChance?: number;
    isCritical: boolean;
  },
  hitEnemy: Enemy,
): void {
  if ((projectile.bounceRemaining ?? 0) <= 0 || (projectile.bounceChance ?? 0) <= 0) {
    return;
  }
  if (state.rng.next() > (projectile.bounceChance ?? 0)) {
    return;
  }

  const target = findBounceTarget(state, projectile.hitEnemyIds, hitEnemy);
  if (!target) {
    return;
  }

  const dx = target.position.x - hitEnemy.position.x;
  const dy = target.position.y - hitEnemy.position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const speed = Math.max(360, Math.hypot(projectile.velocity.x, projectile.velocity.y));
  const hitEnemyIds = new Set(projectile.hitEnemyIds);
  hitEnemyIds.add(hitEnemy.id);
  state.projectiles.push({
    id: createEntityId(state, 'pan-bounce-projectile'),
    owner: 'player',
    position: { ...hitEnemy.position },
    velocity: {
      x: (dx / distance) * speed,
      y: (dy / distance) * speed,
    },
    body: { radius: Math.max(5, projectile.body.radius) },
    damage: Math.max(1, Math.ceil(projectile.damage * 0.8)),
    pierceRemaining: 0,
    lifeRemaining: 0.45,
    hitEnemyIds,
    isCritical: projectile.isCritical,
    bounceRemaining: (projectile.bounceRemaining ?? 0) - 1,
    bounceChance: projectile.bounceChance,
  });
  addPanBounce(state, hitEnemy.position, target.position);
}

function findBounceTarget(state: GameState, hitEnemyIds: Set<string>, hitEnemy: Enemy): Enemy | undefined {
  let best: Enemy | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const enemy of state.enemies) {
    if (enemy.id === hitEnemy.id || hitEnemyIds.has(enemy.id) || enemy.hp <= 0) {
      continue;
    }
    const distance = Math.hypot(enemy.position.x - hitEnemy.position.x, enemy.position.y - hitEnemy.position.y);
    if (distance <= 220 && distance < bestDistance) {
      best = enemy;
      bestDistance = distance;
    }
  }
  return best;
}

function applyProjectileHitVisuals(state: GameState, position: { x: number; y: number }, damage: number, isCritical: boolean): void {
  addDamageText(state, position, Math.ceil(damage), isCritical);
  addSpark(state, position);
}

function applyEnemyPlayerCollisions(state: GameState): void {
  for (const enemy of state.enemies) {
    if (!circlesOverlap(state.player, enemy)) {
      continue;
    }

    applyPlayerDamage(state, enemy.damage, enemy.position);
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
