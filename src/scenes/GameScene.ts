import Phaser from 'phaser';
import {
  EFFECTS_CONFIG,
  ENEMY_CONFIG,
  GAME_CONFIG,
  PLAYER_CONFIG,
  SCORE_CONFIG,
  WEAPON_CONFIG
} from '../constants';

type EnemyRectangle = Phaser.GameObjects.Rectangle & {
  body: Phaser.Physics.Arcade.Body;
  hp: number;
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hudText!: Phaser.GameObjects.Text;
  private gameOverContainer!: Phaser.GameObjects.Container;

  private score = 0;
  private playerHp = PLAYER_CONFIG.maxHp;
  private fireCooldownMs = 0;
  private spawnCooldownMs = ENEMY_CONFIG.maxSpawnIntervalMs;
  private elapsedSeconds = 0;
  private isGameOver = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.resetState();
    this.cameras.main.setBackgroundColor(GAME_CONFIG.backgroundColor);

    this.player = this.physics.add
      .existing(
        this.add.rectangle(
          GAME_CONFIG.width / 2,
          GAME_CONFIG.height - PLAYER_CONFIG.yOffset,
          PLAYER_CONFIG.width,
          PLAYER_CONFIG.height,
          PLAYER_CONFIG.color
        )
      )
      .setOrigin(0.5) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

    this.player.body.setAllowGravity(false).setImmovable(true);

    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    this.cursorKeys = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wasdKeys = this.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }) as { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };

    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitsEnemy, undefined, this);

    this.hudText = this.add.text(16, 14, '', {
      color: '#f1f5f9',
      fontFamily: 'Arial',
      fontSize: '24px'
    });
    this.hudText.setDepth(10);

    this.gameOverContainer = this.createGameOverOverlay();
    this.refreshHud();
  }

  update(_: number, deltaMs: number): void {
    if (this.isGameOver) {
      return;
    }

    const deltaSeconds = deltaMs / 1000;
    this.elapsedSeconds += deltaSeconds;

    this.updatePlayerMovement(deltaSeconds);
    this.updateAutoShooting(deltaMs);
    this.updateEnemySpawning(deltaMs);
    this.updateEnemyProgress();
  }

  private resetState(): void {
    this.score = 0;
    this.playerHp = PLAYER_CONFIG.maxHp;
    this.fireCooldownMs = 0;
    this.spawnCooldownMs = ENEMY_CONFIG.maxSpawnIntervalMs;
    this.elapsedSeconds = 0;
    this.isGameOver = false;
  }

  private updatePlayerMovement(deltaSeconds: number): void {
    let direction = 0;

    if (this.cursorKeys.left.isDown || this.wasdKeys.left.isDown) {
      direction -= 1;
    }

    if (this.cursorKeys.right.isDown || this.wasdKeys.right.isDown) {
      direction += 1;
    }

    this.player.x += direction * PLAYER_CONFIG.speed * deltaSeconds;

    const halfPlayerWidth = this.player.width / 2;
    this.player.x = Phaser.Math.Clamp(this.player.x, halfPlayerWidth, GAME_CONFIG.width - halfPlayerWidth);
    this.player.body.updateFromGameObject();
  }

  private updateAutoShooting(deltaMs: number): void {
    this.fireCooldownMs -= deltaMs;

    const intervalMs = 1000 / WEAPON_CONFIG.shotsPerSecond;
    while (this.fireCooldownMs <= 0) {
      this.spawnBullet();
      this.fireCooldownMs += intervalMs;
    }
  }

  private spawnBullet(): void {
    const bullet = this.physics.add
      .existing(
        this.add.rectangle(
          this.player.x,
          this.player.y - PLAYER_CONFIG.height,
          WEAPON_CONFIG.bulletWidth,
          WEAPON_CONFIG.bulletHeight,
          WEAPON_CONFIG.bulletColor
        )
      )
      .setOrigin(0.5) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

    bullet.body.setAllowGravity(false).setVelocityY(-WEAPON_CONFIG.bulletSpeed);
    this.bullets.add(bullet);
  }

  private updateEnemySpawning(deltaMs: number): void {
    this.spawnCooldownMs -= deltaMs;

    if (this.spawnCooldownMs <= 0) {
      this.spawnEnemy();

      const rampedInterval = ENEMY_CONFIG.maxSpawnIntervalMs - this.elapsedSeconds * ENEMY_CONFIG.spawnRampPerSecondMs;
      this.spawnCooldownMs = Phaser.Math.Clamp(
        rampedInterval,
        ENEMY_CONFIG.minSpawnIntervalMs,
        ENEMY_CONFIG.maxSpawnIntervalMs
      );
    }
  }

  private spawnEnemy(): void {
    const margin = ENEMY_CONFIG.width;
    const x = Phaser.Math.Between(margin, GAME_CONFIG.width - margin);

    const enemy = this.physics.add
      .existing(this.add.rectangle(x, -ENEMY_CONFIG.height, ENEMY_CONFIG.width, ENEMY_CONFIG.height, ENEMY_CONFIG.color))
      .setOrigin(0.5) as EnemyRectangle;

    const hpRamp = Math.floor(this.score / ENEMY_CONFIG.hpRampEveryPoints) * ENEMY_CONFIG.hpRampAmount;
    enemy.hp = ENEMY_CONFIG.hpBase + hpRamp;
    enemy.body.setAllowGravity(false).setVelocityY(ENEMY_CONFIG.speed);
    this.enemies.add(enemy);
  }

  private onBulletHitsEnemy(
    bulletObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject
  ): void {
    const bullet = bulletObject as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    const enemy = enemyObject as EnemyRectangle;

    bullet.destroy();
    enemy.hp -= WEAPON_CONFIG.bulletDamage;

    if (enemy.hp <= 0) {
      enemy.destroy();
      this.score += SCORE_CONFIG.pointsPerEnemy;
      this.refreshHud();
    }
  }

  private updateEnemyProgress(): void {
    for (const entry of this.enemies.getChildren()) {
      const enemy = entry as EnemyRectangle;
      if (!enemy.active) {
        continue;
      }

      if (enemy.y >= GAME_CONFIG.height - PLAYER_CONFIG.yOffset) {
        enemy.destroy();
        this.damagePlayer(1);
      }
    }

    for (const entry of this.bullets.getChildren()) {
      const bullet = entry as Phaser.GameObjects.Rectangle;
      if (bullet.active && bullet.y < -WEAPON_CONFIG.bulletHeight) {
        bullet.destroy();
      }
    }
  }

  private damagePlayer(amount: number): void {
    this.playerHp -= amount;
    this.cameras.main.shake(EFFECTS_CONFIG.hitShakeDurationMs, EFFECTS_CONFIG.hitShakeIntensity);

    const flash = this.add
      .rectangle(
        GAME_CONFIG.width / 2,
        GAME_CONFIG.height / 2,
        GAME_CONFIG.width,
        GAME_CONFIG.height,
        EFFECTS_CONFIG.hitFlashColor,
        EFFECTS_CONFIG.hitFlashAlpha
      )
      .setDepth(20);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: EFFECTS_CONFIG.hitFlashDurationMs,
      onComplete: () => flash.destroy()
    });

    this.refreshHud();

    if (this.playerHp <= 0) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    this.gameOverContainer.setVisible(true);
    this.gameOverContainer.setDepth(30);
    this.physics.pause();
  }

  private refreshHud(): void {
    this.hudText?.setText(`Score: ${this.score}   HP: ${this.playerHp}`);
  }

  private createGameOverOverlay(): Phaser.GameObjects.Container {
    const dim = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.6).setOrigin(0);

    const title = this.add
      .text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 56, 'GAME OVER', {
        color: '#f8fafc',
        fontFamily: 'Arial',
        fontSize: '48px'
      })
      .setOrigin(0.5);

    const restartButton = this.add
      .rectangle(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 18, 220, 64, 0x22c55e)
      .setInteractive({ useHandCursor: true });

    const restartText = this.add
      .text(restartButton.x, restartButton.y, 'Restart', {
        color: '#042f2e',
        fontFamily: 'Arial',
        fontSize: '34px'
      })
      .setOrigin(0.5);

    restartButton.on('pointerdown', () => {
      this.scene.restart();
      this.physics.resume();
    });

    return this.add.container(0, 0, [dim, title, restartButton, restartText]).setVisible(false);
  }
}
