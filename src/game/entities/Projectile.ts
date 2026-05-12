import type { CircleBody, ProjectileOwner, Vector2 } from '../types';

export interface Projectile {
  id: string;
  owner: ProjectileOwner;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  damage: number;
  pierceRemaining: number;
  lifeRemaining: number;
  hitEnemyIds: Set<string>;
  isCritical: boolean;
  bounceRemaining?: number;
  bounceChance?: number;
}
