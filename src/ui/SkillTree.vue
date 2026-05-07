<script setup lang="ts">
import { computed } from 'vue';
import { SKILL_TREE } from '../game/data/skills';
import { emitSkillSelection } from '../game/events/GameEvents';
import type { GameState } from '../game/state/GameState';
import { canUnlockSkill } from '../game/systems/SkillSystem';

const props = defineProps<{ state: GameState; stateVersion: number }>();

const branches = computed(() => {
  return ['office', 'kitchen', 'magnet', 'clone'].map((branch) => ({
    branch,
    skills: SKILL_TREE.filter((skill) => skill.branch === branch),
  }));
});
</script>

<template>
  <section class="overlay-panel skill-tree" :data-state-version="props.stateVersion">
    <header>
      <h2>Choose a Skill</h2>
      <span>{{ props.state.player.skillPoints }} point available</span>
    </header>
    <div class="skill-branches">
      <article v-for="branch in branches" :key="branch.branch" class="skill-branch">
        <h3>{{ branch.branch }}</h3>
        <button
          v-for="skill in branch.skills"
          :key="skill.id"
          type="button"
          class="skill-node"
          :class="{ unlocked: props.state.unlockedSkillIds.has(skill.id) }"
          :disabled="!canUnlockSkill(props.state, skill)"
          @click="emitSkillSelection(skill.id)"
        >
          <strong>{{ skill.name }}</strong>
          <span>{{ skill.description }}</span>
        </button>
      </article>
    </div>
  </section>
</template>
