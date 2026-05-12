<script setup lang="ts">
import { computed } from 'vue';
import { BOSSES } from '../game/data/bosses';
import { stageLabels } from '../game/data/labels';
import type { GameState } from '../game/state/GameState';

const props = defineProps<{ state: GameState; stateVersion: number }>();

const activeBoss = computed(() => props.state.bosses[0]);
const activeBossPercent = computed(() => {
  const boss = activeBoss.value;
  return boss ? Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100)) : 0;
});

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}
</script>

<template>
  <section class="hud" :data-state-version="stateVersion">
    <div v-if="activeBoss" class="boss-health">
      <div class="boss-health-label">
        <strong>{{ BOSSES[activeBoss.kind]?.name ?? activeBoss.kind }}</strong>
        <span>{{ Math.ceil(activeBoss.hp) }} / {{ activeBoss.maxHp }}</span>
      </div>
      <div class="boss-health-meter">
        <span :style="{ width: `${activeBossPercent}%` }" />
      </div>
    </div>
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
