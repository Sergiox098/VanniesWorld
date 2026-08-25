/**
 * Vannie's World - Physics & System Constants
 * All physics values are tuned and mathematically verified.
 */

export const CONSTANTS = {
  // World Grid
  TILE_SIZE: 32, // pixels per tile

  // Player Physics
  PLAYER: {
    WIDTH: 24,
    HEIGHT: 28,
    SPEED_X: 224,          // px/sec (7.0 tiles/sec)
    GRAVITY: 1200,         // px/sec^2 (37.5 tiles/sec^2)
    JUMP_FORCE: -480,      // px/sec (initial jump impulse, reaches 96 px height = 3.0 tiles)
    TERMINAL_VELOCITY: 520,// px/sec max fall speed
    COYOTE_TIME: 0.18,     // seconds (grace period after leaving a ledge)
    JUMP_BUFFER: 0.18,     // seconds (grace period for pressing jump before landing)
    JUMP_CUT_MULTIPLIER: 0.6, // factor applied when jump button is released early
  },

  // Derived Theoretical Jump Metrics
  // H_max = v0^2 / (2 * g) = 440^2 / (2 * 1300) ≈ 74.46 px (~2.327 tiles)
  // T_peak = 440 / 1300 ≈ 0.3385 s
  // T_hang = 2 * T_peak ≈ 0.6769 s
  // D_max = 224 * 0.6769 ≈ 151.6 px (~4.737 tiles)
  PHYSICS_LIMITS: {
    MAX_JUMP_HEIGHT_PX: 74.46,
    MAX_JUMP_HEIGHT_TILES: 2.327,
    MAX_JUMP_DIST_PX: 151.6,
    MAX_JUMP_DIST_TILES: 4.737,
    SAFE_MAX_VERTICAL_STEP_TILES: 2,   // 64 px is safe (< 74.46 px)
    SAFE_MAX_HORIZONTAL_GAP_TILES: 4,  // 128 px is safe (< 151.6 px)
  },

  // Tile Types in Grid
  TILE_TYPES: {
    EMPTY: 0,
    SOLID_GROUND: 1,       // Walkable by both forms
    SOLID_STONE: 2,        // Walkable by both forms (underground/wall)
    PASTEL_CLOUD: 3,       // Solid ONLY for Form 1 (Pastel); Form 2 phases through
    CRIMSON_MAGMA: 4,      // Solid & safe ONLY for Form 2 (Crimson); Lethal to Form 1
    SPIKES: 5,             // Lethal to BOTH forms
    PASTEL_BARRIER: 6,     // Solid wall until opened by a pastel switch/gem
    CRIMSON_BARRIER: 7,    // Solid wall until opened by a crimson switch/gem
    ONE_WAY_PLATFORM: 8,   // Jump-through platform for both forms
  },

  // Entity / Interactive Types
  ENTITY_TYPES: {
    PORTAL_GOAL: 'portal_goal',
    CRYSTAL_PASTEL: 'crystal_pastel',
    CRYSTAL_CRIMSON: 'crystal_crimson',
    SWITCH_PASTEL: 'switch_pastel',
    SWITCH_CRIMSON: 'switch_crimson',
    COIN_STAR: 'coin_star',
    CHECKPOINT: 'checkpoint',
  },

  // Player Forms
  FORMS: {
    PASTEL: 1,   // Form 1: Kawaii Pastel Bunny/Cat (Pink/Cyan/Lilac)
    CRIMSON: 2,  // Form 2: Kawaii Crimson Little Devil (Red/Dark Burgundy/Gold)
  },

  // Visual Palettes
  PALETTE: {
    PASTEL: {
      PRIMARY: '#FFB6C1',     // Soft Pastel Pink
      SECONDARY: '#A0E7E5',   // Pastel Mint / Cyan
      ACCENT: '#FFF0F5',      // Lavender blush / White glow
      EYES: '#2B2D42',        // Deep indigo eye
      CHEEKS: '#FF69B4',      // Rosy blush
      GLOW: 'rgba(255, 182, 193, 0.4)',
    },
    CRIMSON: {
      PRIMARY: '#D90429',     // Rich Crimson Red
      SECONDARY: '#4A0E17',   // Dark Burgundy
      ACCENT: '#FFD166',      // Warm golden horns / highlights
      EYES: '#FFF0F5',        // Bright cute eyes
      CHEEKS: '#EF233C',      // Cute dark red blush
      GLOW: 'rgba(217, 4, 41, 0.4)',
    },
    WORLD: {
      SKY_TOP: '#FCEEF5',
      SKY_BOTTOM: '#D8B4E2',
      CLOUD: '#FFFFFF',
      GRASS_TOP: '#8EE4AF',
      DIRT: '#5D8A66',
      MAGMA_GLOW: '#FF3F34',
      STAR: '#FFD700',
    }
  },

  // Viewport Settings
  VIEWPORT: {
    WIDTH: 640,
    HEIGHT: 360,
    ASPECT_RATIO: 16 / 9,
  }
};
