<script setup lang="ts">
import { emitSimpleGameEvent } from '../game/events/GameEvents';
</script>

<template>
  <section class="overlay-panel main-menu">
    <h1>像素荒诞幸存者</h1>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('startRun')">开始游戏</button>
  </section>
</template>
