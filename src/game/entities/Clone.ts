import type { CircleBody, Vector2 } from '../types';

export interface Clone {
  id: string;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  lifeRemaining: number;
  attackCooldownRemaining: number;
  damageMultiplier: number;
}
