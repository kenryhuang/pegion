<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { gameEventNames, type GameStateUpdatedDetail } from '../game/events/GameEvents';
import { createPhaserGame } from '../game/main';
import type { GameState } from '../game/state/GameState';
import GameOverPanel from '../ui/GameOverPanel.vue';
import Hud from '../ui/Hud.vue';
import MainMenu from '../ui/MainMenu.vue';
import PauseMenu from '../ui/PauseMenu.vue';
import SkillTree from '../ui/SkillTree.vue';

const gameHost = ref<HTMLElement | null>(null);
const state = shallowRef<GameState | null>(null);
const bestScore = ref(0);
let game: Phaser.Game | null = null;

function handleStateUpdate(event: CustomEvent<GameStateUpdatedDetail>): void {
  state.value = event.detail.state;
}

onMounted(() => {
  bestScore.value = Number(localStorage.getItem('pas-best-score') ?? 0);
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
      <Hud v-if="state && state.mode !== 'menu'" :state="state" />
      <MainMenu v-if="!state || state.mode === 'menu'" />
      <SkillTree v-if="state?.mode === 'levelUp'" :state="state" />
      <PauseMenu v-if="state?.mode === 'paused'" />
      <GameOverPanel v-if="state?.mode === 'gameOver'" :state="state" :best-score="bestScore" />
    </section>
  </main>
</template>
