<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref, shallowRef, triggerRef } from 'vue';
import { gameEventNames, type GameStateUpdatedDetail } from '../game/events/GameEvents';
import { createPhaserGame } from '../game/main';
import { getBestScore, saveBestScore } from '../game/storage/highScore';
import type { GameState } from '../game/state/GameState';
import GameOverPanel from '../ui/GameOverPanel.vue';
import Hud from '../ui/Hud.vue';
import MainMenu from '../ui/MainMenu.vue';
import PauseMenu from '../ui/PauseMenu.vue';
import SkillTree from '../ui/SkillTree.vue';

const gameHost = ref<HTMLElement | null>(null);
const state = shallowRef<GameState | null>(null);
const stateVersion = ref(0);
const bestScore = ref(0);
let game: Phaser.Game | null = null;

function handleStateUpdate(event: CustomEvent<GameStateUpdatedDetail>): void {
  state.value = event.detail.state;
  stateVersion.value += 1;
  triggerRef(state);
  if (event.detail.state.mode === 'gameOver') {
    bestScore.value = saveBestScore(event.detail.state.stats.score);
  }
}

onMounted(() => {
  bestScore.value = getBestScore();
  window.addEventListener(gameEventNames.stateUpdated, handleStateUpdate as EventListener);
  if (gameHost.value) {
    game = createPhaserGame(gameHost.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener(gameEventNames.stateUpdated, handleStateUpdate as EventListener);
  game?.destroy(true);
});
</script>

<template>
  <main class="app-shell">
    <section class="game-root">
      <div ref="gameHost" class="phaser-host" />
      <Hud v-if="state && state.mode !== 'menu'" :state="state" :state-version="stateVersion" />
      <MainMenu v-if="!state || state.mode === 'menu'" />
      <SkillTree v-if="state?.mode === 'levelUp'" :state="state" :state-version="stateVersion" />
      <PauseMenu v-if="state?.mode === 'paused'" />
      <GameOverPanel v-if="state?.mode === 'gameOver'" :state="state" :state-version="stateVersion" :best-score="bestScore" />
    </section>
  </main>
</template>
