import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import type { Vector2 } from '../types';

export function addDamageText(state: GameState, position: Vector2, value: number, isCritical: boolean): void {
  state.visualEffects.push({
    id: createEntityId(state, 'damage-text'),
    kind: 'damage_text',
    position: { ...position },
    velocity: { x: isCritical ? 12 : 0, y: isCritical ? -86 : -64 },
    lifeRemaining: 1,
    maxLife: 1,
    value,
    isCritical,
  });
}

export function addPlayerDamageText(state: GameState, value: number): void {
  state.visualEffects.push({
    id: createEntityId(state, 'player-damage-text'),
    kind: 'player_damage_text',
    position: { x: state.player.position.x, y: state.player.position.y - 28 },
    velocity: { x: 0, y: -76 },
    lifeRemaining: 1.05,
    maxLife: 1.05,
    value,
  });
}

export function addSpark(state: GameState, position: Vector2): void {
  state.visualEffects.push({
    id: createEntityId(state, 'spark'),
    kind: 'spark',
    position: { ...position },
    velocity: { x: state.rng.range(-24, 24), y: state.rng.range(-28, 10) },
    lifeRemaining: 0.34,
    maxLife: 0.34,
  });
}

export function addIceWall(state: GameState, sourcePosition?: Vector2): void {
  const dx = (sourcePosition?.x ?? state.player.position.x + 1) - state.player.position.x;
  const dy = (sourcePosition?.y ?? state.player.position.y) - state.player.position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const nx = dx / distance;
  const ny = dy / distance;
  state.visualEffects.push({
    id: createEntityId(state, 'ice-wall'),
    kind: 'ice_wall',
    position: {
      x: state.player.position.x + nx * 34,
      y: state.player.position.y + ny * 34,
    },
    velocity: { x: 0, y: 0 },
    lifeRemaining: 0.7,
    maxLife: 0.7,
    radius: 54,
    angle: Math.atan2(ny, nx) + Math.PI / 2,
  });
}

export function addFirePit(state: GameState, position: Vector2, duration: number, radius = 30): void {
  state.visualEffects.push({
    id: createEntityId(state, 'fire-pit'),
    kind: 'fire_pit',
    position: { ...position },
    velocity: { x: 0, y: 0 },
    lifeRemaining: duration,
    maxLife: duration,
    radius,
  });
}

export function addBurstRing(state: GameState, position: Vector2): void {
  state.visualEffects.push({
    id: createEntityId(state, 'burst-ring'),
    kind: 'burst_ring',
    position: { ...position },
    velocity: { x: 0, y: 0 },
    lifeRemaining: 0.5,
    maxLife: 0.5,
    radius: 18,
  });
}

export function addMicrowaveBlast(state: GameState, position: Vector2, radius: number): void {
  state.visualEffects.push({
    id: createEntityId(state, 'microwave-blast'),
    kind: 'microwave_blast',
    position: { ...position },
    velocity: { x: 0, y: 0 },
    lifeRemaining: 0.85,
    maxLife: 0.85,
    radius,
  });
}

export function addBossSlam(state: GameState, position: Vector2, radius: number): void {
  state.visualEffects.push({
    id: createEntityId(state, 'boss-slam'),
    kind: 'boss_slam',
    position: { ...position },
    velocity: { x: 0, y: 0 },
    lifeRemaining: 0.75,
    maxLife: 0.75,
    radius,
  });
}

export function addClownDash(state: GameState, position: Vector2, targetPosition: Vector2): void {
  state.visualEffects.push({
    id: createEntityId(state, 'clown-dash'),
    kind: 'clown_dash',
    position: { ...position },
    targetPosition: { ...targetPosition },
    velocity: { x: 0, y: 0 },
    lifeRemaining: 0.42,
    maxLife: 0.42,
    radius: 34,
  });
}

export function addPanBounce(state: GameState, position: Vector2, targetPosition: Vector2): void {
  state.visualEffects.push({
    id: createEntityId(state, 'pan-bounce'),
    kind: 'pan_bounce',
    position: { ...position },
    targetPosition: { ...targetPosition },
    velocity: { x: 0, y: 0 },
    lifeRemaining: 0.32,
    maxLife: 0.32,
    radius: 18,
  });
}

export function addCloneFlash(state: GameState, position: Vector2): void {
  state.visualEffects.push({
    id: createEntityId(state, 'clone-flash'),
    kind: 'clone_flash',
    position: { ...position },
    velocity: { x: 0, y: 0 },
    lifeRemaining: 0.42,
    maxLife: 0.42,
    radius: 24,
  });
}

export function updateVisualEffects(state: GameState, deltaSeconds: number): void {
  for (const effect of state.visualEffects) {
    effect.position.x += effect.velocity.x * deltaSeconds;
    effect.position.y += effect.velocity.y * deltaSeconds;
    effect.lifeRemaining -= deltaSeconds;
  }
  state.visualEffects = state.visualEffects.filter((effect) => effect.lifeRemaining > 0);
}
