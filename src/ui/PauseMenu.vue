<script setup lang="ts">
import { emitSimpleGameEvent } from '../game/events/GameEvents';
</script>

<template>
  <section class="overlay-panel pause-menu">
    <h2>Paused</h2>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('resumeRun')">Resume</button>
    <button type="button" class="secondary-action" @click="emitSimpleGameEvent('restartRun')">Restart</button>
  </section>
</template>
