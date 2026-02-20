import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  parent: 'app',
  scene: [GameScene]
};

new Phaser.Game(gameConfig);
