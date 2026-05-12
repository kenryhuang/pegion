import type { EliteKind, EnemyKind } from '../types';

export interface StageDefinition {
  id: string;
  startsAt: number;
  spawnInterval: number;
  maxEnemies: number;
  hpMultiplier: number;
  speedMultiplier: number;
  enemyWeights: Array<{ kind: EnemyKind | EliteKind; weight: number }>;
}

export const STAGES: StageDefinition[] = [
  { id: 'opening', startsAt: 0, spawnInterval: 0.85, maxEnemies: 45, hpMultiplier: 1, speedMultiplier: 1, enemyWeights: [{ kind: 'slow_mob', weight: 1 }] },
  { id: 'first_elite', startsAt: 180, spawnInterval: 0.7, maxEnemies: 65, hpMultiplier: 1.15, speedMultiplier: 1.05, enemyWeights: [{ kind: 'slow_mob', weight: 6 }, { kind: 'fast_mob', weight: 2 }, { kind: 'black_elite', weight: 1 }] },
  { id: 'first_boss', startsAt: 360, spawnInterval: 0.62, maxEnemies: 80, hpMultiplier: 1.3, speedMultiplier: 1.08, enemyWeights: [{ kind: 'slow_mob', weight: 6 }, { kind: 'fast_mob', weight: 3 }, { kind: 'tank_mob', weight: 1 }, { kind: 'black_elite', weight: 1 }] },
  { id: 'dense', startsAt: 600, spawnInterval: 0.48, maxEnemies: 110, hpMultiplier: 1.55, speedMultiplier: 1.14, enemyWeights: [{ kind: 'slow_mob', weight: 5 }, { kind: 'fast_mob', weight: 4 }, { kind: 'tank_mob', weight: 2 }, { kind: 'black_elite', weight: 2 }] },
  { id: 'pressure_loop', startsAt: 900, spawnInterval: 0.36, maxEnemies: 150, hpMultiplier: 1.9, speedMultiplier: 1.22, enemyWeights: [{ kind: 'slow_mob', weight: 5 }, { kind: 'fast_mob', weight: 5 }, { kind: 'tank_mob', weight: 3 }, { kind: 'black_elite', weight: 2 }] },
];
