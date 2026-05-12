import type { Vector2 } from '../types';

export type VisualEffectKind =
  | 'damage_text'
  | 'player_damage_text'
  | 'spark'
  | 'fire_pit'
  | 'burst_ring'
  | 'clone_flash'
  | 'ice_wall'
  | 'microwave_blast'
  | 'pan_bounce'
  | 'boss_slam'
  | 'clown_dash';

export interface VisualEffect {
  id: string;
  kind: VisualEffectKind;
  position: Vector2;
  velocity: Vector2;
  lifeRemaining: number;
  maxLife: number;
  value?: number;
  isCritical?: boolean;
  radius?: number;
  angle?: number;
  targetPosition?: Vector2;
}
