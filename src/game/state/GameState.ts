import type { Boss } from '../entities/Boss';
import type { Enemy } from '../entities/Enemy';
import type { Pickup } from '../entities/Pickup';
import { createPlayer, type Player } from '../entities/Player';
import type { Projectile } from '../entities/Projectile';
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
  unlockedSkillIds: Set<string>;
  branchPoints: Record<string, number>;
  stats: RunStats;
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
