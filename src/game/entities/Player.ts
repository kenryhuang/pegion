import type { CircleBody, Vector2 } from '../types';

export interface Player {
  id: string;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  hp: number;
  maxHp: number;
  speed: number;
  dashCooldown: number;
  dashCooldownRemaining: number;
  dashDurationRemaining: number;
  invincibleRemaining: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  skillPoints: number;
  pickupRadius: number;
  weapon: {
    damage: number;
    attackInterval: number;
    range: number;
    projectileSpeed: number;
    pierce: number;
    knockback: number;
    critChance: number;
    cooldownRemaining: number;
  };
}

export function createPlayer(): Player {
  return {
    id: 'player-1',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    body: { radius: 14 },
    hp: 100,
    maxHp: 100,
    speed: 210,
    dashCooldown: 3,
    dashCooldownRemaining: 0,
    dashDurationRemaining: 0,
    invincibleRemaining: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 10,
    skillPoints: 0,
    pickupRadius: 46,
    weapon: {
      damage: 12,
      attackInterval: 0.45,
      range: 360,
      projectileSpeed: 520,
      pierce: 0,
      knockback: 35,
      critChance: 0.05,
      cooldownRemaining: 0,
    },
  };
}
