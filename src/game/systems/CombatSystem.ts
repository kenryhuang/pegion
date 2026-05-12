import type { Boss } from '../entities/Boss';
import type { Enemy } from '../entities/Enemy';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';

type AttackTarget = Enemy | Boss;

export function updateCombat(state: GameState, deltaSeconds: number): void {
  state.player.weapon.cooldownRemaining = Math.max(0, state.player.weapon.cooldownRemaining - deltaSeconds);
  if (state.player.weapon.cooldownRemaining === 0) {
    fireAutoAttack(state);
  }
  updateProjectiles(state, deltaSeconds);
}

export function fireAutoAttack(state: GameState): void {
  const target = findNearestTarget(state);
  if (!target) {
    return;
  }

  const dx = target.position.x - state.player.position.x;
  const dy = target.position.y - state.player.position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  if (distance > state.player.weapon.range) {
    return;
  }

  const isCritical = state.rng.next() < state.player.weapon.critChance;
  state.projectiles.push({
    id: createEntityId(state, 'projectile'),
    owner: 'player',
    position: { ...state.player.position },
    velocity: {
      x: (dx / distance) * state.player.weapon.projectileSpeed,
      y: (dy / distance) * state.player.weapon.projectileSpeed,
    },
    body: { radius: 5 },
    damage: isCritical ? state.player.weapon.damage * 2 : state.player.weapon.damage,
    pierceRemaining: state.player.weapon.pierce,
    lifeRemaining: 1.2,
    hitEnemyIds: new Set<string>(),
    isCritical,
    bounceRemaining: state.skillState.panBounceMaxJumps,
    bounceChance: state.skillState.panBounceChance,
  });
  state.player.weapon.cooldownRemaining = state.player.weapon.attackInterval;
}

export function updateProjectiles(state: GameState, deltaSeconds: number): void {
  for (const projectile of state.projectiles) {
    if (state.skillState.projectileHoming > 0 && projectile.owner === 'player') {
      const target = findNearestTargetForProjectile(state, projectile.position);
      if (target) {
        const dx = target.position.x - projectile.position.x;
        const dy = target.position.y - projectile.position.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const speed = Math.hypot(projectile.velocity.x, projectile.velocity.y);
        const turn = Math.min(1, state.skillState.projectileHoming * deltaSeconds * 5);
        projectile.velocity.x = projectile.velocity.x * (1 - turn) + (dx / distance) * speed * turn;
        projectile.velocity.y = projectile.velocity.y * (1 - turn) + (dy / distance) * speed * turn;
      }
    }
    projectile.position.x += projectile.velocity.x * deltaSeconds;
    projectile.position.y += projectile.velocity.y * deltaSeconds;
    projectile.lifeRemaining -= deltaSeconds;
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.lifeRemaining > 0);
}

function findNearestTarget(state: GameState): AttackTarget | undefined {
  let best: AttackTarget | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const target of [...state.enemies, ...state.bosses]) {
    const distance = Math.hypot(target.position.x - state.player.position.x, target.position.y - state.player.position.y);
    if (distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
}

function findNearestTargetForProjectile(state: GameState, position: { x: number; y: number }): AttackTarget | undefined {
  let best: AttackTarget | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const target of [...state.enemies, ...state.bosses]) {
    const distance = Math.hypot(target.position.x - position.x, target.position.y - position.y);
    if (distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
}
