import { BOSSES } from '../data/bosses';
import type { Boss, BossWarning } from '../entities/Boss';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import type { BossKind, Vector2 } from '../types';
import { applyPlayerDamage } from './PlayerDamageSystem';
import { spawnEnemy } from './SpawnSystem';
import { addBossSlam, addClownDash, addFirePit } from './VisualEffectSystem';

export function spawnTimedEncounters(state: GameState): void {
  const wholeSecond = Math.floor(state.time);
  if (wholeSecond >= 180 && wholeSecond % 180 === 0 && !state.enemies.some((enemy) => enemy.isElite && enemy.id.includes(String(wholeSecond)))) {
    const kind = wholeSecond % 540 === 0 ? 'black_elite' : wholeSecond % 360 === 0 ? 'projectile_elite' : 'charge_elite';
    const elite = spawnEnemy(state, kind, offsetFromPlayer(state, 360));
    elite.id = `${elite.id}-${wholeSecond}`;
  }

  const bossLevel = Math.floor(state.player.level / 10) * 10;
  if ((bossLevel === 10 || bossLevel === 20) && !state.spawnedBossLevels.has(bossLevel)) {
    state.spawnedBossLevels.add(bossLevel);
    spawnBoss(state, getBossKindForLevel(bossLevel), bossLevel);
  }
}

export function updateBosses(state: GameState, deltaSeconds: number): void {
  for (const boss of state.bosses) {
    const dx = state.player.position.x - boss.position.x;
    const dy = state.player.position.y - boss.position.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    boss.velocity.x = (dx / distance) * boss.speed;
    boss.velocity.y = (dy / distance) * boss.speed;
    boss.position.x += boss.velocity.x * deltaSeconds;
    boss.position.y += boss.velocity.y * deltaSeconds;

    if (boss.hp <= boss.maxHp / 2) {
      boss.phase = 2;
      boss.damageMultiplier = 1.25;
    }

    if (boss.activeWarning) {
      boss.activeWarning.remaining -= deltaSeconds;
      if (boss.activeWarning.remaining <= 0) {
        resolveWarningDamage(state, boss, boss.activeWarning);
        boss.activeWarning = null;
      }
      continue;
    }

    boss.skillCooldownRemaining -= deltaSeconds;
    if (boss.skillCooldownRemaining <= 0) {
      boss.activeWarning = createWarning(state, boss);
      boss.skillCooldownRemaining = boss.phase === 2 ? 2.5 : 4;
    }
  }
}

function spawnBoss(state: GameState, kind: BossKind, timeMarker: number): Boss {
  const definition = BOSSES[kind];
  const boss: Boss = {
    id: `${createEntityId(state, 'boss')}-${timeMarker}`,
    kind,
    position: offsetFromPlayer(state, 520),
    velocity: { x: 0, y: 0 },
    body: { radius: definition.radius },
    hp: definition.hp,
    maxHp: definition.hp,
    speed: definition.speed,
    damageMultiplier: 1,
    phase: 1,
    skillCooldownRemaining: 1,
    activeWarning: null,
  };
  state.bosses.push(boss);
  return boss;
}

function createWarning(state: GameState, boss: Boss): BossWarning {
  const definition = BOSSES[boss.kind];
  const skill = definition.skills[state.rng.integer(0, definition.skills.length - 1)];
  const dx = state.player.position.x - boss.position.x;
  const dy = state.player.position.y - boss.position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));

  return {
    id: createEntityId(state, 'warning'),
    skillId: skill.id,
    kind: skill.id.includes('line') ? 'line' : skill.id.includes('ring') ? 'ring' : 'circle',
    position: getWarningPosition(state, boss, skill.id),
    direction: { x: dx / distance, y: dy / distance },
    radius: skill.radius,
    width: skill.radius,
    damage: skill.damage * boss.damageMultiplier,
    remaining: skill.warningSeconds,
  };
}

function resolveWarningDamage(state: GameState, boss: Boss, warning: BossWarning): void {
  if (warning.skillId === 'chef_fireball') {
    addFirePit(state, warning.position, 3.5, warning.radius);
  }
  if (warning.skillId === 'chef_leap') {
    boss.position = { ...warning.position };
    boss.velocity = { x: 0, y: 0 };
    addBossSlam(state, warning.position, warning.radius);
  }
  if (warning.skillId === 'clown_dash') {
    const startPosition = { ...boss.position };
    boss.position = { ...warning.position };
    boss.velocity = { x: 0, y: 0 };
    addClownDash(state, startPosition, warning.position);
  }
  if (warning.skillId === 'clown_dart') {
    fireClownDart(state, boss, warning);
    return;
  }

  const distance = Math.hypot(state.player.position.x - warning.position.x, state.player.position.y - warning.position.y);
  if (distance <= warning.radius + state.player.body.radius) {
    applyPlayerDamage(state, warning.damage, warning.position);
  }
}

function getWarningPosition(state: GameState, boss: Boss, skillId: string): Vector2 {
  if (skillId === 'chef_leap') {
    const angle = state.rng.range(0, Math.PI * 2);
    const distance = state.rng.range(12, 48);
    return {
      x: state.player.position.x + Math.cos(angle) * distance,
      y: state.player.position.y + Math.sin(angle) * distance,
    };
  }
  if (skillId === 'chef_fireball') {
    const angle = state.rng.range(0, Math.PI * 2);
    const distance = state.rng.range(0, 90);
    return {
      x: state.player.position.x + Math.cos(angle) * distance,
      y: state.player.position.y + Math.sin(angle) * distance,
    };
  }
  if (skillId === 'clown_dash' || skillId === 'clown_dart') {
    return { ...state.player.position };
  }
  return { ...state.player.position };
}

function getBossKindForLevel(level: number): BossKind {
  if (level === 10) {
    return 'chef_boss';
  }
  return 'clown_boss';
}

function fireClownDart(state: GameState, boss: Boss, warning: BossWarning): void {
  const dx = warning.position.x - boss.position.x;
  const dy = warning.position.y - boss.position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  state.projectiles.push({
    id: createEntityId(state, 'clown-dart'),
    owner: 'boss',
    position: { ...boss.position },
    velocity: {
      x: (dx / distance) * 420,
      y: (dy / distance) * 420,
    },
    body: { radius: 7 },
    damage: warning.damage,
    pierceRemaining: 0,
    lifeRemaining: 1.6,
    hitEnemyIds: new Set<string>(),
    isCritical: false,
  });
}

function offsetFromPlayer(state: GameState, distance: number): Vector2 {
  const angle = state.rng.range(0, Math.PI * 2);
  return {
    x: state.player.position.x + Math.cos(angle) * distance,
    y: state.player.position.y + Math.sin(angle) * distance,
  };
}
