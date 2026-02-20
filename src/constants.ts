export const GAME_CONFIG = {
  width: 480,
  height: 800,
  backgroundColor: '#181d27'
} as const;

export const PLAYER_CONFIG = {
  width: 72,
  height: 24,
  speed: 320,
  maxHp: 5,
  yOffset: 48,
  color: 0x4cc9f0
} as const;

export const WEAPON_CONFIG = {
  shotsPerSecond: 4,
  bulletSpeed: 560,
  bulletWidth: 8,
  bulletHeight: 18,
  bulletDamage: 1,
  bulletColor: 0xf8fafc
} as const;

export const ENEMY_CONFIG = {
  width: 42,
  height: 42,
  speed: 95,
  minSpawnIntervalMs: 350,
  maxSpawnIntervalMs: 900,
  spawnRampPerSecondMs: 12,
  hpBase: 2,
  hpRampEveryPoints: 10,
  hpRampAmount: 1,
  color: 0xef4444
} as const;

export const SCORE_CONFIG = {
  pointsPerEnemy: 10
} as const;

export const EFFECTS_CONFIG = {
  hitFlashDurationMs: 120,
  hitFlashColor: 0xffffff,
  hitFlashAlpha: 0.2,
  hitShakeDurationMs: 120,
  hitShakeIntensity: 0.004
} as const;
