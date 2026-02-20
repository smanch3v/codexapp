import Phaser from 'phaser';

const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;
const PLAYER_SPEED = 320;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private hudText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#181d27');

    this.player = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 48, 72, 24, 0x4cc9f0)
      .setOrigin(0.5);

    this.cursorKeys = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.wasdKeys = this.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }) as { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };

    this.hudText = this.add.text(16, 14, 'Score: 0   Level: 1', {
      color: '#f1f5f9',
      fontFamily: 'Arial',
      fontSize: '24px'
    });
    this.hudText.setDepth(10);
  }

  update(_: number, deltaMs: number): void {
    const deltaSeconds = deltaMs / 1000;
    let direction = 0;

    if (this.cursorKeys.left.isDown || this.wasdKeys.left.isDown) {
      direction -= 1;
    }

    if (this.cursorKeys.right.isDown || this.wasdKeys.right.isDown) {
      direction += 1;
    }

    this.player.x += direction * PLAYER_SPEED * deltaSeconds;

    const halfPlayerWidth = this.player.width / 2;
    this.player.x = Phaser.Math.Clamp(this.player.x, halfPlayerWidth, GAME_WIDTH - halfPlayerWidth);
  }
}
