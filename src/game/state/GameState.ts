import type { Boss } from '../entities/Boss';
import type { Clone } from '../entities/Clone';
import type { Enemy } from '../entities/Enemy';
import type { Pickup } from '../entities/Pickup';
import { createPlayer, type Player } from '../entities/Player';
import type { Projectile } from '../entities/Projectile';
import type { VisualEffect } from '../entities/VisualEffect';
import type { GameMode } from '../types';
import { RNG } from '../utils/RNG';
import { createRunStats, type RunStats } from './RunStats';

export interface InputState {
  moveX: number;
  moveY: number;
  dashPressed: boolean;
}

export interface GameState {
  mode: GameMode;
  time: number;
  stageId: string;
  rng: RNG;
  nextEntityId: number;
  input: InputState;
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  bosses: Boss[];
  spawnedBossLevels: Set<number>;
  clones: Clone[];
  visualEffects: VisualEffect[];
  skillState: SkillState;
  unlockedSkillIds: Set<string>;
  branchPoints: Record<string, number>;
  stats: RunStats;
}

export interface SkillState {
  projectileHoming: number;
  stunChance: number;
  auraDamage: number;
  auraRadius: number;
  auraTickRemaining: number;
  burnDamage: number;
  burnDuration: number;
  burnSlow: number;
  microwaveDamage: number;
  microwaveRadius: number;
  microwaveStunDuration: number;
  microwaveCooldown: number;
  microwaveCooldownRemaining: number;
  panBounceMaxJumps: number;
  panBounceChance: number;
  burstProjectileCount: number;
  burstCooldownRemaining: number;
  shieldInterval: number;
  shieldCooldownRemaining: number;
  cloneSpawnInterval: number;
  cloneSpawnRemaining: number;
  cloneLimit: number;
  cloneDamageMultiplier: number;
}

export function createGameState(seed = String(Date.now())): GameState {
  return {
    mode: 'menu',
    time: 0,
    stageId: 'opening',
    rng: new RNG(seed),
    nextEntityId: 1,
    input: {
      moveX: 0,
      moveY: 0,
      dashPressed: false,
    },
    player: createPlayer(),
    enemies: [],
    projectiles: [],
    pickups: [],
    bosses: [],
    spawnedBossLevels: new Set<number>(),
    clones: [],
    visualEffects: [],
    skillState: {
      projectileHoming: 0,
      stunChance: 0,
      auraDamage: 0,
      auraRadius: 0,
      auraTickRemaining: 0,
      burnDamage: 0,
      burnDuration: 0,
      burnSlow: 0,
      microwaveDamage: 0,
      microwaveRadius: 0,
      microwaveStunDuration: 0,
      microwaveCooldown: 0,
      microwaveCooldownRemaining: 0,
      panBounceMaxJumps: 0,
      panBounceChance: 0,
      burstProjectileCount: 0,
      burstCooldownRemaining: 0,
      shieldInterval: 0,
      shieldCooldownRemaining: 0,
      cloneSpawnInterval: 0,
      cloneSpawnRemaining: 0,
      cloneLimit: 0,
      cloneDamageMultiplier: 0.4,
    },
    unlockedSkillIds: new Set<string>(),
    branchPoints: {},
    stats: createRunStats(),
  };
}

export function createEntityId(state: GameState, prefix: string): string {
  const id = `${prefix}-${state.nextEntityId}`;
  state.nextEntityId += 1;
  return id;
}
