import { SKILL_TREE, type SkillNode } from '../data/skills';
import type { GameState } from '../state/GameState';

export function getSkillById(skillId: string): SkillNode {
  const skill = SKILL_TREE.find((node) => node.id === skillId);
  if (!skill) {
    throw new Error(`Unknown skill: ${skillId}`);
  }
  return skill;
}

export function canUnlockSkill(state: GameState, skill: SkillNode): boolean {
  if (state.player.skillPoints <= 0) {
    return false;
  }
  if (state.unlockedSkillIds.has(skill.id)) {
    return false;
  }
  if ((state.branchPoints[skill.branch] ?? 0) < skill.branchPointRequirement) {
    return false;
  }
  return skill.prerequisites.every((id) => state.unlockedSkillIds.has(id));
}

export function unlockSkill(state: GameState, skillId: string): void {
  const skill = getSkillById(skillId);
  if (!canUnlockSkill(state, skill)) {
    throw new Error(`Skill is locked: ${skillId}`);
  }

  state.unlockedSkillIds.add(skill.id);
  state.player.skillPoints -= 1;
  state.branchPoints[skill.branch] = (state.branchPoints[skill.branch] ?? 0) + 1;
  state.stats.mainSkillBranch = getMainBranch(state);
  applyImmediateSkillEffects(state, skill);

  if (state.player.skillPoints === 0 && state.mode === 'levelUp') {
    state.mode = 'running';
  }
}

function getMainBranch(state: GameState): string {
  return Object.entries(state.branchPoints).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';
}

function applyImmediateSkillEffects(state: GameState, skill: SkillNode): void {
  for (const effect of skill.effects) {
    if (effect.type === 'pierce') {
      state.player.weapon.pierce += effect.amount;
    }
    if (effect.type === 'pickup_radius') {
      state.player.pickupRadius += effect.amount;
    }
  }
}
