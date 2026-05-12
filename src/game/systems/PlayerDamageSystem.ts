import { balance } from '../data/balance';
import type { GameState } from '../state/GameState';
import type { Vector2 } from '../types';
import { addIceWall, addPlayerDamageText } from './VisualEffectSystem';

export function applyPlayerDamage(state: GameState, damage: number, sourcePosition?: Vector2): boolean {
  if (damage <= 0 || state.player.invincibleRemaining > 0) {
    return false;
  }

  if (state.skillState.shieldInterval > 0 && state.skillState.shieldCooldownRemaining <= 0) {
    state.skillState.shieldCooldownRemaining = state.skillState.shieldInterval;
    state.player.invincibleRemaining = Math.max(state.player.invincibleRemaining, balance.player.contactInvincibility);
    addIceWall(state, sourcePosition);
    return false;
  }

  const appliedDamage = Math.ceil(damage);
  state.player.hp = Math.max(0, state.player.hp - appliedDamage);
  state.player.invincibleRemaining = balance.player.contactInvincibility;
  addPlayerDamageText(state, appliedDamage);
  if (state.player.hp === 0) {
    state.mode = 'gameOver';
  }
  return true;
}
