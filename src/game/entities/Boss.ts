import type { BossKind, CircleBody, Vector2 } from '../types';

export interface Boss {
  id: string;
  kind: BossKind;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  hp: number;
  maxHp: number;
  speed: number;
  damageMultiplier: number;
  phase: 1 | 2;
  skillCooldownRemaining: number;
  activeWarning: BossWarning | null;
}

export interface BossWarning {
  id: string;
  skillId?: string;
  kind: 'line' | 'circle' | 'ring';
  position: Vector2;
  direction: Vector2;
  radius: number;
  width: number;
  damage: number;
  remaining: number;
}
