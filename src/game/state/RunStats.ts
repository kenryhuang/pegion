export interface RunStats {
  survivalTime: number;
  kills: number;
  elitesDefeated: number;
  bossesDefeated: number;
  highestLevel: number;
  score: number;
  mainSkillBranch: string;
}

export function createRunStats(): RunStats {
  return {
    survivalTime: 0,
    kills: 0,
    elitesDefeated: 0,
    bossesDefeated: 0,
    highestLevel: 1,
    score: 0,
    mainSkillBranch: 'none',
  };
}
