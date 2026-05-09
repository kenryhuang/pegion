import type { CircleBody, EliteKind, EnemyKind, Vector2 } from '../types';

export interface Enemy {
  id: string;
  kind: EnemyKind | EliteKind;
  isElite: boolean;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  attackCooldownRemaining: number;
  warningRemaining: number;
  status: {
    burnRemaining: number;
    slowRemaining: number;
    stunRemaining: number;
  };
}
