import { ENEMIES } from '../data/enemies';
import type { Enemy } from '../entities/Enemy';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import type { EliteKind, EnemyKind, Vector2 } from '../types';
import { getCurrentStage } from './StageSystem';

export function spawnEnemy(state: GameState, kind: EnemyKind | EliteKind, position: Vector2): Enemy {
  const definition = ENEMIES[kind];
  const stage = getCurrentStage(state.time);
  const enemy: Enemy = {
    id: createEntityId(state, 'enemy'),
    kind,
    isElite: definition.isElite,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    body: { radius: definition.radius },
    hp: definition.hp * stage.hpMultiplier,
    maxHp: definition.hp * stage.hpMultiplier,
    speed: definition.speed * stage.speedMultiplier,
    damage: definition.damage,
    xpValue: definition.xpValue,
    attackCooldownRemaining: 1.5,
    warningRemaining: 0,
    status: {
      burnRemaining: 0,
      slowRemaining: 0,
      stunRemaining: 0,
    },
  };

  state.enemies.push(enemy);
  return enemy;
}

export function updateSpawning(state: GameState): void {
  const stage = getCurrentStage(state.time);
  if (state.enemies.length >= stage.maxEnemies) {
    return;
  }

  const roll = state.rng.next();
  const spawnChance = Math.min(1, 1 / (stage.spawnInterval * 60));
  if (roll > spawnChance) {
    return;
  }

  const picked = state.rng.pickWeighted(stage.enemyWeights);
  spawnEnemy(state, picked.kind, getSpawnPositionAroundPlayer(state));
}

function getSpawnPositionAroundPlayer(state: GameState): Vector2 {
  const angle = state.rng.range(0, Math.PI * 2);
  const distance = state.rng.range(430, 560);
  return {
    x: state.player.position.x + Math.cos(angle) * distance,
    y: state.player.position.y + Math.sin(angle) * distance,
  };
}
