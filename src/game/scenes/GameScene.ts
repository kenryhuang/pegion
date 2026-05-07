import Phaser from 'phaser';
import { emitGameState, gameEventNames, type SelectSkillDetail } from '../events/GameEvents';
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
      updateMovement(this.state, deltaSeconds);
      updateSpawning(this.state);
      updateCombat(this.state, deltaSeconds);
      applyCollisions(this.state);
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

  private removeWindowListeners(): void {
    window.removeEventListener(gameEventNames.startRun, this.handleStartRun);
    window.removeEventListener(gameEventNames.pauseRun, this.handlePauseRun);
    window.removeEventListener(gameEventNames.resumeRun, this.handleResumeRun);
    window.removeEventListener(gameEventNames.restartRun, this.handleStartRun);
    window.removeEventListener(gameEventNames.selectSkill, this.handleSelectSkill as EventListener);
  }

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
