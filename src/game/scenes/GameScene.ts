import Phaser from 'phaser';
import { emitGameState, gameEventNames, type SelectSkillDetail } from '../events/GameEvents';
import { createGameState, type GameState } from '../state/GameState';
import { spawnTimedEncounters, updateBosses } from '../systems/BossSystem';
import { updateClones } from '../systems/CloneSystem';
import { updateCombat } from '../systems/CombatSystem';
import { applyCollisions } from '../systems/CollisionSystem';
import { updateMovement } from '../systems/MovementSystem';
import { updateSpawning } from '../systems/SpawnSystem';
import { updateSkillEffects } from '../systems/SkillEffectSystem';
import { updateStage } from '../systems/StageSystem';
import { unlockSkill } from '../systems/SkillSystem';
import { updateVisualEffects } from '../systems/VisualEffectSystem';

export class GameScene extends Phaser.Scene {
  private state: GameState = createGameState('initial');
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private playerRect!: Phaser.GameObjects.Rectangle;
  private enemyLayer!: Phaser.GameObjects.Group;
  private projectileLayer!: Phaser.GameObjects.Group;
  private pickupLayer!: Phaser.GameObjects.Group;
  private warningLayer!: Phaser.GameObjects.Group;
  private bossLayer!: Phaser.GameObjects.Group;
  private cloneLayer!: Phaser.GameObjects.Group;
  private visualEffectLayer!: Phaser.GameObjects.Group;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBounds(-1200, -800, 2400, 1600);
    this.drawGround();

    this.playerRect = this.add.rectangle(0, 0, 28, 28, 0xf6c453);
    this.enemyLayer = this.add.group();
    this.projectileLayer = this.add.group();
    this.pickupLayer = this.add.group();
    this.warningLayer = this.add.group();
    this.bossLayer = this.add.group();
    this.cloneLayer = this.add.group();
    this.visualEffectLayer = this.add.group();
    this.cameras.main.startFollow(this.playerRect, true, 0.12, 0.12);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D,SPACE,ESC') as Record<string, Phaser.Input.Keyboard.Key>;

    window.addEventListener(gameEventNames.startRun, this.handleStartRun);
    window.addEventListener(gameEventNames.pauseRun, this.handlePauseRun);
    window.addEventListener(gameEventNames.resumeRun, this.handleResumeRun);
    window.addEventListener(gameEventNames.restartRun, this.handleStartRun);
    window.addEventListener(gameEventNames.selectSkill, this.handleSelectSkill as EventListener);
    window.addEventListener('keydown', this.handleWindowKeyDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeWindowListeners, this);
    emitGameState(this.state);
  }

  override update(_: number, deltaMs: number): void {
    this.readInput();

    if (this.state.mode === 'running') {
      const deltaSeconds = Math.min(0.05, deltaMs / 1000);
      this.state.time += deltaSeconds;
      this.state.stats.survivalTime = this.state.time;
      updateStage(this.state);
      spawnTimedEncounters(this.state);
      updateBosses(this.state, deltaSeconds);
      updateMovement(this.state, deltaSeconds);
      updateSpawning(this.state);
      updateClones(this.state, deltaSeconds);
      updateSkillEffects(this.state, deltaSeconds);
      updateCombat(this.state, deltaSeconds);
      applyCollisions(this.state);
      updateVisualEffects(this.state, deltaSeconds);
    }

    this.renderState();
    emitGameState(this.state);
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

  private handleWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') {
      return;
    }
    if (this.state.mode === 'running') {
      this.state.mode = 'paused';
    } else if (this.state.mode === 'paused') {
      this.state.mode = 'running';
    }
  };

  private removeWindowListeners(): void {
    window.removeEventListener(gameEventNames.startRun, this.handleStartRun);
    window.removeEventListener(gameEventNames.pauseRun, this.handlePauseRun);
    window.removeEventListener(gameEventNames.resumeRun, this.handleResumeRun);
    window.removeEventListener(gameEventNames.restartRun, this.handleStartRun);
    window.removeEventListener(gameEventNames.selectSkill, this.handleSelectSkill as EventListener);
    window.removeEventListener('keydown', this.handleWindowKeyDown);
  }

  private readInput(): void {
    const left = this.cursors.left?.isDown || this.wasd.A.isDown;
    const right = this.cursors.right?.isDown || this.wasd.D.isDown;
    const up = this.cursors.up?.isDown || this.wasd.W.isDown;
    const down = this.cursors.down?.isDown || this.wasd.S.isDown;
    this.state.input.moveX = Number(right) - Number(left);
    this.state.input.moveY = Number(down) - Number(up);
    this.state.input.dashPressed = Phaser.Input.Keyboard.JustDown(this.wasd.SPACE);
  }

  private renderState(): void {
    this.playerRect.setPosition(this.state.player.position.x, this.state.player.position.y);
    this.playerRect.setAlpha(this.state.player.invincibleRemaining > 0 ? 0.55 : 1);
    this.renderEnemies();
    this.renderBosses();
    this.renderGroup(this.cloneLayer, this.state.clones, 0x74f2ce, 22);
    this.renderProjectiles();
    this.renderGroup(this.pickupLayer, this.state.pickups, 0x62d6f5, 10);
    this.renderVisualEffects();
    this.renderSkillAreas();
    this.warningLayer.clear(true, true);
    for (const boss of this.state.bosses) {
      if (!boss.activeWarning) {
        continue;
      }
      const warning = boss.activeWarning;
      if (warning.kind === 'line') {
        const line = this.add.line(0, 0, boss.position.x, boss.position.y, warning.position.x, warning.position.y, 0xe85d75, 0.55);
        line.setLineWidth(Math.max(10, warning.width));
        this.warningLayer.add(line);
      } else {
        const circle = this.add.circle(warning.position.x, warning.position.y, warning.radius, 0xe85d75, 0.22);
        circle.setStrokeStyle(3, 0xf6f1dc, 0.7);
        this.warningLayer.add(circle);
      }
    }
  }

  private renderGroup(group: Phaser.GameObjects.Group, items: Array<{ position: { x: number; y: number }; id: string }>, color: number, size: number): void {
    group.clear(true, true);
    for (const item of items) {
      group.add(this.add.rectangle(item.position.x, item.position.y, size, size, color));
    }
  }

  private renderEnemies(): void {
    this.enemyLayer.clear(true, true);
    for (const enemy of this.state.enemies) {
      const color = enemy.kind === 'black_elite' ? 0x050505 : enemy.isElite ? 0x5b1b1b : 0xe85d75;
      const size = enemy.kind === 'black_elite' ? 26 : enemy.isElite ? 30 : 24;
      const rect = this.add.rectangle(enemy.position.x, enemy.position.y, size, size, color);
      if (enemy.kind === 'black_elite') {
        rect.setStrokeStyle(2, 0xf6f1dc, 0.8);
      }
      this.enemyLayer.add(rect);
    }
  }

  private renderBosses(): void {
    this.bossLayer.clear(true, true);
    for (const boss of this.state.bosses) {
      const color = boss.kind === 'chef_boss' ? 0xd94f24 : boss.kind === 'clown_boss' ? 0xf6f1dc : 0xf08a4b;
      const size = boss.kind === 'chef_boss' ? 72 : boss.kind === 'clown_boss' ? 62 : 58;
      this.bossLayer.add(this.add.rectangle(boss.position.x, boss.position.y, size, size, color));
    }
  }

  private renderProjectiles(): void {
    this.projectileLayer.clear(true, true);
    for (const projectile of this.state.projectiles) {
      const color = projectile.owner === 'boss' ? 0xff4fd8 : 0xf6f1dc;
      const size = projectile.owner === 'boss' ? 12 : 8;
      this.projectileLayer.add(this.add.rectangle(projectile.position.x, projectile.position.y, size, size, color));
    }
  }

  private renderVisualEffects(): void {
    this.visualEffectLayer.clear(true, true);
    for (const effect of this.state.visualEffects) {
      const progress = Math.max(0, effect.lifeRemaining / effect.maxLife);
      if (effect.kind === 'damage_text' || effect.kind === 'player_damage_text') {
        const isPlayerDamage = effect.kind === 'player_damage_text';
        const text = this.add.text(effect.position.x, effect.position.y, String(effect.value), {
          fontFamily: 'Arial',
          fontSize: effect.isCritical || isPlayerDamage ? '34px' : '23px',
          fontStyle: effect.isCritical || isPlayerDamage ? 'bold' : 'normal',
          color: isPlayerDamage ? '#ff6b6b' : effect.isCritical ? '#ffd966' : '#f6f1dc',
          stroke: '#141923',
          strokeThickness: effect.isCritical || isPlayerDamage ? 5 : 3,
        });
        text.setOrigin(0.5);
        text.setAlpha(progress);
        this.visualEffectLayer.add(text);
      } else if (effect.kind === 'spark') {
        const spark = this.add.star(effect.position.x, effect.position.y, 6, 5, 20, 0xfff08a, progress);
        spark.setAngle(this.state.time * 720);
        this.visualEffectLayer.add(spark);
      } else if (effect.kind === 'fire_pit') {
        const radius = effect.radius ?? 30;
        const pulse = 1 + Math.sin(this.state.time * 16 + effect.position.x * 0.03) * 0.12;
        const ember = this.add.circle(effect.position.x, effect.position.y, radius * pulse, 0xff5a1f, 0.28 * progress);
        const core = this.add.circle(effect.position.x, effect.position.y, radius * 0.55 * pulse, 0xffd166, 0.36 * progress);
        const flameA = this.add.triangle(effect.position.x - radius * 0.28, effect.position.y - 4, 0, 18, 9, -14, 18, 18, 0xff7a1a, 0.55 * progress);
        const flameB = this.add.triangle(effect.position.x + radius * 0.18, effect.position.y - 2, 0, 16, 8, -18, 16, 16, 0xffe08a, 0.5 * progress);
        ember.setScale(1, 0.45);
        core.setScale(1, 0.38);
        flameA.setAngle(-10 + Math.sin(this.state.time * 18) * 8);
        flameB.setAngle(12 + Math.cos(this.state.time * 17) * 8);
        this.visualEffectLayer.addMultiple([ember, core, flameA, flameB]);
      } else if (effect.kind === 'burst_ring') {
        const radius = (effect.radius ?? 18) + (1 - progress) * 110;
        const ring = this.add.circle(effect.position.x, effect.position.y, radius, 0xffffff, 0);
        ring.setStrokeStyle(5, 0xffd966, 0.75 * progress);
        this.visualEffectLayer.add(ring);
      } else if (effect.kind === 'microwave_blast') {
        const radius = (effect.radius ?? 120) * (1.04 - progress * 0.04);
        const outer = this.add.circle(effect.position.x, effect.position.y, radius, 0xffd166, 0.1 * progress);
        const ringA = this.add.circle(effect.position.x, effect.position.y, radius, 0xffffff, 0);
        const ringB = this.add.circle(effect.position.x, effect.position.y, radius * 0.62, 0xffffff, 0);
        ringA.setStrokeStyle(8, 0xffd166, 0.85 * progress);
        ringB.setStrokeStyle(4, 0xff7a1a, 0.7 * progress);
        this.visualEffectLayer.addMultiple([outer, ringA, ringB]);
      } else if (effect.kind === 'pan_bounce') {
        const target = effect.targetPosition ?? effect.position;
        const line = this.add.line(0, 0, effect.position.x, effect.position.y, target.x, target.y, 0xfff08a, 0.82 * progress);
        const ring = this.add.circle(effect.position.x, effect.position.y, (effect.radius ?? 18) + (1 - progress) * 22, 0xffffff, 0);
        line.setLineWidth(5);
        ring.setStrokeStyle(4, 0xfff08a, 0.8 * progress);
        this.visualEffectLayer.addMultiple([line, ring]);
      } else if (effect.kind === 'ice_wall') {
        const height = effect.radius ?? 54;
        const wall = this.add.rectangle(effect.position.x, effect.position.y, 18, height, 0x9fe8ff, 0.68 * progress);
        const edge = this.add.rectangle(effect.position.x, effect.position.y, 26, height + 10, 0xffffff, 0);
        const crackA = this.add.line(effect.position.x, effect.position.y, -4, -height * 0.32, 5, -height * 0.02, 0xffffff, 0.8 * progress);
        const crackB = this.add.line(effect.position.x, effect.position.y, 4, height * 0.04, -5, height * 0.34, 0xd8f8ff, 0.75 * progress);
        const angle = Phaser.Math.RadToDeg(effect.angle ?? 0);
        wall.setAngle(angle);
        edge.setAngle(angle);
        edge.setStrokeStyle(3, 0xd8f8ff, 0.9 * progress);
        crackA.setAngle(angle);
        crackB.setAngle(angle);
        this.visualEffectLayer.addMultiple([edge, wall, crackA, crackB]);
      } else if (effect.kind === 'boss_slam') {
        const radius = (effect.radius ?? 96) * (1.08 - progress * 0.08);
        const ground = this.add.circle(effect.position.x, effect.position.y, radius, 0xff5a1f, 0.16 * progress);
        const ringA = this.add.circle(effect.position.x, effect.position.y, radius, 0xffffff, 0);
        const ringB = this.add.circle(effect.position.x, effect.position.y, radius * 0.46, 0xffffff, 0);
        ringA.setStrokeStyle(10, 0xffd166, 0.9 * progress);
        ringB.setStrokeStyle(5, 0xff5a1f, 0.75 * progress);
        this.visualEffectLayer.addMultiple([ground, ringA, ringB]);
      } else if (effect.kind === 'clown_dash') {
        const target = effect.targetPosition ?? effect.position;
        const line = this.add.line(0, 0, effect.position.x, effect.position.y, target.x, target.y, 0xff4fd8, 0.88 * progress);
        const ring = this.add.circle(target.x, target.y, (effect.radius ?? 34) + (1 - progress) * 34, 0xffffff, 0);
        line.setLineWidth(9);
        ring.setStrokeStyle(5, 0xff4fd8, 0.8 * progress);
        this.visualEffectLayer.addMultiple([line, ring]);
      } else {
        const radius = (effect.radius ?? 24) + (1 - progress) * 42;
        const flash = this.add.circle(effect.position.x, effect.position.y, radius, 0x74f2ce, 0.2 * progress);
        flash.setStrokeStyle(3, 0x74f2ce, 0.8 * progress);
        this.visualEffectLayer.add(flash);
      }
    }
  }

  private renderSkillAreas(): void {
    if (this.state.skillState.auraRadius <= 0) {
      return;
    }
    const aura = this.add.circle(this.state.player.position.x, this.state.player.position.y, this.state.skillState.auraRadius, 0x74f2ce, 0.09);
    aura.setStrokeStyle(2, 0x74f2ce, 0.5);
    this.visualEffectLayer.add(aura);
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
