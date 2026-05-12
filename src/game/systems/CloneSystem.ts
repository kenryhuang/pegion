import type { Boss } from '../entities/Boss';
import type { Clone } from '../entities/Clone';
import type { Enemy } from '../entities/Enemy';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import { addCloneFlash } from './VisualEffectSystem';

type CloneTarget = Enemy | Boss;

export function updateClones(state: GameState, deltaSeconds: number): void {
  spawnClones(state, deltaSeconds);

  for (const clone of state.clones) {
    clone.lifeRemaining -= deltaSeconds;
    clone.attackCooldownRemaining = Math.max(0, clone.attackCooldownRemaining - deltaSeconds);

    if (clone.attackCooldownRemaining === 0) {
      fireCloneProjectile(state, clone);
    }
    updateClonePosition(state, clone, deltaSeconds);
  }

  state.clones = state.clones.filter((clone) => clone.lifeRemaining > 0);
}

function spawnClones(state: GameState, deltaSeconds: number): void {
  if (state.skillState.cloneSpawnInterval <= 0 || state.clones.length >= state.skillState.cloneLimit) {
    return;
  }

  state.skillState.cloneSpawnRemaining -= deltaSeconds;
  if (state.skillState.cloneSpawnRemaining > 0) {
    return;
  }

  state.skillState.cloneSpawnRemaining = state.skillState.cloneSpawnInterval;
  const angle = state.rng.range(0, Math.PI * 2);
  const clone: Clone = {
    id: createEntityId(state, 'clone'),
    position: {
      x: state.player.position.x + Math.cos(angle) * 42,
      y: state.player.position.y + Math.sin(angle) * 42,
    },
    velocity: { x: 0, y: 0 },
    body: { radius: 12 },
    lifeRemaining: 12,
    attackCooldownRemaining: 0,
    damageMultiplier: state.skillState.cloneDamageMultiplier,
  };
  state.clones.push(clone);
  addCloneFlash(state, clone.position);
}

function updateClonePosition(state: GameState, clone: Clone, deltaSeconds: number): void {
  const index = Math.max(0, state.clones.findIndex((item) => item.id === clone.id));
  const angle = state.time * 1.8 + index * 2.1;
  const targetX = state.player.position.x + Math.cos(angle) * 58;
  const targetY = state.player.position.y + Math.sin(angle) * 58;
  clone.velocity.x = (targetX - clone.position.x) * 6;
  clone.velocity.y = (targetY - clone.position.y) * 6;
  clone.position.x += clone.velocity.x * deltaSeconds;
  clone.position.y += clone.velocity.y * deltaSeconds;
}

function fireCloneProjectile(state: GameState, clone: Clone): void {
  const target = findNearestTarget(state, clone);
  if (!target) {
    return;
  }

  const dx = target.position.x - clone.position.x;
  const dy = target.position.y - clone.position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  if (distance > state.player.weapon.range) {
    return;
  }

  const isCritical = state.rng.next() < state.player.weapon.critChance;
  const baseDamage = Math.max(1, Math.round(state.player.weapon.damage * clone.damageMultiplier));
  state.projectiles.push({
    id: createEntityId(state, 'clone-projectile'),
    owner: 'player',
    position: { ...clone.position },
    velocity: {
      x: (dx / distance) * state.player.weapon.projectileSpeed,
      y: (dy / distance) * state.player.weapon.projectileSpeed,
    },
    body: { radius: 4 },
    damage: isCritical ? baseDamage * 2 : baseDamage,
    pierceRemaining: 0,
    lifeRemaining: 1.1,
    hitEnemyIds: new Set<string>(),
    isCritical,
  });
  clone.attackCooldownRemaining = state.player.weapon.attackInterval * 1.35;
}

function findNearestTarget(state: GameState, clone: Clone): CloneTarget | undefined {
  let best: CloneTarget | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const target of [...state.enemies, ...state.bosses]) {
    const distance = Math.hypot(target.position.x - clone.position.x, target.position.y - clone.position.y);
    if (distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  }
  return best;
}
