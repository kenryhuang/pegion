<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { emitSimpleGameEvent } from '../game/events/GameEvents';
import { createPhaserGame } from '../game/main';

const gameHost = ref<HTMLElement | null>(null);
let game: Phaser.Game | null = null;

onMounted(() => {
  if (gameHost.value) {
    game = createPhaserGame(gameHost.value);
  }
});

onBeforeUnmount(() => {
  game?.destroy(true);
});
</script>

<template>
  <main class="app-shell">
    <section class="game-root">
      <div ref="gameHost" class="phaser-host" />
      <button type="button" class="floating-start" @click="emitSimpleGameEvent('startRun')">Start Run</button>
    </section>
  </main>
</template>
