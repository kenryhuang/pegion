import type { GameState } from '../state/GameState';

export const gameEventNames = {
  stateUpdated: 'pas:state-updated',
  startRun: 'pas:start-run',
  pauseRun: 'pas:pause-run',
  resumeRun: 'pas:resume-run',
  restartRun: 'pas:restart-run',
  selectSkill: 'pas:select-skill',
} as const;

export interface GameStateUpdatedDetail {
  state: GameState;
}

export interface SelectSkillDetail {
  skillId: string;
}

export function emitGameState(state: GameState): void {
  window.dispatchEvent(new CustomEvent<GameStateUpdatedDetail>(gameEventNames.stateUpdated, { detail: { state } }));
}

export function emitSimpleGameEvent(name: keyof Pick<typeof gameEventNames, 'startRun' | 'pauseRun' | 'resumeRun' | 'restartRun'>): void {
  window.dispatchEvent(new CustomEvent(gameEventNames[name]));
}

export function emitSkillSelection(skillId: string): void {
  window.dispatchEvent(new CustomEvent<SelectSkillDetail>(gameEventNames.selectSkill, { detail: { skillId } }));
}
