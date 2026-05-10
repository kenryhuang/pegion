import type { BossKind } from '../types';

export interface BossSkillDefinition {
  id: string;
  warningSeconds: number;
  cooldown: number;
  damage: number;
  radius: number;
}

export interface BossDefinition {
  id: BossKind;
  name: string;
  hp: number;
  speed: number;
  radius: number;
  skills: BossSkillDefinition[];
}

export const BOSSES: Record<BossKind, BossDefinition> = {
  printer_boss: {
    id: 'printer_boss',
    name: '打印机大王',
    hp: 1200,
    speed: 56,
    radius: 34,
    skills: [
      { id: 'paper_line', warningSeconds: 0.75, cooldown: 4, damage: 30, radius: 24 },
      { id: 'paper_summon', warningSeconds: 0.8, cooldown: 7, damage: 0, radius: 160 },
      { id: 'overtime_zone', warningSeconds: 0.9, cooldown: 6, damage: 18, radius: 110 },
    ],
  },
  microwave_boss: {
    id: 'microwave_boss',
    name: '微波炉魔王',
    hp: 1400,
    speed: 50,
    radius: 36,
    skills: [
      { id: 'heat_ring', warningSeconds: 0.9, cooldown: 5, damage: 32, radius: 180 },
      { id: 'popcorn_blast', warningSeconds: 0.8, cooldown: 5, damage: 28, radius: 84 },
      { id: 'charged_shockwave', warningSeconds: 1.1, cooldown: 9, damage: 40, radius: 240 },
    ],
  },
};
