# Pixel Absurd Survivor

A web-based top-down pixel-art auto-shooter survival game. You control an absurd little character, move and dash across an open map while your weapon fires automatically at endless waves of monsters. Level up, unlock nodes on an in-session skill tree, and build a combat style that gets tested by escalating elite monsters and bosses.

## Core Experience

- **Auto-attack survival** — low barrier to entry, like Vampire Survivors
- **Absurd, lighthearted, satisfying** — office supplies, kitchen gear, magnets, clones as weapon themes
- **Active skill tree** — pause on level-up, pick nodes, plan your build each run
- **Stage-based endless** — difficulty ramps over time, not through traditional level clears
- **Dash as your lifeline** — short quick displacement with invincibility frames, upgradeable via skill tree

## Tech Stack

- **Frontend**: Vue 3 + TypeScript
- **Build**: Vite
- **Rendering**: Phaser 3 (handles game loop, input, collision, camera, asset loading)
- **State/UI**: Vue components for menus, HUD, skill tree, game-over panel
- **Game simulation**: standalone TypeScript modules, decoupled from Vue

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  app/
    App.vue
    router.ts
  game/
    main.ts
    scenes/
      BootScene.ts
      GameScene.ts
      UIScene.ts
    systems/
      MovementSystem.ts
      CombatSystem.ts
      SpawnSystem.ts
      SkillSystem.ts
      ExperienceSystem.ts
      BossSystem.ts
      CollisionSystem.ts
      StageSystem.ts
    entities/
      Player.ts
      Enemy.ts
      Projectile.ts
      Pickup.ts
      Boss.ts
    data/
      skills.ts
      enemies.ts
      bosses.ts
      stages.ts
      balance.ts
    state/
      GameState.ts
      RunStats.ts
  ui/
    Hud.vue
    SkillTree.vue
    PauseMenu.vue
    GameOverPanel.vue
```

## Game Loop

```
Move & dodge → Auto-attack kills monsters → XP drops → Level up →
Open skill tree, pick a node → Change your fire/defense/movement →
Stronger enemies, elites, bosses spawn → Build gets tested →
Death → Score screen
```

## Controls

| Key     | Action       |
|---------|-------------|
| WASD    | Move         |
| Space   | Dash         |
| Mouse   | Menus, skill tree |
| Esc     | Pause        |

## Skill Tree Branches

| Branch          | Theme          | Role                              |
|----------------|---------------|-----------------------------------|
| Office Supplies | Paper clips, staplers, shredders | Tracking, multi-target, stun |
| Kitchen         | Frying pans, chili sauce, microwaves | AoE, burn, crowd control |
| Magnet          | Magnetic pull, XP attract        | Pickup, control, reposition |
| Clone           | Temporary copies, decoys         | Extra firepower, substitute defense |

Each branch has 6–8 nodes. You can typically complete one main line and dabble in one side line per run. Ultimate skills require at least 5 points in that branch.

## Enemy Types

- **Slow mob**: low HP, slow, many — baseline pressure
- **Fast mob**: very low HP, fast, moderate count — disrupts movement
- **Tank mob**: high HP, slow, few — absorbs auto-attack fire

**Elites**: Charge elite (directional dash with warning line) and Projectile elite (slow projectiles / ground circles with 0.6–1s warning).

**Bosses** (v1): The Printer (paper barrage, summons, slowdown zones) and The Microwave (ring heat waves, popcorn explosions, charged shockwave).

## Stage Progression

| Time   | Event                           |
|--------|--------------------------------|
| 0–3min | Easy start, only basic mobs    |
| 3min   | First elite event              |
| 6min   | First boss                     |
| 6+min  | Elite every 3min, boss every 6min |
| 10+min | Increased density & combos     |
| 15+min | High-pressure endless loop     |

## MVP Scope (v1)

**In**: Main menu, movement, auto-attack, dash, XP/leveling, skill tree (4 branches), 3 mob types, 2 elite types, 2 bosses, stage system, HUD, death screen, local high score.

**Out**: Multiplayer, permanent meta-progression, multiple maps, equipment, ammo system, story, online leaderboard, accounts.

## Full Design Document

See [docs/superpowers/specs/2026-05-06-pixel-survivor-game-design.md](docs/superpowers/specs/2026-05-06-pixel-survivor-game-design.md) for the complete design spec (Chinese).