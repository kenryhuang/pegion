import type { EliteKind, EnemyKind } from '../types';

export interface EnemyDefinition {
  id: EnemyKind | EliteKind;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  xpValue: number;
  radius: number;
  weight: number;
  isElite: boolean;
}

export const ENEMIES: Record<EnemyKind | EliteKind, EnemyDefinition> = {
  slow_mob: {
    id: 'slow_mob',
    name: 'Slow Mob',
    hp: 22,
    speed: 82,
    damage: 9,
    xpValue: 4,
    radius: 13,
    weight: 8,
    isElite: false,
  },
  fast_mob: {
    id: 'fast_mob',
    name: 'Fast Mob',
    hp: 12,
    speed: 145,
    damage: 8,
    xpValue: 5,
    radius: 11,
    weight: 3,
    isElite: false,
  },
  tank_mob: {
    id: 'tank_mob',
    name: 'Tank Mob',
    hp: 70,
    speed: 58,
    damage: 12,
    xpValue: 12,
    radius: 18,
    weight: 1,
    isElite: false,
  },
  charge_elite: {
    id: 'charge_elite',
    name: 'Charge Elite',
    hp: 240,
    speed: 90,
    damage: 24,
    xpValue: 60,
    radius: 22,
    weight: 1,
    isElite: true,
  },
  projectile_elite: {
    id: 'projectile_elite',
    name: 'Projectile Elite',
    hp: 210,
    speed: 72,
    damage: 22,
    xpValue: 60,
    radius: 22,
    weight: 1,
    isElite: true,
  },
};
