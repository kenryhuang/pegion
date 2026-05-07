import type { CircleBody, PickupKind, Vector2 } from '../types';

export interface Pickup {
  id: string;
  kind: PickupKind;
  position: Vector2;
  body: CircleBody;
  value: number;
  magnetized: boolean;
  lifeRemaining: number;
}
