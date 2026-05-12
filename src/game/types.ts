export interface Vector2 {
  x: number;
  y: number;
}

export interface CircleBody {
  radius: number;
}

export type GameMode = 'menu' | 'running' | 'levelUp' | 'paused' | 'gameOver';

export type EnemyKind = 'slow_mob' | 'fast_mob' | 'tank_mob';

export type EliteKind = 'charge_elite' | 'projectile_elite' | 'black_elite';

export type BossKind = 'chef_boss' | 'clown_boss' | 'printer_boss' | 'microwave_boss';

export type PickupKind = 'xp_crystal' | 'health_pack' | 'magnet' | 'speed_boost';

export type ProjectileOwner = 'player' | 'enemy' | 'boss';
