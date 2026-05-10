import type { SkillBranch } from './skills';

export const branchLabels: Record<SkillBranch | 'none', string> = {
  office: '办公用品',
  kitchen: '厨房乱斗',
  magnet: '磁铁失控',
  clone: '分身会议',
  none: '未选择',
};

export const stageLabels: Record<string, string> = {
  opening: '开局热身',
  first_elite: '精英登场',
  first_boss: '首领压境',
  dense: '怪潮加密',
  pressure_loop: '高压循环',
};
