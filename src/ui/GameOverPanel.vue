<script setup lang="ts">
import { branchLabels } from '../game/data/labels';
import { emitSimpleGameEvent } from '../game/events/GameEvents';
import type { GameState } from '../game/state/GameState';

defineProps<{ state: GameState; stateVersion: number; bestScore: number }>();
</script>

<template>
  <section class="overlay-panel game-over" :data-state-version="stateVersion">
    <h2>本局结束</h2>
    <dl>
      <div><dt>生存</dt><dd>{{ Math.floor(state.stats.survivalTime) }} 秒</dd></div>
      <div><dt>击杀</dt><dd>{{ state.stats.kills }}</dd></div>
      <div><dt>等级</dt><dd>{{ state.stats.highestLevel }}</dd></div>
      <div><dt>精英</dt><dd>{{ state.stats.elitesDefeated }}</dd></div>
      <div><dt>首领</dt><dd>{{ state.stats.bossesDefeated }}</dd></div>
      <div><dt>主线</dt><dd>{{ branchLabels[state.stats.mainSkillBranch as keyof typeof branchLabels] ?? state.stats.mainSkillBranch }}</dd></div>
      <div><dt>得分</dt><dd>{{ state.stats.score }}</dd></div>
      <div><dt>最高</dt><dd>{{ bestScore }}</dd></div>
    </dl>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('restartRun')">再来一局</button>
  </section>
</template>
