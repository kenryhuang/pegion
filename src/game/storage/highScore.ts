const key = 'pas-best-score';

export function getBestScore(): number {
  return Number(localStorage.getItem(key) ?? 0);
}

export function saveBestScore(score: number): number {
  const best = Math.max(getBestScore(), score);
  localStorage.setItem(key, String(best));
  return best;
}
