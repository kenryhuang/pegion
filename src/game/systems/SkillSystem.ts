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
    if (effect.type === 'bounce') {
      state.skillState.panBounceMaxJumps = Math.max(state.skillState.panBounceMaxJumps, 3);
      state.skillState.panBounceChance = Math.max(state.skillState.panBounceChance, 0.35);
    }
    if (effect.type === 'projectile_homing') {
      state.skillState.projectileHoming += effect.amount;
    }
    if (effect.type === 'stun_chance') {
      state.skillState.stunChance += effect.amount;
    }
    if (effect.type === 'aura_damage') {
      state.skillState.auraDamage += effect.amount;
      state.skillState.auraRadius = Math.max(state.skillState.auraRadius, effect.radius);
      state.skillState.auraTickRemaining = 0;
    }
    if (effect.type === 'burn') {
      state.skillState.burnDamage += effect.damage;
      state.skillState.burnDuration = Math.max(state.skillState.burnDuration, effect.duration);
    }
    if (effect.type === 'burn_radius') {
      state.skillState.auraRadius += Math.round(effect.amount * 0.25);
    }
    if (effect.type === 'burn_slow') {
      state.skillState.burnSlow = Math.max(state.skillState.burnSlow, effect.amount);
    }
    if (effect.type === 'aoe_stun') {
      state.skillState.microwaveDamage = Math.max(state.skillState.microwaveDamage, effect.damage);
      state.skillState.microwaveRadius = Math.max(state.skillState.microwaveRadius, effect.radius);
      state.skillState.microwaveStunDuration = Math.max(state.skillState.microwaveStunDuration, 3);
      state.skillState.microwaveCooldown = 8;
      state.skillState.microwaveCooldownRemaining = 0;
    }
    if (effect.type === 'burst_projectiles') {
      state.skillState.burstProjectileCount += effect.amount;
      state.skillState.burstCooldownRemaining = 0;
    }
    if (effect.type === 'shield_interval') {
      state.skillState.shieldInterval = state.skillState.shieldInterval > 0
        ? Math.min(state.skillState.shieldInterval, effect.seconds)
        : effect.seconds;
      state.skillState.shieldCooldownRemaining = 0;
    }
    if (effect.type === 'clone_spawn') {
      state.skillState.cloneSpawnInterval = Math.min(state.skillState.cloneSpawnInterval || effect.interval, effect.interval);
      state.skillState.cloneSpawnRemaining = 0;
      state.skillState.cloneLimit = Math.max(state.skillState.cloneLimit, 1);
    }
    if (effect.type === 'clone_inherit') {
      state.skillState.cloneDamageMultiplier = Math.max(state.skillState.cloneDamageMultiplier, effect.amount);
    }
    if (effect.type === 'clone_limit') {
      state.skillState.cloneLimit += effect.amount;
    }
    if (effect.type === 'clone_swarm') {
      state.skillState.cloneLimit += effect.amount;
      state.skillState.cloneSpawnRemaining = 0;
    }
  }
}
