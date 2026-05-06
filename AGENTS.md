# AGENTS.md — Coding Conventions for Pixel Absurd Survivor

This file tells AI coding agents how to work on this project. Follow these rules in all generated or edited code.

## Architecture

- **Game simulation is decoupled from Vue**. Game logic lives in `src/game/systems/` and `src/game/entities/`. Vue only reads state and emits user-choice events (pick skill, pause, restart).
- **Phaser 3 is the rendering and game-loop engine**. Vue handles overlay UI (HUD, skill tree panel, menus, game-over screen). Phaser scenes run the game world.
- **Data-driven design**. Skills, enemies, bosses, and stage schedules are config tables in `src/game/data/`. Adding content should mostly mean editing data files, not core logic.

## Code Style

- TypeScript everywhere. No plain JS files.
- Use `interface` for data shapes, `type` for unions/aliases.
- Prefer composition over inheritance for game entities. Entities are data objects; systems operate on them.
- No global mutable state. GameState is a single managed object passed through systems.
- Keep Phaser scenes thin — delegate behavior to systems.

## Module Boundaries

| Layer         | Owns                                  | Talks to              |
|--------------|---------------------------------------|-----------------------|
| Vue UI       | HUD, skill tree panel, menus, overlay | GameState (read-only), emits events |
| Phaser scenes| Camera, rendering, input mapping      | Systems, GameState    |
| Systems      | Movement, combat, spawn, skill, XP, collision, stage, boss | Entities, GameState   |
| Entities     | Player, Enemy, Projectile, Pickup, Boss data | — (passive data) |
| Data configs | Skill nodes, enemy defs, boss defs, stage schedule, balance params | Systems (read-only)  |
| State        | GameState, RunStats                   | Everyone (read), Systems (write) |

Cross-layer calls go downward only. Vue never calls Phaser APIs; Phaser never calls Vue component methods. They communicate through shared state and events.

## Naming Conventions

- Files: PascalCase for classes/types (`MovementSystem.ts`, `Player.ts`), camelCase for data/config (`skills.ts`, `enemies.ts`).
- Classes: PascalCase (`MovementSystem`, `Player`).
- Functions/methods: camelCase (`applySkillEffect`, `spawnElite`).
- Constants/config: camelCase in data files, UPPER_SNAKE only for true compile-time constants.
- Entity IDs: string keys like `"office_paperclip"` or `"enemy_fast_mob"`.

## Data Config Pattern

All gameplay content lives in typed config objects in `src/game/data/`:

```typescript
// skills.ts
export interface SkillNode {
  id: string;
  name: string;
  branch: 'office' | 'kitchen' | 'magnet' | 'clone';
  tier: number;
  prerequisites: string[];
  effects: SkillEffect[];
  description: string;
}

export const SKILL_TREE: SkillNode[] = [ ... ];
```

Same pattern for enemies, bosses, stages, and balance tuning. Systems reference these by ID and never hardcode behavior.

## Game Balance

- All numeric tuning (HP, damage, XP curves, spawn rates, cooldowns) lives in `src/game/data/balance.ts`.
- First-pass values are starting points, not final. Test, then adjust the config.
- Balance changes should not require touching game logic code.

## RNG and Determinism

- Wrap random number generation behind a `RNG` utility with a seedable interface.
- All gameplay randomness (spawn position, elite timing, boss skill choice) goes through this RNG.
- This preserves the option for future multiplayer seed sync without refactoring.

## Multiplayer Prep (v1 boundary)

First version is single-player only, but code must not block future multiplayer:

- Every entity gets a stable numeric or string ID.
- Input handling is separate from simulation.
- No hidden shared-mutable globals.
- RNG is seedable and injectable.
- Server-authoritative simulation could later replace the local game loop with minimal rework.

## Testing

- Unit tests focus on pure logic: XP curves, skill prerequisite checks, damage + invincibility rules, spawn weight selection, stage timing.
- Integration tests cover one full run: start → spawn → XP → level up → skill pick → elite → boss → death.
- No tests for rendering or UI layout — those are validated by hand.
- Use Vitest (Vite-native test runner).

## Commits and Branches

- Commits should reference the system or feature they touch (e.g., `combat: add piercing projectile logic`, `data: tune fast mob HP`).
- Keep commits small and focused. One system change per commit when practical.
- Don't commit balance tuning numbers alongside logic changes — keep them separate for easy rollback.

## What Not To Do

- Don't put game logic in Vue components.
- Don't hardcode enemy/skill/boss behavior in system files — use data configs.
- Don't add ammo, hunger, equipment durability, or meta-progression systems (explicitly out of v1 scope).
- Don't add multiplayer networking code in v1.
- Don't over-engineer abstractions for hypothetical future features. Three similar lines beat a premature abstraction.
- Don't write long docstrings or paragraph comments. One short line max if the WHY is non-obvious.