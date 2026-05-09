export const balance = {
  map: {
    width: 2400,
    height: 1600,
  },
  player: {
    contactInvincibility: 0.6,
    dashDuration: 0.18,
    dashSpeed: 760,
  },
  xpCurve: {
    baseExp: 4,
    linearGrowth: 5,
    curveGrowth: 1,
  },
  drops: {
    healthPackChance: 0.04,
    magnetChance: 0.025,
    speedBoostChance: 0.025,
  },
} as const;

export function getNextLevelXp(level: number): number {
  if (level === 1) {
    return 10;
  }
  if (level === 2) {
    return 18;
  }
  if (level === 3) {
    return 28;
  }

  return Math.floor(
    balance.xpCurve.baseExp +
      level * balance.xpCurve.linearGrowth +
      level * level * balance.xpCurve.curveGrowth,
  );
}
