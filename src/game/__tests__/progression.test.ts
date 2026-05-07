import { describe, expect, it } from 'vitest';
import { SKILL_TREE } from '../data/skills';
import { createGameState } from '../state/GameState';
import { addExperience } from '../systems/ExperienceSystem';
import { canUnlockSkill, unlockSkill } from '../systems/SkillSystem';

describe('progression', () => {
  it('levels up and pauses for skill selection', () => {
    const state = createGameState('xp');
    state.mode = 'running';

    addExperience(state, 10);

    expect(state.player.level).toBe(2);
    expect(state.player.skillPoints).toBe(1);
    expect(state.mode).toBe('levelUp');
  });

  it('enforces skill prerequisites and branch point requirements', () => {
    const state = createGameState('skills');
    const ultimate = SKILL_TREE.find((skill) => skill.id === 'office_quarterly_storm');

    expect(ultimate).toBeDefined();
    expect(canUnlockSkill(state, ultimate!)).toBe(false);

    for (const id of ['office_paperclip', 'office_stapler', 'office_folder_pierce', 'office_shredder_field', 'office_overtime_notice']) {
      state.player.skillPoints = 1;
      unlockSkill(state, id);
    }

    state.player.skillPoints = 1;
    expect(canUnlockSkill(state, ultimate!)).toBe(true);
  });
});
