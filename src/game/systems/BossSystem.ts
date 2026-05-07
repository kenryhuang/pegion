import { BOSSES } from '../data/bosses';
import type { Boss, BossWarning } from '../entities/Boss';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import type { BossKind, Vector2 } from '../types';
import { spawnEnemy } from './SpawnSystem';

export function spawnTimedEncounters(state: GameState): void {
  const wholeSecond = Math.floor(state.time);
  if (wholeSecond >= 180 && wholeSecond % 180 === 0 && !state.enemies.some((enemy) => enemy.isElite && enemy.id.includes(String(wholeSecond)))) {
    const kind = wholeSecond % 360 === 0 ? 'projectile_elite' : 'charge_elite';
    const elite = spawnEnemy(state, kind, offsetFromPlayer(state, 360));
    elite.id = `${elite.id}-${wholeSecond}`;
  }

  if (wholeSecond >= 360 && wholeSecond % 360 === 0 && !state.bosses.some((boss) => boss.id.includes(String(wholeSecond)))) {
    spawnBoss(state, wholeSecond % 720 === 0 ? 'microwave_boss' : 'printer_boss', wholeSecond);
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
        resolveWarningDamage(state, boss.activeWarning);
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
    kind: skill.id.includes('line') ? 'line' : skill.id.includes('ring') ? 'ring' : 'circle',
    position: { ...state.player.position },
    direction: { x: dx / distance, y: dy / distance },
    radius: skill.radius,
    width: skill.radius,
    damage: skill.damage * boss.damageMultiplier,
    remaining: skill.warningSeconds,
  };
}

function resolveWarningDamage(state: GameState, warning: BossWarning): void {
  if (state.player.invincibleRemaining > 0) {
    return;
  }

  const distance = Math.hypot(state.player.position.x - warning.position.x, state.player.position.y - warning.position.y);
  if (distance <= warning.radius + state.player.body.radius) {
    state.player.hp = Math.max(0, state.player.hp - warning.damage);
    state.player.invincibleRemaining = 0.6;
    if (state.player.hp === 0) {
      state.mode = 'gameOver';
    }
  }
}

function offsetFromPlayer(state: GameState, distance: number): Vector2 {
  const angle = state.rng.range(0, Math.PI * 2);
  return {
    x: state.player.position.x + Math.cos(angle) * distance,
    y: state.player.position.y + Math.sin(angle) * distance,
  };
}
