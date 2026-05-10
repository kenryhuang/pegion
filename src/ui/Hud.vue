<script setup lang="ts">
import { stageLabels } from '../game/data/labels';
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
      <div class="bar-label">生命 {{ Math.ceil(state.player.hp) }} / {{ state.player.maxHp }}</div>
      <div class="meter"><span :style="{ width: `${(state.player.hp / state.player.maxHp) * 100}%` }" /></div>
      <div class="bar-label">等级 {{ state.player.level }}</div>
      <div class="meter xp"><span :style="{ width: `${(state.player.xp / state.player.nextLevelXp) * 100}%` }" /></div>
    </div>
    <div class="hud-right">
      <strong>{{ formatTime(state.time) }}</strong>
      <span>击杀 {{ state.stats.kills }}</span>
      <span>{{ stageLabels[state.stageId] ?? state.stageId }}</span>
    </div>
    <div class="dash-readout">冲刺 {{ state.player.dashCooldownRemaining <= 0 ? '就绪' : state.player.dashCooldownRemaining.toFixed(1) }}</div>
  </section>
</template>
