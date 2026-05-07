# Pixel Absurd Survivor MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable web MVP: top-down movement, dash, auto-attack, enemies, XP, level-up skill tree, stages, elites, bosses, HUD, game over, and local high score.

**Architecture:** Vue owns overlay UI and emits run commands. Phaser owns rendering, input mapping, camera, and the frame loop. Simulation logic lives in typed data objects and systems under `src/game/`, with seedable RNG and no Vue or Phaser dependencies in pure systems.

**Tech Stack:** Vue 3, Vite, TypeScript, Phaser 3, Vitest, jsdom, localStorage.

---

## Scope Notes

The design spec covers the full v1 game across many subsystems. This plan keeps it as one MVP because every task builds toward one playable vertical slice, but the work is sequenced so each task is independently testable and committable.

This plan intentionally uses primitive pixel-style rectangles and generated Phaser graphics first. Asset production can be a separate later plan after the game loop is fun.

## File Structure

- Create `package.json`, `index.html`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `src/main.ts`, `src/app/App.vue`, `src/styles.css`: project scaffold, scripts, Vue mount, global layout.
- Create `src/game/utils/RNG.ts`: seedable gameplay randomness.
- Create `src/game/types.ts`: shared scalar types and entity unions.
- Create `src/game/entities/Player.ts`, `Enemy.ts`, `Projectile.ts`, `Pickup.ts`, `Boss.ts`: passive entity factories and interfaces.
- Create `src/game/state/GameState.ts`, `src/game/state/RunStats.ts`: single managed simulation state and scoring.
- Create `src/game/data/balance.ts`, `enemies.ts`, `skills.ts`, `bosses.ts`, `stages.ts`: typed config tables for tuning and content.
- Create `src/game/systems/MovementSystem.ts`, `CombatSystem.ts`, `CollisionSystem.ts`, `ExperienceSystem.ts`, `SkillSystem.ts`, `SpawnSystem.ts`, `StageSystem.ts`, `BossSystem.ts`: pure simulation updates.
- Create `src/game/main.ts`, `src/game/scenes/BootScene.ts`, `src/game/scenes/GameScene.ts`: Phaser bootstrap and thin scene layer.
- Create `src/game/events/GameEvents.ts`: typed CustomEvent bridge between Vue and Phaser.
- Create `src/ui/Hud.vue`, `src/ui/SkillTree.vue`, `src/ui/PauseMenu.vue`, `src/ui/GameOverPanel.vue`, `src/ui/MainMenu.vue`: overlay UI only.
- Create `src/game/storage/highScore.ts`: local highest score persistence.
- Create `src/game/__tests__/*.test.ts`: Vitest coverage for pure logic and the run flow.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `src/main.ts`
- Create: `src/app/App.vue`
- Create: `src/styles.css`

- [ ] **Step 1: Create the failing smoke test command**

Run: `npm test -- --run`

Expected: FAIL because `package.json` and test setup do not exist yet.

- [ ] **Step 2: Add package scripts and dependencies**

Create `package.json`:

```json
{
  "name": "pixel-absurd-survivor",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vue-tsc --noEmit && vite build",
    "test": "vitest",
    "test:run": "vitest --run"
  },
  "dependencies": {
    "@vitejs/plugin-vue": "^5.2.3",
    "phaser": "^3.90.0",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^25.0.1",
    "typescript": "^5.8.2",
    "vite": "^6.2.0",
    "vitest": "^3.0.8",
    "vue-tsc": "^2.2.8"
  }
}
```

- [ ] **Step 3: Add TypeScript and Vite config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "vite.config.ts", "vitest.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
});
```

Create `vitest.config.ts`:

```ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 4: Add the Vue entry point**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pixel Absurd Survivor</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `src/main.ts`:

```ts
import { createApp } from 'vue';
import App from './app/App.vue';
import './styles.css';

createApp(App).mount('#app');
```

Create `src/app/App.vue`:

```vue
<script setup lang="ts">
</script>

<template>
  <main class="app-shell">
    <section class="game-root">
      <h1>Pixel Absurd Survivor</h1>
      <button type="button" class="primary-action">Start Run</button>
    </section>
  </main>
</template>
```

Create `src/styles.css`:

```css
* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  background: #11151f;
  color: #f6f1dc;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button {
  font: inherit;
}

.app-shell {
  min-height: 100%;
  display: grid;
  place-items: center;
  background: #11151f;
}

.game-root {
  width: min(100vw, 1280px);
  height: min(100vh, 720px);
  min-height: 520px;
  position: relative;
  overflow: hidden;
  border: 2px solid #3a4158;
  background: #1b2130;
}

.primary-action {
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 6px;
  background: #f6c453;
  color: #1d1a14;
  cursor: pointer;
}
```

- [ ] **Step 5: Install and verify**

Run: `npm install`

Expected: PASS and `package-lock.json` is created.

Run: `npm run build`

Expected: PASS with a production build in `dist/`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts src/main.ts src/app/App.vue src/styles.css
git commit -m "chore: scaffold vue phaser project"
```

---

### Task 2: Core State, Entities, and RNG

**Files:**
- Create: `src/game/utils/RNG.ts`
- Create: `src/game/types.ts`
- Create: `src/game/entities/Player.ts`
- Create: `src/game/entities/Enemy.ts`
- Create: `src/game/entities/Projectile.ts`
- Create: `src/game/entities/Pickup.ts`
- Create: `src/game/entities/Boss.ts`
- Create: `src/game/state/RunStats.ts`
- Create: `src/game/state/GameState.ts`
- Create: `src/game/__tests__/state.test.ts`

- [ ] **Step 1: Write failing tests for deterministic state**

Create `src/game/__tests__/state.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { RNG } from '../utils/RNG';

describe('game state', () => {
  it('creates a stable initial player and empty run lists', () => {
    const state = createGameState('seed-a');

    expect(state.player.id).toBe('player-1');
    expect(state.player.hp).toBe(100);
    expect(state.enemies).toHaveLength(0);
    expect(state.projectiles).toHaveLength(0);
    expect(state.pickups).toHaveLength(0);
    expect(state.stats.kills).toBe(0);
  });

  it('generates repeatable random numbers for the same seed', () => {
    const first = new RNG('same-seed');
    const second = new RNG('same-seed');

    expect([first.next(), first.next(), first.next()]).toEqual([
      second.next(),
      second.next(),
      second.next(),
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/game/__tests__/state.test.ts`

Expected: FAIL with missing module errors for `GameState` and `RNG`.

- [ ] **Step 3: Add shared types and RNG**

Create `src/game/types.ts`:

```ts
export interface Vector2 {
  x: number;
  y: number;
}

export interface CircleBody {
  radius: number;
}

export type GameMode = 'menu' | 'running' | 'levelUp' | 'paused' | 'gameOver';

export type EnemyKind = 'slow_mob' | 'fast_mob' | 'tank_mob';

export type EliteKind = 'charge_elite' | 'projectile_elite';

export type BossKind = 'printer_boss' | 'microwave_boss';

export type PickupKind = 'xp_crystal' | 'health_pack' | 'magnet' | 'speed_boost';

export type ProjectileOwner = 'player' | 'enemy' | 'boss';
```

Create `src/game/utils/RNG.ts`:

```ts
export class RNG {
  private state: number;

  constructor(seed: string) {
    this.state = RNG.hashSeed(seed);
  }

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  integer(min: number, maxInclusive: number): number {
    return Math.floor(this.range(min, maxInclusive + 1));
  }

  pickWeighted<T extends { weight: number }>(items: T[]): T {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let cursor = this.range(0, total);

    for (const item of items) {
      cursor -= item.weight;
      if (cursor <= 0) {
        return item;
      }
    }

    return items[items.length - 1];
  }

  private static hashSeed(seed: string): number {
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
}
```

- [ ] **Step 4: Add passive entity definitions**

Create `src/game/entities/Player.ts`:

```ts
import type { CircleBody, Vector2 } from '../types';

export interface Player {
  id: string;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  hp: number;
  maxHp: number;
  speed: number;
  dashCooldown: number;
  dashCooldownRemaining: number;
  dashDurationRemaining: number;
  invincibleRemaining: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  skillPoints: number;
  pickupRadius: number;
  weapon: {
    damage: number;
    attackInterval: number;
    range: number;
    projectileSpeed: number;
    pierce: number;
    knockback: number;
    critChance: number;
    cooldownRemaining: number;
  };
}

export function createPlayer(): Player {
  return {
    id: 'player-1',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    body: { radius: 14 },
    hp: 100,
    maxHp: 100,
    speed: 210,
    dashCooldown: 3,
    dashCooldownRemaining: 0,
    dashDurationRemaining: 0,
    invincibleRemaining: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 10,
    skillPoints: 0,
    pickupRadius: 46,
    weapon: {
      damage: 12,
      attackInterval: 0.45,
      range: 360,
      projectileSpeed: 520,
      pierce: 0,
      knockback: 35,
      critChance: 0.05,
      cooldownRemaining: 0,
    },
  };
}
```

Create `src/game/entities/Enemy.ts`:

```ts
import type { CircleBody, EliteKind, EnemyKind, Vector2 } from '../types';

export interface Enemy {
  id: string;
  kind: EnemyKind | EliteKind;
  isElite: boolean;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  attackCooldownRemaining: number;
  warningRemaining: number;
  status: {
    burnRemaining: number;
    slowRemaining: number;
    stunRemaining: number;
  };
}
```

Create `src/game/entities/Projectile.ts`:

```ts
import type { CircleBody, ProjectileOwner, Vector2 } from '../types';

export interface Projectile {
  id: string;
  owner: ProjectileOwner;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  damage: number;
  pierceRemaining: number;
  lifeRemaining: number;
  hitEnemyIds: Set<string>;
}
```

Create `src/game/entities/Pickup.ts`:

```ts
import type { CircleBody, PickupKind, Vector2 } from '../types';

export interface Pickup {
  id: string;
  kind: PickupKind;
  position: Vector2;
  body: CircleBody;
  value: number;
  magnetized: boolean;
  lifeRemaining: number;
}
```

Create `src/game/entities/Boss.ts`:

```ts
import type { BossKind, CircleBody, Vector2 } from '../types';

export interface Boss {
  id: string;
  kind: BossKind;
  position: Vector2;
  velocity: Vector2;
  body: CircleBody;
  hp: number;
  maxHp: number;
  speed: number;
  damageMultiplier: number;
  phase: 1 | 2;
  skillCooldownRemaining: number;
  activeWarning: BossWarning | null;
}

export interface BossWarning {
  id: string;
  kind: 'line' | 'circle' | 'ring';
  position: Vector2;
  direction: Vector2;
  radius: number;
  width: number;
  damage: number;
  remaining: number;
}
```

- [ ] **Step 5: Add run stats and state factory**

Create `src/game/state/RunStats.ts`:

```ts
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
```

Create `src/game/state/GameState.ts`:

```ts
import type { Boss } from '../entities/Boss';
import type { Enemy } from '../entities/Enemy';
import type { Pickup } from '../entities/Pickup';
import { createPlayer, type Player } from '../entities/Player';
import type { Projectile } from '../entities/Projectile';
import type { GameMode } from '../types';
import { RNG } from '../utils/RNG';
import { createRunStats, type RunStats } from './RunStats';

export interface InputState {
  moveX: number;
  moveY: number;
  dashPressed: boolean;
}

export interface GameState {
  mode: GameMode;
  time: number;
  stageId: string;
  rng: RNG;
  nextEntityId: number;
  input: InputState;
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  bosses: Boss[];
  unlockedSkillIds: Set<string>;
  branchPoints: Record<string, number>;
  stats: RunStats;
}

export function createGameState(seed = String(Date.now())): GameState {
  return {
    mode: 'menu',
    time: 0,
    stageId: 'opening',
    rng: new RNG(seed),
    nextEntityId: 1,
    input: {
      moveX: 0,
      moveY: 0,
      dashPressed: false,
    },
    player: createPlayer(),
    enemies: [],
    projectiles: [],
    pickups: [],
    bosses: [],
    unlockedSkillIds: new Set<string>(),
    branchPoints: {},
    stats: createRunStats(),
  };
}

export function createEntityId(state: GameState, prefix: string): string {
  const id = `${prefix}-${state.nextEntityId}`;
  state.nextEntityId += 1;
  return id;
}
```

- [ ] **Step 6: Verify tests pass**

Run: `npm test -- --run src/game/__tests__/state.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game package.json package-lock.json tsconfig.json vitest.config.ts
git commit -m "state: add core entities and rng"
```

---

### Task 3: Data Configs and XP Logic

**Files:**
- Create: `src/game/data/balance.ts`
- Create: `src/game/data/enemies.ts`
- Create: `src/game/data/skills.ts`
- Create: `src/game/data/bosses.ts`
- Create: `src/game/data/stages.ts`
- Create: `src/game/systems/ExperienceSystem.ts`
- Create: `src/game/systems/SkillSystem.ts`
- Create: `src/game/__tests__/progression.test.ts`

- [ ] **Step 1: Write failing progression tests**

Create `src/game/__tests__/progression.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/game/__tests__/progression.test.ts`

Expected: FAIL with missing config and system modules.

- [ ] **Step 3: Add balance and content data**

Create `src/game/data/balance.ts`:

```ts
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
```

Create `src/game/data/enemies.ts`:

```ts
import type { EliteKind, EnemyKind } from '../types';

export interface EnemyDefinition {
  id: EnemyKind | EliteKind;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  xpValue: number;
  radius: number;
  weight: number;
  isElite: boolean;
}

export const ENEMIES: Record<EnemyKind | EliteKind, EnemyDefinition> = {
  slow_mob: {
    id: 'slow_mob',
    name: 'Slow Mob',
    hp: 22,
    speed: 82,
    damage: 9,
    xpValue: 4,
    radius: 13,
    weight: 8,
    isElite: false,
  },
  fast_mob: {
    id: 'fast_mob',
    name: 'Fast Mob',
    hp: 12,
    speed: 145,
    damage: 8,
    xpValue: 5,
    radius: 11,
    weight: 3,
    isElite: false,
  },
  tank_mob: {
    id: 'tank_mob',
    name: 'Tank Mob',
    hp: 70,
    speed: 58,
    damage: 12,
    xpValue: 12,
    radius: 18,
    weight: 1,
    isElite: false,
  },
  charge_elite: {
    id: 'charge_elite',
    name: 'Charge Elite',
    hp: 240,
    speed: 90,
    damage: 24,
    xpValue: 60,
    radius: 22,
    weight: 1,
    isElite: true,
  },
  projectile_elite: {
    id: 'projectile_elite',
    name: 'Projectile Elite',
    hp: 210,
    speed: 72,
    damage: 22,
    xpValue: 60,
    radius: 22,
    weight: 1,
    isElite: true,
  },
};
```

Create `src/game/data/skills.ts`:

```ts
export type SkillBranch = 'office' | 'kitchen' | 'magnet' | 'clone';

export type SkillEffect =
  | { type: 'projectile_homing'; amount: number }
  | { type: 'stun_chance'; amount: number }
  | { type: 'pierce'; amount: number }
  | { type: 'aura_damage'; amount: number; radius: number }
  | { type: 'elite_boss_damage'; amount: number }
  | { type: 'burst_projectiles'; amount: number }
  | { type: 'bounce'; amount: number }
  | { type: 'burn'; damage: number; duration: number; radius: number }
  | { type: 'shield_interval'; seconds: number }
  | { type: 'burn_radius'; amount: number }
  | { type: 'burn_slow'; amount: number }
  | { type: 'aoe_stun'; damage: number; radius: number }
  | { type: 'pickup_radius'; amount: number }
  | { type: 'enemy_drift'; amount: number }
  | { type: 'dash_pickup'; radius: number }
  | { type: 'pull_pulse'; radius: number; strength: number }
  | { type: 'global_magnet'; radius: number }
  | { type: 'clone_spawn'; interval: number }
  | { type: 'clone_inherit'; amount: number }
  | { type: 'lethal_guard'; amount: number }
  | { type: 'clone_limit'; amount: number }
  | { type: 'clone_burst'; damage: number }
  | { type: 'clone_swarm'; amount: number };

export interface SkillNode {
  id: string;
  name: string;
  branch: SkillBranch;
  tier: number;
  prerequisites: string[];
  branchPointRequirement: number;
  effects: SkillEffect[];
  description: string;
}

export const SKILL_TREE: SkillNode[] = [
  { id: 'office_paperclip', name: 'Paperclip Rounds', branch: 'office', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'projectile_homing', amount: 0.18 }], description: 'Projectiles lightly track nearby targets.' },
  { id: 'office_stapler', name: 'Stapler Burst', branch: 'office', tier: 2, prerequisites: ['office_paperclip'], branchPointRequirement: 1, effects: [{ type: 'stun_chance', amount: 0.12 }], description: 'Hits can briefly stun small enemies.' },
  { id: 'office_folder_pierce', name: 'Folder Pierce', branch: 'office', tier: 3, prerequisites: ['office_stapler'], branchPointRequirement: 2, effects: [{ type: 'pierce', amount: 1 }], description: 'Projectiles pierce one extra enemy.' },
  { id: 'office_shredder_field', name: 'Shredder Field', branch: 'office', tier: 4, prerequisites: ['office_folder_pierce'], branchPointRequirement: 3, effects: [{ type: 'aura_damage', amount: 8, radius: 92 }], description: 'A small damage field surrounds the player.' },
  { id: 'office_overtime_notice', name: 'Overtime Notice', branch: 'office', tier: 5, prerequisites: ['office_shredder_field'], branchPointRequirement: 4, effects: [{ type: 'elite_boss_damage', amount: 0.2 }], description: 'Attacks hit elites and bosses harder.' },
  { id: 'office_quarterly_storm', name: 'Quarterly Storm', branch: 'office', tier: 6, prerequisites: ['office_overtime_notice'], branchPointRequirement: 5, effects: [{ type: 'burst_projectiles', amount: 12 }], description: 'Periodically releases radial file projectiles.' },
  { id: 'kitchen_pan', name: 'Pan Ricochet', branch: 'kitchen', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'bounce', amount: 1 }], description: 'Attacks bounce between enemies.' },
  { id: 'kitchen_chili', name: 'Chili Puddle', branch: 'kitchen', tier: 2, prerequisites: ['kitchen_pan'], branchPointRequirement: 1, effects: [{ type: 'burn', damage: 5, duration: 2, radius: 48 }], description: 'Hits leave burning puddles.' },
  { id: 'kitchen_fridge_shield', name: 'Fridge Door Shield', branch: 'kitchen', tier: 3, prerequisites: ['kitchen_chili'], branchPointRequirement: 2, effects: [{ type: 'shield_interval', seconds: 12 }], description: 'Periodically blocks one hit.' },
  { id: 'kitchen_smoke_spread', name: 'Smoke Spread', branch: 'kitchen', tier: 4, prerequisites: ['kitchen_chili'], branchPointRequirement: 3, effects: [{ type: 'burn_radius', amount: 24 }], description: 'Burning areas grow wider.' },
  { id: 'kitchen_frozen_leftovers', name: 'Frozen Leftovers', branch: 'kitchen', tier: 5, prerequisites: ['kitchen_smoke_spread'], branchPointRequirement: 4, effects: [{ type: 'burn_slow', amount: 0.25 }], description: 'Burning enemies are slowed.' },
  { id: 'kitchen_microwave_overload', name: 'Microwave Overload', branch: 'kitchen', tier: 6, prerequisites: ['kitchen_frozen_leftovers'], branchPointRequirement: 5, effects: [{ type: 'aoe_stun', damage: 70, radius: 220 }], description: 'Releases a wide stunning blast.' },
  { id: 'magnet_xp_pull', name: 'XP Pull', branch: 'magnet', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'pickup_radius', amount: 60 }], description: 'Increases pickup radius.' },
  { id: 'magnet_bullets', name: 'Magnetic Rounds', branch: 'magnet', tier: 2, prerequisites: ['magnet_xp_pull'], branchPointRequirement: 1, effects: [{ type: 'projectile_homing', amount: 0.12 }], description: 'Projectiles bend toward enemies.' },
  { id: 'magnet_enemy_drift', name: 'Mob Drift', branch: 'magnet', tier: 3, prerequisites: ['magnet_bullets'], branchPointRequirement: 2, effects: [{ type: 'enemy_drift', amount: 0.15 }], description: 'Nearby small enemies drift off course.' },
  { id: 'magnet_dash_pickup', name: 'Dash Pickup', branch: 'magnet', tier: 4, prerequisites: ['magnet_enemy_drift'], branchPointRequirement: 3, effects: [{ type: 'dash_pickup', radius: 120 }], description: 'Dash pulls XP near its path.' },
  { id: 'magnet_pull_pulse', name: 'Pull Coil', branch: 'magnet', tier: 5, prerequisites: ['magnet_dash_pickup'], branchPointRequirement: 4, effects: [{ type: 'pull_pulse', radius: 180, strength: 120 }], description: 'Pulses pull small enemies together.' },
  { id: 'magnet_global_pull', name: 'Full Field Pull', branch: 'magnet', tier: 6, prerequisites: ['magnet_pull_pulse'], branchPointRequirement: 5, effects: [{ type: 'global_magnet', radius: 900 }], description: 'Pulls distant XP and releases a shockwave.' },
  { id: 'clone_temporary', name: 'Temporary Clone', branch: 'clone', tier: 1, prerequisites: [], branchPointRequirement: 0, effects: [{ type: 'clone_spawn', interval: 10 }], description: 'Periodically creates a short-lived clone.' },
  { id: 'clone_inherit', name: 'Inherited Office Drama', branch: 'clone', tier: 2, prerequisites: ['clone_temporary'], branchPointRequirement: 1, effects: [{ type: 'clone_inherit', amount: 0.35 }], description: 'Clones inherit part of your attack upgrades.' },
  { id: 'clone_guard', name: 'Substitute Save', branch: 'clone', tier: 3, prerequisites: ['clone_inherit'], branchPointRequirement: 2, effects: [{ type: 'lethal_guard', amount: 1 }], description: 'A clone can block fatal damage.' },
  { id: 'clone_meeting_limit', name: 'Meeting Capacity', branch: 'clone', tier: 4, prerequisites: ['clone_guard'], branchPointRequirement: 3, effects: [{ type: 'clone_limit', amount: 1 }], description: 'Raises the clone limit.' },
  { id: 'clone_burst', name: 'Clone Burst', branch: 'clone', tier: 5, prerequisites: ['clone_meeting_limit'], branchPointRequirement: 4, effects: [{ type: 'clone_burst', damage: 30 }], description: 'Clones explode when they expire.' },
  { id: 'clone_swarm', name: 'Too Many Meetings', branch: 'clone', tier: 6, prerequisites: ['clone_burst'], branchPointRequirement: 5, effects: [{ type: 'clone_swarm', amount: 5 }], description: 'Summons a swarm focused on elites and bosses.' },
];
```

- [ ] **Step 4: Add boss and stage data**

Create `src/game/data/bosses.ts`:

```ts
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
    name: 'The Printer',
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
    name: 'The Microwave',
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
```

Create `src/game/data/stages.ts`:

```ts
import type { EnemyKind } from '../types';

export interface StageDefinition {
  id: string;
  startsAt: number;
  spawnInterval: number;
  maxEnemies: number;
  hpMultiplier: number;
  speedMultiplier: number;
  enemyWeights: Array<{ kind: EnemyKind; weight: number }>;
}

export const STAGES: StageDefinition[] = [
  { id: 'opening', startsAt: 0, spawnInterval: 0.85, maxEnemies: 45, hpMultiplier: 1, speedMultiplier: 1, enemyWeights: [{ kind: 'slow_mob', weight: 1 }] },
  { id: 'first_elite', startsAt: 180, spawnInterval: 0.7, maxEnemies: 65, hpMultiplier: 1.15, speedMultiplier: 1.05, enemyWeights: [{ kind: 'slow_mob', weight: 6 }, { kind: 'fast_mob', weight: 2 }] },
  { id: 'first_boss', startsAt: 360, spawnInterval: 0.62, maxEnemies: 80, hpMultiplier: 1.3, speedMultiplier: 1.08, enemyWeights: [{ kind: 'slow_mob', weight: 6 }, { kind: 'fast_mob', weight: 3 }, { kind: 'tank_mob', weight: 1 }] },
  { id: 'dense', startsAt: 600, spawnInterval: 0.48, maxEnemies: 110, hpMultiplier: 1.55, speedMultiplier: 1.14, enemyWeights: [{ kind: 'slow_mob', weight: 5 }, { kind: 'fast_mob', weight: 4 }, { kind: 'tank_mob', weight: 2 }] },
  { id: 'pressure_loop', startsAt: 900, spawnInterval: 0.36, maxEnemies: 150, hpMultiplier: 1.9, speedMultiplier: 1.22, enemyWeights: [{ kind: 'slow_mob', weight: 5 }, { kind: 'fast_mob', weight: 5 }, { kind: 'tank_mob', weight: 3 }] },
];
```

- [ ] **Step 5: Add XP and skill systems**

Create `src/game/systems/ExperienceSystem.ts`:

```ts
import { getNextLevelXp } from '../data/balance';
import type { GameState } from '../state/GameState';

export function addExperience(state: GameState, amount: number): void {
  state.player.xp += amount;

  while (state.player.xp >= state.player.nextLevelXp) {
    state.player.xp -= state.player.nextLevelXp;
    state.player.level += 1;
    state.player.skillPoints += 1;
    state.player.nextLevelXp = getNextLevelXp(state.player.level);
    state.stats.highestLevel = Math.max(state.stats.highestLevel, state.player.level);
    state.mode = 'levelUp';
  }
}
```

Create `src/game/systems/SkillSystem.ts`:

```ts
import { SKILL_TREE, type SkillNode } from '../data/skills';
import type { GameState } from '../state/GameState';

export function getSkillById(skillId: string): SkillNode {
  const skill = SKILL_TREE.find((node) => node.id === skillId);
  if (!skill) {
    throw new Error(`Unknown skill: ${skillId}`);
  }
  return skill;
}

export function canUnlockSkill(state: GameState, skill: SkillNode): boolean {
  if (state.player.skillPoints <= 0) {
    return false;
  }
  if (state.unlockedSkillIds.has(skill.id)) {
    return false;
  }
  if ((state.branchPoints[skill.branch] ?? 0) < skill.branchPointRequirement) {
    return false;
  }
  return skill.prerequisites.every((id) => state.unlockedSkillIds.has(id));
}

export function unlockSkill(state: GameState, skillId: string): void {
  const skill = getSkillById(skillId);
  if (!canUnlockSkill(state, skill)) {
    throw new Error(`Skill is locked: ${skillId}`);
  }

  state.unlockedSkillIds.add(skill.id);
  state.player.skillPoints -= 1;
  state.branchPoints[skill.branch] = (state.branchPoints[skill.branch] ?? 0) + 1;
  state.stats.mainSkillBranch = getMainBranch(state);
  applyImmediateSkillEffects(state, skill);

  if (state.player.skillPoints === 0 && state.mode === 'levelUp') {
    state.mode = 'running';
  }
}

function getMainBranch(state: GameState): string {
  return Object.entries(state.branchPoints).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';
}

function applyImmediateSkillEffects(state: GameState, skill: SkillNode): void {
  for (const effect of skill.effects) {
    if (effect.type === 'pierce') {
      state.player.weapon.pierce += effect.amount;
    }
    if (effect.type === 'pickup_radius') {
      state.player.pickupRadius += effect.amount;
    }
  }
}
```

- [ ] **Step 6: Verify progression**

Run: `npm test -- --run src/game/__tests__/progression.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/data src/game/systems src/game/__tests__/progression.test.ts
git commit -m "data: add progression configs"
```

---

### Task 4: Movement, Dash, Spawn, Combat, Collision

**Files:**
- Create: `src/game/systems/MovementSystem.ts`
- Create: `src/game/systems/SpawnSystem.ts`
- Create: `src/game/systems/CombatSystem.ts`
- Create: `src/game/systems/CollisionSystem.ts`
- Create: `src/game/systems/StageSystem.ts`
- Create: `src/game/__tests__/simulation.test.ts`

- [ ] **Step 1: Write failing simulation tests**

Create `src/game/__tests__/simulation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { fireAutoAttack, updateProjectiles } from '../systems/CombatSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { updateMovement } from '../systems/MovementSystem';
import { spawnEnemy } from '../systems/SpawnSystem';
import { updateStage } from '../systems/StageSystem';

describe('simulation systems', () => {
  it('moves and dashes the player with cooldown', () => {
    const state = createGameState('move');
    state.mode = 'running';
    state.input.moveX = 1;
    state.input.dashPressed = true;

    updateMovement(state, 0.016);

    expect(state.player.position.x).toBeGreaterThan(3);
    expect(state.player.dashCooldownRemaining).toBeGreaterThan(0);
    expect(state.player.invincibleRemaining).toBeGreaterThan(0);
  });

  it('spawns an enemy and auto-fires at the nearest target', () => {
    const state = createGameState('combat');
    state.mode = 'running';
    spawnEnemy(state, 'slow_mob', { x: 100, y: 0 });

    fireAutoAttack(state);

    expect(state.projectiles).toHaveLength(1);
    expect(state.projectiles[0].velocity.x).toBeGreaterThan(0);
  });

  it('turns killed enemies into XP pickups', () => {
    const state = createGameState('collision');
    state.mode = 'running';
    spawnEnemy(state, 'slow_mob', { x: 20, y: 0 });
    state.projectiles.push({
      id: 'projectile-test',
      owner: 'player',
      position: { x: 20, y: 0 },
      velocity: { x: 0, y: 0 },
      body: { radius: 5 },
      damage: 999,
      pierceRemaining: 0,
      lifeRemaining: 1,
      hitEnemyIds: new Set<string>(),
    });

    applyCollisions(state);

    expect(state.enemies).toHaveLength(0);
    expect(state.pickups[0].kind).toBe('xp_crystal');
    expect(state.stats.kills).toBe(1);
  });

  it('advances stage by run time', () => {
    const state = createGameState('stage');
    state.time = 601;

    updateStage(state);

    expect(state.stageId).toBe('dense');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/game/__tests__/simulation.test.ts`

Expected: FAIL with missing system modules.

- [ ] **Step 3: Add movement and stage systems**

Create `src/game/systems/MovementSystem.ts`:

```ts
import { balance } from '../data/balance';
import type { GameState } from '../state/GameState';

export function updateMovement(state: GameState, deltaSeconds: number): void {
  const player = state.player;
  const length = Math.hypot(state.input.moveX, state.input.moveY);
  const moveX = length > 0 ? state.input.moveX / length : 0;
  const moveY = length > 0 ? state.input.moveY / length : 0;

  player.dashCooldownRemaining = Math.max(0, player.dashCooldownRemaining - deltaSeconds);
  player.dashDurationRemaining = Math.max(0, player.dashDurationRemaining - deltaSeconds);
  player.invincibleRemaining = Math.max(0, player.invincibleRemaining - deltaSeconds);

  if (state.input.dashPressed && player.dashCooldownRemaining === 0 && length > 0) {
    player.dashCooldownRemaining = player.dashCooldown;
    player.dashDurationRemaining = balance.player.dashDuration;
    player.invincibleRemaining = balance.player.dashDuration;
  }

  const speed = player.dashDurationRemaining > 0 ? balance.player.dashSpeed : player.speed;
  player.velocity.x = moveX * speed;
  player.velocity.y = moveY * speed;
  player.position.x += player.velocity.x * deltaSeconds;
  player.position.y += player.velocity.y * deltaSeconds;
  player.position.x = clamp(player.position.x, -balance.map.width / 2, balance.map.width / 2);
  player.position.y = clamp(player.position.y, -balance.map.height / 2, balance.map.height / 2);
  state.input.dashPressed = false;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
```

Create `src/game/systems/StageSystem.ts`:

```ts
import { STAGES, type StageDefinition } from '../data/stages';
import type { GameState } from '../state/GameState';

export function getCurrentStage(time: number): StageDefinition {
  return [...STAGES].reverse().find((stage) => time >= stage.startsAt) ?? STAGES[0];
}

export function updateStage(state: GameState): void {
  state.stageId = getCurrentStage(state.time).id;
}
```

- [ ] **Step 4: Add spawn and combat systems**

Create `src/game/systems/SpawnSystem.ts`:

```ts
import { ENEMIES } from '../data/enemies';
import { getCurrentStage } from './StageSystem';
import type { Enemy } from '../entities/Enemy';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import type { EnemyKind, EliteKind, Vector2 } from '../types';

export function spawnEnemy(state: GameState, kind: EnemyKind | EliteKind, position: Vector2): Enemy {
  const definition = ENEMIES[kind];
  const stage = getCurrentStage(state.time);
  const enemy: Enemy = {
    id: createEntityId(state, 'enemy'),
    kind,
    isElite: definition.isElite,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    body: { radius: definition.radius },
    hp: definition.hp * stage.hpMultiplier,
    maxHp: definition.hp * stage.hpMultiplier,
    speed: definition.speed * stage.speedMultiplier,
    damage: definition.damage,
    xpValue: definition.xpValue,
    attackCooldownRemaining: 1.5,
    warningRemaining: 0,
    status: {
      burnRemaining: 0,
      slowRemaining: 0,
      stunRemaining: 0,
    },
  };

  state.enemies.push(enemy);
  return enemy;
}

export function updateSpawning(state: GameState): void {
  const stage = getCurrentStage(state.time);
  if (state.enemies.length >= stage.maxEnemies) {
    return;
  }

  const roll = state.rng.next();
  const spawnChance = Math.min(1, 1 / (stage.spawnInterval * 60));
  if (roll > spawnChance) {
    return;
  }

  const picked = state.rng.pickWeighted(stage.enemyWeights);
  spawnEnemy(state, picked.kind, getSpawnPositionAroundPlayer(state));
}

function getSpawnPositionAroundPlayer(state: GameState): Vector2 {
  const angle = state.rng.range(0, Math.PI * 2);
  const distance = state.rng.range(430, 560);
  return {
    x: state.player.position.x + Math.cos(angle) * distance,
    y: state.player.position.y + Math.sin(angle) * distance,
  };
}
```

Create `src/game/systems/CombatSystem.ts`:

```ts
import type { Enemy } from '../entities/Enemy';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';

export function updateCombat(state: GameState, deltaSeconds: number): void {
  state.player.weapon.cooldownRemaining = Math.max(0, state.player.weapon.cooldownRemaining - deltaSeconds);
  if (state.player.weapon.cooldownRemaining === 0) {
    fireAutoAttack(state);
  }
  updateProjectiles(state, deltaSeconds);
}

export function fireAutoAttack(state: GameState): void {
  const target = findNearestEnemy(state);
  if (!target) {
    return;
  }

  const dx = target.position.x - state.player.position.x;
  const dy = target.position.y - state.player.position.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  if (distance > state.player.weapon.range) {
    return;
  }

  state.projectiles.push({
    id: createEntityId(state, 'projectile'),
    owner: 'player',
    position: { ...state.player.position },
    velocity: {
      x: (dx / distance) * state.player.weapon.projectileSpeed,
      y: (dy / distance) * state.player.weapon.projectileSpeed,
    },
    body: { radius: 5 },
    damage: state.player.weapon.damage,
    pierceRemaining: state.player.weapon.pierce,
    lifeRemaining: 1.2,
    hitEnemyIds: new Set<string>(),
  });
  state.player.weapon.cooldownRemaining = state.player.weapon.attackInterval;
}

export function updateProjectiles(state: GameState, deltaSeconds: number): void {
  for (const projectile of state.projectiles) {
    projectile.position.x += projectile.velocity.x * deltaSeconds;
    projectile.position.y += projectile.velocity.y * deltaSeconds;
    projectile.lifeRemaining -= deltaSeconds;
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.lifeRemaining > 0);
}

function findNearestEnemy(state: GameState): Enemy | undefined {
  let best: Enemy | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const enemy of state.enemies) {
    const distance = Math.hypot(enemy.position.x - state.player.position.x, enemy.position.y - state.player.position.y);
    if (distance < bestDistance) {
      best = enemy;
      bestDistance = distance;
    }
  }
  return best;
}
```

- [ ] **Step 5: Add collisions and pickups**

Create `src/game/systems/CollisionSystem.ts`:

```ts
import { balance } from '../data/balance';
import type { Enemy } from '../entities/Enemy';
import type { Pickup } from '../entities/Pickup';
import type { Projectile } from '../entities/Projectile';
import type { GameState } from '../state/GameState';
import { createEntityId } from '../state/GameState';
import { addExperience } from './ExperienceSystem';

export function applyCollisions(state: GameState): void {
  applyProjectileEnemyCollisions(state);
  applyEnemyPlayerCollisions(state);
  applyPickupCollisions(state);
}

function applyProjectileEnemyCollisions(state: GameState): void {
  const deadEnemyIds = new Set<string>();

  for (const projectile of state.projectiles) {
    for (const enemy of state.enemies) {
      if (deadEnemyIds.has(enemy.id) || projectile.hitEnemyIds.has(enemy.id)) {
        continue;
      }
      if (!circlesOverlap(projectile, enemy)) {
        continue;
      }

      enemy.hp -= projectile.damage;
      projectile.hitEnemyIds.add(enemy.id);

      if (enemy.hp <= 0) {
        deadEnemyIds.add(enemy.id);
        createXpPickup(state, enemy);
        state.stats.kills += 1;
        state.stats.score += enemy.isElite ? 250 : 25;
        if (enemy.isElite) {
          state.stats.elitesDefeated += 1;
        }
      }

      if (projectile.pierceRemaining > 0) {
        projectile.pierceRemaining -= 1;
      } else {
        projectile.lifeRemaining = 0;
        break;
      }
    }
  }

  state.enemies = state.enemies.filter((enemy) => !deadEnemyIds.has(enemy.id));
  state.projectiles = state.projectiles.filter((projectile) => projectile.lifeRemaining > 0);
}

function applyEnemyPlayerCollisions(state: GameState): void {
  if (state.player.invincibleRemaining > 0) {
    return;
  }

  for (const enemy of state.enemies) {
    if (!circlesOverlap(state.player, enemy)) {
      continue;
    }

    state.player.hp = Math.max(0, state.player.hp - enemy.damage);
    state.player.invincibleRemaining = balance.player.contactInvincibility;
    if (state.player.hp === 0) {
      state.mode = 'gameOver';
    }
    return;
  }
}

function applyPickupCollisions(state: GameState): void {
  const collected = new Set<string>();
  for (const pickup of state.pickups) {
    const distance = Math.hypot(pickup.position.x - state.player.position.x, pickup.position.y - state.player.position.y);
    if (distance > state.player.pickupRadius + pickup.body.radius) {
      continue;
    }

    collected.add(pickup.id);
    if (pickup.kind === 'xp_crystal') {
      addExperience(state, pickup.value);
    }
    if (pickup.kind === 'health_pack') {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + pickup.value);
    }
  }

  state.pickups = state.pickups.filter((pickup) => !collected.has(pickup.id));
}

function createXpPickup(state: GameState, enemy: Enemy): void {
  const pickup: Pickup = {
    id: createEntityId(state, 'pickup'),
    kind: 'xp_crystal',
    position: { ...enemy.position },
    body: { radius: 8 },
    value: enemy.xpValue,
    magnetized: false,
    lifeRemaining: 120,
  };
  state.pickups.push(pickup);
}

function circlesOverlap(a: { position: { x: number; y: number }; body: { radius: number } }, b: { position: { x: number; y: number }; body: { radius: number } }): boolean {
  const distance = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
  return distance <= a.body.radius + b.body.radius;
}
```

- [ ] **Step 6: Verify simulation**

Run: `npm test -- --run src/game/__tests__/simulation.test.ts`

Expected: PASS.

Run: `npm test -- --run`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/systems src/game/__tests__/simulation.test.ts
git commit -m "systems: add movement combat and collisions"
```

---

### Task 5: Phaser Game Scene

**Files:**
- Create: `src/game/main.ts`
- Create: `src/game/scenes/BootScene.ts`
- Create: `src/game/scenes/GameScene.ts`
- Create: `src/game/events/GameEvents.ts`
- Modify: `src/app/App.vue`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing build check**

Run: `npm run build`

Expected: FAIL after importing `createPhaserGame` in `App.vue` because the game bootstrap does not exist yet.

- [ ] **Step 2: Add game event bridge**

Create `src/game/events/GameEvents.ts`:

```ts
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
```

- [ ] **Step 3: Add Phaser bootstrap and boot scene**

Create `src/game/main.ts`:

```ts
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#16202a',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, GameScene],
  });
}
```

Create `src/game/scenes/BootScene.ts`:

```ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
```

- [ ] **Step 4: Add thin Phaser scene**

Create `src/game/scenes/GameScene.ts`:

```ts
import Phaser from 'phaser';
import { gameEventNames, emitGameState, type SelectSkillDetail } from '../events/GameEvents';
import { createGameState, type GameState } from '../state/GameState';
import { updateCombat } from '../systems/CombatSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { updateMovement } from '../systems/MovementSystem';
import { updateSpawning } from '../systems/SpawnSystem';
import { updateStage } from '../systems/StageSystem';
import { unlockSkill } from '../systems/SkillSystem';

export class GameScene extends Phaser.Scene {
  private state: GameState = createGameState('initial');
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private playerRect!: Phaser.GameObjects.Rectangle;
  private enemyLayer!: Phaser.GameObjects.Group;
  private projectileLayer!: Phaser.GameObjects.Group;
  private pickupLayer!: Phaser.GameObjects.Group;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBounds(-1200, -800, 2400, 1600);
    this.physics.world.setBounds(-1200, -800, 2400, 1600);
    this.drawGround();

    this.playerRect = this.add.rectangle(0, 0, 28, 28, 0xf6c453);
    this.enemyLayer = this.add.group();
    this.projectileLayer = this.add.group();
    this.pickupLayer = this.add.group();
    this.cameras.main.startFollow(this.playerRect, true, 0.12, 0.12);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D,SPACE,ESC') as Record<string, Phaser.Input.Keyboard.Key>;

    window.addEventListener(gameEventNames.startRun, this.handleStartRun);
    window.addEventListener(gameEventNames.pauseRun, this.handlePauseRun);
    window.addEventListener(gameEventNames.resumeRun, this.handleResumeRun);
    window.addEventListener(gameEventNames.restartRun, this.handleStartRun);
    window.addEventListener(gameEventNames.selectSkill, this.handleSelectSkill as EventListener);
    emitGameState(this.state);
  }

  override update(_: number, deltaMs: number): void {
    this.readInput();

    if (this.state.mode === 'running') {
      const deltaSeconds = Math.min(0.05, deltaMs / 1000);
      this.state.time += deltaSeconds;
      this.state.stats.survivalTime = this.state.time;
      updateStage(this.state);
      updateMovement(this.state, deltaSeconds);
      updateSpawning(this.state);
      updateCombat(this.state, deltaSeconds);
      applyCollisions(this.state);
    }

    this.renderState();
    emitGameState(this.state);
  }

  override shutdown(): void {
    window.removeEventListener(gameEventNames.startRun, this.handleStartRun);
    window.removeEventListener(gameEventNames.pauseRun, this.handlePauseRun);
    window.removeEventListener(gameEventNames.resumeRun, this.handleResumeRun);
    window.removeEventListener(gameEventNames.restartRun, this.handleStartRun);
    window.removeEventListener(gameEventNames.selectSkill, this.handleSelectSkill as EventListener);
  }

  private handleStartRun = (): void => {
    this.state = createGameState(String(Date.now()));
    this.state.mode = 'running';
  };

  private handlePauseRun = (): void => {
    if (this.state.mode === 'running') {
      this.state.mode = 'paused';
    }
  };

  private handleResumeRun = (): void => {
    if (this.state.mode === 'paused') {
      this.state.mode = 'running';
    }
  };

  private handleSelectSkill = (event: CustomEvent<SelectSkillDetail>): void => {
    unlockSkill(this.state, event.detail.skillId);
  };

  private readInput(): void {
    const left = this.cursors.left?.isDown || this.wasd.A.isDown;
    const right = this.cursors.right?.isDown || this.wasd.D.isDown;
    const up = this.cursors.up?.isDown || this.wasd.W.isDown;
    const down = this.cursors.down?.isDown || this.wasd.S.isDown;
    this.state.input.moveX = Number(right) - Number(left);
    this.state.input.moveY = Number(down) - Number(up);
    this.state.input.dashPressed = Phaser.Input.Keyboard.JustDown(this.wasd.SPACE);
    if (Phaser.Input.Keyboard.JustDown(this.wasd.ESC)) {
      this.state.mode = this.state.mode === 'paused' ? 'running' : 'paused';
    }
  }

  private renderState(): void {
    this.playerRect.setPosition(this.state.player.position.x, this.state.player.position.y);
    this.playerRect.setAlpha(this.state.player.invincibleRemaining > 0 ? 0.55 : 1);
    this.renderGroup(this.enemyLayer, this.state.enemies, 0xe85d75, 24);
    this.renderGroup(this.projectileLayer, this.state.projectiles, 0xf6f1dc, 8);
    this.renderGroup(this.pickupLayer, this.state.pickups, 0x62d6f5, 10);
  }

  private renderGroup(group: Phaser.GameObjects.Group, items: Array<{ position: { x: number; y: number }; id: string }>, color: number, size: number): void {
    group.clear(true, true);
    for (const item of items) {
      group.add(this.add.rectangle(item.position.x, item.position.y, size, size, color));
    }
  }

  private drawGround(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1b2d2f, 1);
    graphics.fillRect(-1200, -800, 2400, 1600);
    graphics.lineStyle(1, 0x2d4544, 0.45);
    for (let x = -1200; x <= 1200; x += 64) {
      graphics.lineBetween(x, -800, x, 800);
    }
    for (let y = -800; y <= 800; y += 64) {
      graphics.lineBetween(-1200, y, 1200, y);
    }
  }
}
```

- [ ] **Step 5: Mount Phaser from Vue**

Modify `src/app/App.vue`:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createPhaserGame } from '../game/main';
import { emitSimpleGameEvent } from '../game/events/GameEvents';

const gameHost = ref<HTMLElement | null>(null);
let game: Phaser.Game | null = null;

onMounted(() => {
  if (gameHost.value) {
    game = createPhaserGame(gameHost.value);
  }
});

onBeforeUnmount(() => {
  game?.destroy(true);
});
</script>

<template>
  <main class="app-shell">
    <section class="game-root">
      <div ref="gameHost" class="phaser-host" />
      <button type="button" class="floating-start" @click="emitSimpleGameEvent('startRun')">Start Run</button>
    </section>
  </main>
</template>
```

Modify `src/styles.css` by adding:

```css
.phaser-host {
  position: absolute;
  inset: 0;
}

.phaser-host canvas {
  display: block;
}

.floating-start {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 5;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: #f6c453;
  color: #1d1a14;
  cursor: pointer;
}
```

- [ ] **Step 6: Verify render build**

Run: `npm run build`

Expected: PASS.

Run: `npm run dev`

Expected: dev server starts. Open the shown URL and verify a playable rectangle moves with WASD or arrow keys and fires at spawned enemies after Start Run.

- [ ] **Step 7: Commit**

```bash
git add src/game/main.ts src/game/scenes src/game/events src/app/App.vue src/styles.css
git commit -m "render: add phaser game scene"
```

---

### Task 6: Vue HUD, Menus, Skill Tree, and Game Over

**Files:**
- Create: `src/ui/MainMenu.vue`
- Create: `src/ui/Hud.vue`
- Create: `src/ui/SkillTree.vue`
- Create: `src/ui/PauseMenu.vue`
- Create: `src/ui/GameOverPanel.vue`
- Modify: `src/app/App.vue`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing UI build**

Modify `src/app/App.vue` to import the UI components listed above before they exist.

Run: `npm run build`

Expected: FAIL with missing Vue component imports.

- [ ] **Step 2: Create main menu and HUD**

Create `src/ui/MainMenu.vue`:

```vue
<script setup lang="ts">
import { emitSimpleGameEvent } from '../game/events/GameEvents';
</script>

<template>
  <section class="overlay-panel main-menu">
    <h1>Pixel Absurd Survivor</h1>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('startRun')">Start Run</button>
  </section>
</template>
```

Create `src/ui/Hud.vue`:

```vue
<script setup lang="ts">
import type { GameState } from '../game/state/GameState';

defineProps<{ state: GameState }>();

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}
</script>

<template>
  <section class="hud">
    <div class="hud-left">
      <div class="bar-label">HP {{ Math.ceil(state.player.hp) }} / {{ state.player.maxHp }}</div>
      <div class="meter"><span :style="{ width: `${(state.player.hp / state.player.maxHp) * 100}%` }" /></div>
      <div class="bar-label">Level {{ state.player.level }}</div>
      <div class="meter xp"><span :style="{ width: `${(state.player.xp / state.player.nextLevelXp) * 100}%` }" /></div>
    </div>
    <div class="hud-right">
      <strong>{{ formatTime(state.time) }}</strong>
      <span>Kills {{ state.stats.kills }}</span>
      <span>{{ state.stageId }}</span>
    </div>
    <div class="dash-readout">Dash {{ state.player.dashCooldownRemaining <= 0 ? 'Ready' : state.player.dashCooldownRemaining.toFixed(1) }}</div>
  </section>
</template>
```

- [ ] **Step 3: Create skill, pause, and game over overlays**

Create `src/ui/SkillTree.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { SKILL_TREE } from '../game/data/skills';
import { emitSkillSelection } from '../game/events/GameEvents';
import type { GameState } from '../game/state/GameState';
import { canUnlockSkill } from '../game/systems/SkillSystem';

const props = defineProps<{ state: GameState }>();

const branches = computed(() => {
  return ['office', 'kitchen', 'magnet', 'clone'].map((branch) => ({
    branch,
    skills: SKILL_TREE.filter((skill) => skill.branch === branch),
  }));
});
</script>

<template>
  <section class="overlay-panel skill-tree">
    <header>
      <h2>Choose a Skill</h2>
      <span>{{ state.player.skillPoints }} point available</span>
    </header>
    <div class="skill-branches">
      <article v-for="branch in branches" :key="branch.branch" class="skill-branch">
        <h3>{{ branch.branch }}</h3>
        <button
          v-for="skill in branch.skills"
          :key="skill.id"
          type="button"
          class="skill-node"
          :class="{ unlocked: state.unlockedSkillIds.has(skill.id) }"
          :disabled="!canUnlockSkill(state, skill)"
          @click="emitSkillSelection(skill.id)"
        >
          <strong>{{ skill.name }}</strong>
          <span>{{ skill.description }}</span>
        </button>
      </article>
    </div>
  </section>
</template>
```

Create `src/ui/PauseMenu.vue`:

```vue
<script setup lang="ts">
import { emitSimpleGameEvent } from '../game/events/GameEvents';
</script>

<template>
  <section class="overlay-panel pause-menu">
    <h2>Paused</h2>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('resumeRun')">Resume</button>
    <button type="button" class="secondary-action" @click="emitSimpleGameEvent('restartRun')">Restart</button>
  </section>
</template>
```

Create `src/ui/GameOverPanel.vue`:

```vue
<script setup lang="ts">
import type { GameState } from '../game/state/GameState';
import { emitSimpleGameEvent } from '../game/events/GameEvents';

defineProps<{ state: GameState; bestScore: number }>();
</script>

<template>
  <section class="overlay-panel game-over">
    <h2>Run Over</h2>
    <dl>
      <div><dt>Time</dt><dd>{{ Math.floor(state.stats.survivalTime) }}s</dd></div>
      <div><dt>Kills</dt><dd>{{ state.stats.kills }}</dd></div>
      <div><dt>Level</dt><dd>{{ state.stats.highestLevel }}</dd></div>
      <div><dt>Elites</dt><dd>{{ state.stats.elitesDefeated }}</dd></div>
      <div><dt>Bosses</dt><dd>{{ state.stats.bossesDefeated }}</dd></div>
      <div><dt>Branch</dt><dd>{{ state.stats.mainSkillBranch }}</dd></div>
      <div><dt>Score</dt><dd>{{ state.stats.score }}</dd></div>
      <div><dt>Best</dt><dd>{{ bestScore }}</dd></div>
    </dl>
    <button type="button" class="primary-action" @click="emitSimpleGameEvent('restartRun')">Restart</button>
  </section>
</template>
```

- [ ] **Step 4: Wire app state listener**

Modify `src/app/App.vue`:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gameEventNames, type GameStateUpdatedDetail } from '../game/events/GameEvents';
import { createPhaserGame } from '../game/main';
import type { GameState } from '../game/state/GameState';
import GameOverPanel from '../ui/GameOverPanel.vue';
import Hud from '../ui/Hud.vue';
import MainMenu from '../ui/MainMenu.vue';
import PauseMenu from '../ui/PauseMenu.vue';
import SkillTree from '../ui/SkillTree.vue';

const gameHost = ref<HTMLElement | null>(null);
const state = ref<GameState | null>(null);
const bestScore = ref(0);
let game: Phaser.Game | null = null;

function handleStateUpdate(event: CustomEvent<GameStateUpdatedDetail>): void {
  state.value = event.detail.state;
}

onMounted(() => {
  bestScore.value = Number(localStorage.getItem('pas-best-score') ?? 0);
  window.addEventListener(gameEventNames.stateUpdated, handleStateUpdate as EventListener);
  if (gameHost.value) {
    game = createPhaserGame(gameHost.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener(gameEventNames.stateUpdated, handleStateUpdate as EventListener);
  game?.destroy(true);
});
</script>

<template>
  <main class="app-shell">
    <section class="game-root">
      <div ref="gameHost" class="phaser-host" />
      <Hud v-if="state && state.mode !== 'menu'" :state="state" />
      <MainMenu v-if="!state || state.mode === 'menu'" />
      <SkillTree v-if="state?.mode === 'levelUp'" :state="state" />
      <PauseMenu v-if="state?.mode === 'paused'" />
      <GameOverPanel v-if="state?.mode === 'gameOver'" :state="state" :best-score="bestScore" />
    </section>
  </main>
</template>
```

- [ ] **Step 5: Add overlay styles**

Append to `src/styles.css`:

```css
.overlay-panel {
  position: absolute;
  z-index: 10;
  inset: 50%;
  transform: translate(-50%, -50%);
  width: min(920px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  overflow: auto;
  padding: 20px;
  border: 2px solid #4f5a6f;
  border-radius: 8px;
  background: rgba(20, 25, 35, 0.94);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35);
}

.main-menu,
.pause-menu,
.game-over {
  display: grid;
  gap: 16px;
  justify-items: start;
}

.hud {
  position: absolute;
  z-index: 6;
  inset: 12px;
  pointer-events: none;
  display: grid;
  grid-template-columns: 250px 1fr 180px;
  align-items: start;
  gap: 16px;
}

.hud-left,
.hud-right,
.dash-readout {
  padding: 10px;
  border: 1px solid rgba(246, 241, 220, 0.25);
  border-radius: 6px;
  background: rgba(17, 21, 31, 0.75);
}

.hud-right {
  justify-self: end;
  display: grid;
  gap: 4px;
  text-align: right;
}

.dash-readout {
  justify-self: end;
}

.bar-label {
  font-size: 13px;
  margin-bottom: 4px;
}

.meter {
  height: 10px;
  margin-bottom: 8px;
  background: #3a4158;
  border-radius: 5px;
  overflow: hidden;
}

.meter span {
  display: block;
  height: 100%;
  background: #e85d75;
}

.meter.xp span {
  background: #62d6f5;
}

.skill-tree header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.skill-branches {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.skill-branch {
  display: grid;
  gap: 8px;
}

.skill-node {
  min-height: 82px;
  padding: 10px;
  border: 1px solid #4f5a6f;
  border-radius: 6px;
  background: #222a38;
  color: #f6f1dc;
  text-align: left;
  cursor: pointer;
}

.skill-node:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.skill-node.unlocked {
  border-color: #62d6f5;
  background: #183642;
}

.skill-node span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.35;
}

.secondary-action {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #7b8498;
  border-radius: 6px;
  background: transparent;
  color: #f6f1dc;
  cursor: pointer;
}

.game-over dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.game-over div {
  padding: 10px;
  border: 1px solid rgba(246, 241, 220, 0.18);
  border-radius: 6px;
}

.game-over dt {
  font-size: 12px;
  color: #b8c0d6;
}

.game-over dd {
  margin: 4px 0 0;
  font-weight: 700;
}
```

- [ ] **Step 6: Verify UI**

Run: `npm run build`

Expected: PASS.

Run: `npm run dev`

Expected: main menu overlays the Phaser canvas; HUD appears during a run; level-up opens the skill tree; Esc opens pause; game over opens the run summary.

- [ ] **Step 7: Commit**

```bash
git add src/app/App.vue src/ui src/styles.css
git commit -m "ui: add run overlays"
```

---

### Task 7: Elites, Bosses, and High Score

**Files:**
- Create: `src/game/systems/BossSystem.ts`
- Create: `src/game/storage/highScore.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Modify: `src/game/systems/CollisionSystem.ts`
- Create: `src/game/__tests__/bosses.test.ts`

- [ ] **Step 1: Write failing boss tests**

Create `src/game/__tests__/bosses.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { spawnTimedEncounters, updateBosses } from '../systems/BossSystem';

describe('boss and elite timing', () => {
  it('spawns the first elite at three minutes', () => {
    const state = createGameState('elite');
    state.mode = 'running';
    state.time = 180;

    spawnTimedEncounters(state);

    expect(state.enemies.some((enemy) => enemy.isElite)).toBe(true);
  });

  it('spawns the first boss at six minutes', () => {
    const state = createGameState('boss');
    state.mode = 'running';
    state.time = 360;

    spawnTimedEncounters(state);

    expect(state.bosses[0].kind).toBe('printer_boss');
  });

  it('creates a boss warning before damage resolves', () => {
    const state = createGameState('warning');
    state.mode = 'running';
    state.time = 360;
    spawnTimedEncounters(state);

    updateBosses(state, 10);

    expect(state.bosses[0].activeWarning).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- --run src/game/__tests__/bosses.test.ts`

Expected: FAIL with missing `BossSystem`.

- [ ] **Step 3: Add boss system**

Create `src/game/systems/BossSystem.ts`:

```ts
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
```

- [ ] **Step 4: Add boss collision scoring and high score storage**

Create `src/game/storage/highScore.ts`:

```ts
const key = 'pas-best-score';

export function getBestScore(): number {
  return Number(localStorage.getItem(key) ?? 0);
}

export function saveBestScore(score: number): number {
  const best = Math.max(getBestScore(), score);
  localStorage.setItem(key, String(best));
  return best;
}
```

Modify `src/game/systems/CollisionSystem.ts` in `applyProjectileEnemyCollisions` after enemy collision handling:

```ts
  for (const projectile of state.projectiles) {
    if (projectile.owner !== 'player' || projectile.lifeRemaining <= 0) {
      continue;
    }

    for (const boss of state.bosses) {
      if (!circlesOverlap(projectile, boss)) {
        continue;
      }
      boss.hp -= projectile.damage;
      projectile.lifeRemaining = 0;
      if (boss.hp <= 0) {
        state.stats.bossesDefeated += 1;
        state.stats.score += 1000;
      }
      break;
    }
  }

  state.bosses = state.bosses.filter((boss) => boss.hp > 0);
```

- [ ] **Step 5: Wire boss system and warning render into GameScene**

Modify `src/game/scenes/GameScene.ts`:

```ts
import { spawnTimedEncounters, updateBosses } from '../systems/BossSystem';
```

Add a group property:

```ts
  private warningLayer!: Phaser.GameObjects.Group;
  private bossLayer!: Phaser.GameObjects.Group;
```

Initialize groups in `create()`:

```ts
    this.warningLayer = this.add.group();
    this.bossLayer = this.add.group();
```

Call boss systems in `update()` after `updateStage(this.state);`:

```ts
      spawnTimedEncounters(this.state);
      updateBosses(this.state, deltaSeconds);
```

Render bosses and warnings in `renderState()`:

```ts
    this.renderGroup(this.bossLayer, this.state.bosses, 0xf08a4b, 58);
    this.warningLayer.clear(true, true);
    for (const boss of this.state.bosses) {
      if (!boss.activeWarning) {
        continue;
      }
      const warning = boss.activeWarning;
      const circle = this.add.circle(warning.position.x, warning.position.y, warning.radius, 0xe85d75, 0.22);
      circle.setStrokeStyle(3, 0xf6f1dc, 0.7);
      this.warningLayer.add(circle);
    }
```

- [ ] **Step 6: Verify bosses and storage**

Run: `npm test -- --run src/game/__tests__/bosses.test.ts`

Expected: PASS.

Run: `npm test -- --run`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/systems/BossSystem.ts src/game/storage src/game/scenes/GameScene.ts src/game/systems/CollisionSystem.ts src/game/__tests__/bosses.test.ts
git commit -m "boss: add timed elite and boss encounters"
```

---

### Task 8: Integration Flow and Manual Verification

**Files:**
- Create: `src/game/__tests__/runFlow.test.ts`
- Modify: `src/game/scenes/GameScene.ts`
- Modify: `src/app/App.vue`
- Modify: `README.md`

- [ ] **Step 1: Write full run-flow integration test**

Create `src/game/__tests__/runFlow.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createGameState } from '../state/GameState';
import { spawnTimedEncounters, updateBosses } from '../systems/BossSystem';
import { fireAutoAttack, updateProjectiles } from '../systems/CombatSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { addExperience } from '../systems/ExperienceSystem';
import { updateMovement } from '../systems/MovementSystem';
import { spawnEnemy } from '../systems/SpawnSystem';
import { updateStage } from '../systems/StageSystem';
import { unlockSkill } from '../systems/SkillSystem';

describe('core run flow', () => {
  it('covers start, spawn, XP, level-up, skill pick, elite, boss, and death', () => {
    const state = createGameState('flow');
    state.mode = 'running';
    state.input.moveX = 1;
    updateMovement(state, 0.016);

    spawnEnemy(state, 'slow_mob', { x: 80, y: 0 });
    fireAutoAttack(state);
    state.projectiles[0].position = { x: 80, y: 0 };
    state.projectiles[0].damage = 999;
    applyCollisions(state);
    expect(state.stats.kills).toBe(1);

    addExperience(state, 10);
    expect(state.mode).toBe('levelUp');
    unlockSkill(state, 'office_paperclip');
    expect(state.mode).toBe('running');

    state.time = 180;
    updateStage(state);
    spawnTimedEncounters(state);
    expect(state.enemies.some((enemy) => enemy.isElite)).toBe(true);

    state.time = 360;
    spawnTimedEncounters(state);
    updateBosses(state, 10);
    expect(state.bosses.length).toBeGreaterThan(0);

    state.player.hp = 1;
    state.enemies[0].position = { ...state.player.position };
    state.player.invincibleRemaining = 0;
    applyCollisions(state);
    expect(state.mode).toBe('gameOver');

    updateProjectiles(state, 0.016);
  });
});
```

- [ ] **Step 2: Run integration test**

Run: `npm test -- --run src/game/__tests__/runFlow.test.ts`

Expected: PASS.

- [ ] **Step 3: Persist high score on game over**

Modify `src/app/App.vue` imports:

```ts
import { getBestScore, saveBestScore } from '../game/storage/highScore';
```

Modify `handleStateUpdate`:

```ts
function handleStateUpdate(event: CustomEvent<GameStateUpdatedDetail>): void {
  state.value = event.detail.state;
  if (event.detail.state.mode === 'gameOver') {
    bestScore.value = saveBestScore(event.detail.state.stats.score);
  }
}
```

Modify `onMounted`:

```ts
  bestScore.value = getBestScore();
```

- [ ] **Step 4: Add README verification notes**

Append to `README.md`:

````md
## Verification

Run the automated checks:

```bash
npm test -- --run
npm run build
```

Manual MVP check:

- Start a run from the main menu.
- Move with WASD or arrow keys.
- Dash with Space and verify the dash cooldown readout changes.
- Let enemies spawn and verify auto-attacks create XP pickups.
- Collect XP until level-up pauses the game and opens the skill tree.
- Pick a skill and verify the run resumes.
- Use Esc to pause and resume.
- Advance or temporarily set time during development to verify the 3-minute elite and 6-minute boss events.
- Take lethal damage and verify the game-over panel shows time, kills, level, branch, score, and best score.
````

- [ ] **Step 5: Run all automated checks**

Run: `npm test -- --run`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Manual browser verification**

Run: `npm run dev`

Expected: Vite prints a local URL.

Open the URL and verify:

- Main menu starts a run.
- Player movement is direct.
- Dash gives a visible brief alpha change.
- Enemies spawn from off-screen areas.
- Projectiles target nearest enemies.
- XP pickups collect into the level bar.
- Skill tree opens on level-up and resumes after skill selection.
- 3-minute and 6-minute timed encounters appear.
- Death opens the score panel and stores best score in localStorage.

- [ ] **Step 7: Commit**

```bash
git add src/game/__tests__/runFlow.test.ts src/app/App.vue README.md
git commit -m "test: cover core run flow"
```

---

## Self-Review

Spec coverage:

- Main menu, movement, dash, auto-attack, enemies, XP, level-up, skill tree, stages, elites, bosses, HUD, game over, and local high score are covered by Tasks 1-8.
- Data-driven skills, enemies, bosses, stages, and balance are covered by Task 3.
- Vue/Phaser/simulation separation is covered by Tasks 2, 4, 5, and 6.
- Seedable RNG and stable entity IDs are covered by Task 2.
- Pure logic tests and a run-flow integration test are covered by Tasks 2, 3, 4, 7, and 8.
- Pixel-art production, audio assets, polished animations, online leaderboard, account system, multiplayer, multiple maps, equipment, ammo, and permanent meta-progression are outside this MVP plan.

Placeholder scan:

- The plan contains no forbidden placeholder markers and no unfilled task.
- Every code-writing step includes concrete file paths and code.

Type consistency:

- `GameState`, entity interfaces, config IDs, and system signatures are introduced before later tasks use them.
- Skill IDs used in tests match IDs defined in `SKILL_TREE`.
- Boss and enemy IDs used in tests match `BOSSES` and `ENEMIES`.
