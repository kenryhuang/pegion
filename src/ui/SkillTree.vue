<script setup lang="ts">
import { computed } from 'vue';
import { branchLabels } from '../game/data/labels';
import { SKILL_TREE } from '../game/data/skills';
import type { SkillBranch } from '../game/data/skills';
import { emitSkillSelection } from '../game/events/GameEvents';
import type { GameState } from '../game/state/GameState';
import { canUnlockSkill } from '../game/systems/SkillSystem';

const props = defineProps<{ state: GameState; stateVersion: number }>();

const branches = computed(() => {
  return (['office', 'kitchen', 'magnet', 'clone'] satisfies SkillBranch[]).map((branch) => ({
    branch,
    label: branchLabels[branch],
    skills: SKILL_TREE.filter((skill) => skill.branch === branch),
  }));
});
</script>

<template>
  <section class="overlay-panel skill-tree" :data-state-version="props.stateVersion">
    <header>
      <h2>选择技能</h2>
      <span>可用点数 {{ props.state.player.skillPoints }}</span>
    </header>
    <div class="skill-branches">
      <article v-for="branch in branches" :key="branch.branch" class="skill-branch">
        <h3>{{ branch.label }}</h3>
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
