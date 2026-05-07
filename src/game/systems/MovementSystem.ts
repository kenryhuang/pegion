import { balance } from '../data/balance';
import type { Enemy } from '../entities/Enemy';
import type { GameState } from '../state/GameState';

export function updateMovement(state: GameState, deltaSeconds: number): void {
  updatePlayerMovement(state, deltaSeconds);
  updateEnemyMovement(state.enemies, state, deltaSeconds);
}

function updatePlayerMovement(state: GameState, deltaSeconds: number): void {
  const player = state.player;
  const length = Math.hypot(state.input.moveX, state.input.moveY);
  const moveX = length > 0 ? state.input.moveX / length : 0;
  const moveY = length > 0 ? state.input.moveY / length : 0;

  player.dashCooldownRemaining = Math.max(0, player.dashCooldownRemaining - deltaSeconds);
  player.dashDurationRemaining = Math.max(0, player.dashDurationRemaining - deltaSeconds);
  player.invincibleRemaining = Math.max(0, player.invincibleRemaining - deltaSeconds);

  if (state.input.dashPressed && player.dashCooldownRemaining === 0 && length > 0) {
    player.dashCooldownRemaining = player.dashCooldown;
    player.dashDurationRemaining = balance.player.dashDuration;
    player.invincibleRemaining = balance.player.dashDuration;
  }

  const speed = player.dashDurationRemaining > 0 ? balance.player.dashSpeed : player.speed;
  player.velocity.x = moveX * speed;
  player.velocity.y = moveY * speed;
  player.position.x += player.velocity.x * deltaSeconds;
  player.position.y += player.velocity.y * deltaSeconds;
  player.position.x = clamp(player.position.x, -balance.map.width / 2, balance.map.width / 2);
  player.position.y = clamp(player.position.y, -balance.map.height / 2, balance.map.height / 2);
  state.input.dashPressed = false;
}

function updateEnemyMovement(enemies: Enemy[], state: GameState, deltaSeconds: number): void {
  for (const enemy of enemies) {
    enemy.status.stunRemaining = Math.max(0, enemy.status.stunRemaining - deltaSeconds);
    enemy.status.slowRemaining = Math.max(0, enemy.status.slowRemaining - deltaSeconds);
    enemy.status.burnRemaining = Math.max(0, enemy.status.burnRemaining - deltaSeconds);

    if (enemy.status.stunRemaining > 0) {
      enemy.velocity.x = 0;
      enemy.velocity.y = 0;
      continue;
    }

    const dx = state.player.position.x - enemy.position.x;
    const dy = state.player.position.y - enemy.position.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const slow = enemy.status.slowRemaining > 0 ? 0.65 : 1;
    enemy.velocity.x = (dx / distance) * enemy.speed * slow;
    enemy.velocity.y = (dy / distance) * enemy.speed * slow;
    enemy.position.x += enemy.velocity.x * deltaSeconds;
    enemy.position.y += enemy.velocity.y * deltaSeconds;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
