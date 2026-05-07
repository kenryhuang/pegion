<script setup lang="ts">
import { emitSimpleGameEvent } from '../game/events/GameEvents';
</script>

<template>
  <section class="overlay-panel main-menu">
    <h1>Pixel Absurd Survivor</h1>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('startRun')">Start Run</button>
  </section>
</template>
