<script setup lang="ts">
import type { GameState } from '../game/state/GameState';

defineProps<{ state: GameState; stateVersion: number }>();

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}
</script>

<template>
  <section class="hud" :data-state-version="stateVersion">
    <div class="hud-left">
      <div class="bar-label">HP {{ Math.ceil(state.player.hp) }} / {{ state.player.maxHp }}</div>
      <div class="meter"><span :style="{ width: `${(state.player.hp / state.player.maxHp) * 100}%` }" /></div>
      <div class="bar-label">Level {{ state.player.level }}</div>
      <div class="meter xp"><span :style="{ width: `${(state.player.xp / state.player.nextLevelXp) * 100}%` }" /></div>
    </div>
    <div class="hud-right">
      <strong>{{ formatTime(state.time) }}</strong>
      <span>Kills {{ state.stats.kills }}</span>
      <span>{{ state.stageId }}</span>
    </div>
    <div class="dash-readout">Dash {{ state.player.dashCooldownRemaining <= 0 ? 'Ready' : state.player.dashCooldownRemaining.toFixed(1) }}</div>
  </section>
</template>
