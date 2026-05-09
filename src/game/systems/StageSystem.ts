import { STAGES, type StageDefinition } from '../data/stages';
import type { GameState } from '../state/GameState';

export function getCurrentStage(time: number): StageDefinition {
  return [...STAGES].reverse().find((stage) => time >= stage.startsAt) ?? STAGES[0];
}

export function updateStage(state: GameState): void {
  state.stageId = getCurrentStage(state.time).id;
}
