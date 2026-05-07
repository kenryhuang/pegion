<script setup lang="ts">
import { emitSimpleGameEvent } from '../game/events/GameEvents';
import type { GameState } from '../game/state/GameState';

defineProps<{ state: GameState; bestScore: number }>();
</script>

<template>
  <section class="overlay-panel game-over">
    <h2>Run Over</h2>
    <dl>
      <div><dt>Time</dt><dd>{{ Math.floor(state.stats.survivalTime) }}s</dd></div>
      <div><dt>Kills</dt><dd>{{ state.stats.kills }}</dd></div>
      <div><dt>Level</dt><dd>{{ state.stats.highestLevel }}</dd></div>
      <div><dt>Elites</dt><dd>{{ state.stats.elitesDefeated }}</dd></div>
      <div><dt>Bosses</dt><dd>{{ state.stats.bossesDefeated }}</dd></div>
      <div><dt>Branch</dt><dd>{{ state.stats.mainSkillBranch }}</dd></div>
      <div><dt>Score</dt><dd>{{ state.stats.score }}</dd></div>
      <div><dt>Best</dt><dd>{{ bestScore }}</dd></div>
    </dl>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('restartRun')">Restart</button>
  </section>
</template>
