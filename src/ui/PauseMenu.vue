<script setup lang="ts">
import { emitSimpleGameEvent } from '../game/events/GameEvents';
</script>

<template>
  <section class="overlay-panel pause-menu">
    <h2>已暂停</h2>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('resumeRun')">继续</button>
    <button type="button" class="secondary-action" @click="emitSimpleGameEvent('restartRun')">重新开始</button>
  </section>
</template>
