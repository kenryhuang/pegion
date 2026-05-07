import { getNextLevelXp } from '../data/balance';
import type { GameState } from '../state/GameState';

export function addExperience(state: GameState, amount: number): void {
  state.player.xp += amount;

  while (state.player.xp >= state.player.nextLevelXp) {
    state.player.xp -= state.player.nextLevelXp;
    state.player.level += 1;
    state.player.skillPoints += 1;
    state.player.nextLevelXp = getNextLevelXp(state.player.level);
    state.stats.highestLevel = Math.max(state.stats.highestLevel, state.player.level);
    state.mode = 'levelUp';
  }
}
