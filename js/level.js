/**
 * Vannie's World - Level Manager & Parallax Background
 * Handles grid parsing, entity interactions (switches, stars, portals), and background rendering.
 */

import { CONSTANTS } from './constants.js';
import { LEVELS_DATA } from './levels_data.js';
import { audio } from './audio.js';

export class LevelManager {
  constructor() {
    this.currentLevelIndex = 0;
    this.currentData = null;
    this.grid = [];
    this.widthInTiles = 0;
    this.heightInTiles = 0;
    this.items = [];
    this.portal = null;
    this.spawn = null;
    this.starsCollected = 0;
    this.totalStars = 0;
    this.isPastelBarrierOpen = false;
    this.isCrimsonBarrierOpen = false;
    this.isLevelCompleted = false;
  }

  loadLevel(index) {
    if (index < 0 || index >= LEVELS_DATA.length) index = 0;
    this.currentLevelIndex = index;
    this.currentData = LEVELS_DATA[index];

    this.widthInTiles = this.currentData.width;
    this.heightInTiles = this.currentData.height;

    // Deep copy grid so modifications don't mutate original data
    this.grid = this.currentData.grid.map(row => [...row]);

    // Spawn & Portal
    this.spawn = { ...this.currentData.spawn };
    this.portal = { ...this.currentData.portal, isOpen: true };

    // Deep copy items
    this.items = this.currentData.items.map(item => ({
      ...item,
      collected: false,
      isPressed: false,
    }));

    this.starsCollected = 0;
    this.totalStars = this.items.filter(i => i.type === CONSTANTS.ENTITY_TYPES.COIN_STAR).length;
    this.isPastelBarrierOpen = false;
    this.isCrimsonBarrierOpen = false;
    this.isLevelCompleted = false;

    return this.currentData;
  }

  getTile(tx, ty) {
    if (tx < 0 || tx >= this.widthInTiles || ty < 0 || ty >= this.heightInTiles) {
      return CONSTANTS.TILE_TYPES.SOLID_STONE; // Solid border
    }
    return this.grid[ty][tx];
  }

  setTile(tx, ty, type) {
    if (tx >= 0 && tx < this.widthInTiles && ty >= 0 && ty < this.heightInTiles) {
      this.grid[ty][tx] = type;
    }
  }

  update(player, particleSystem, dt) {
    if (this.isLevelCompleted || player.isDead) return;

    const T = CONSTANTS.TILE_SIZE;
    const px = player.x + CONSTANTS.PLAYER.WIDTH / 2;
    const py = player.y + CONSTANTS.PLAYER.HEIGHT / 2;

    // 1. Check Collectibles & Switches
    for (const item of this.items) {
      if (item.collected) continue;

      const ix = item.x * T + T / 2;
      const iy = item.y * T + T / 2;
      const dist = Math.hypot(px - ix, py - iy);

      // Star pickup
      if (item.type === CONSTANTS.ENTITY_TYPES.COIN_STAR && dist < 24) {
        item.collected = true;
        this.starsCollected++;
        audio.playGem();

        // Spawn star sparkle burst
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 40 + Math.random() * 60;
          particleSystem.spawn(
            ix,
            iy,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            '#FFD700',
            0.5,
            3.5,
            'star'
          );
        }
      }

      // Switches
      if (item.type === CONSTANTS.ENTITY_TYPES.SWITCH_PASTEL && !item.isPressed && dist < 26) {
        if (player.form === CONSTANTS.FORMS.PASTEL) {
          item.isPressed = true;
          this.isPastelBarrierOpen = true;
          audio.playSwitch();
          this.spawnSwitchEffect(item.x * T, item.y * T, '#FFB6C1', particleSystem);
        }
      }

      if (item.type === CONSTANTS.ENTITY_TYPES.SWITCH_CRIMSON && !item.isPressed && dist < 26) {
        if (player.form === CONSTANTS.FORMS.CRIMSON) {
          item.isPressed = true;
          this.isCrimsonBarrierOpen = true;
          audio.playSwitch();
          this.spawnSwitchEffect(item.x * T, item.y * T, '#D90429', particleSystem);
        }
      }
    }

    // 2. Check Portal / Level Goal
    if (this.portal) {
      const portX = this.portal.x * T + T / 2;
      const portY = this.portal.y * T + T / 2;
      const distToPortal = Math.hypot(px - portX, py - portY);

      if (distToPortal < 24) {
        this.isLevelCompleted = true;
        audio.playVictory();

        // Massive victory star explosion
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 60 + Math.random() * 120;
          particleSystem.spawn(
            portX,
            portY,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            i % 2 === 0 ? '#FFD700' : '#FFB6C1',
            0.8,
            4.0,
            'star'
          );
        }
      }
    }
  }

  spawnSwitchEffect(x, y, color, particleSystem) {
    const T = CONSTANTS.TILE_SIZE;
    for (let i = 0; i < 12; i++) {
      particleSystem.spawn(
        x + T / 2,
        y + T / 2,
        (Math.random() - 0.5) * 60,
        -40 - Math.random() * 40,
        color,
        0.5,
        3.0
      );
    }
  }

  // --- RENDERING ---
  drawBackground(ctx, camera) {
    const pal = CONSTANTS.PALETTE.WORLD;
    const w = camera.viewportWidth;
    const h = camera.viewportHeight;

    // 1. Soft Kawaii Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, pal.SKY_TOP);
    skyGrad.addColorStop(1, pal.SKY_BOTTOM);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Parallax Distant Hills (Layer 1 - slow)
    ctx.save();
    const p1 = camera.x * 0.15;
    ctx.fillStyle = '#E8D5EC';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 40; x += 40) {
      const hillY = h - 90 + Math.sin((x + p1) * 0.012) * 25;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 3. Parallax Mid-Ground Kawaii Trees & Hills (Layer 2)
    const p2 = camera.x * 0.35;
    ctx.fillStyle = '#D6B4DE';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 30; x += 30) {
      const hillY = h - 55 + Math.sin((x + p2) * 0.02) * 18;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawTiles(ctx, spriteRenderer, camera, activeForm) {
    const T = CONSTANTS.TILE_SIZE;

    // Viewport tile bounds culling
    const startCol = Math.max(0, Math.floor(camera.x / T));
    const endCol = Math.min(this.widthInTiles - 1, Math.ceil((camera.x + camera.viewportWidth) / T));
    const startRow = Math.max(0, Math.floor(camera.y / T));
    const endRow = Math.min(this.heightInTiles - 1, Math.ceil((camera.y + camera.viewportHeight) / T));

    for (let ty = startRow; ty <= endRow; ty++) {
      for (let tx = startCol; tx <= endCol; tx++) {
        const tile = this.grid[ty][tx];
        if (tile !== CONSTANTS.TILE_TYPES.EMPTY) {
          spriteRenderer.drawTile(ctx, tile, tx * T, ty * T, T, activeForm);
        }
      }
    }
  }

  drawEntities(ctx, spriteRenderer, camera) {
    const T = CONSTANTS.TILE_SIZE;

    // 1. Draw Portal Goal
    if (this.portal) {
      spriteRenderer.drawPortal(ctx, this.portal.x * T, this.portal.y * T, T, this.portal.isOpen);
    }

    // 2. Draw Items
    for (const item of this.items) {
      if (item.collected) continue;

      if (item.type === CONSTANTS.ENTITY_TYPES.COIN_STAR) {
        spriteRenderer.drawCrystal(ctx, item.x * T, item.y * T, T, CONSTANTS.FORMS.PASTEL);
      } else if (item.type === CONSTANTS.ENTITY_TYPES.SWITCH_PASTEL) {
        spriteRenderer.drawSwitch(ctx, item.x * T, item.y * T, T, CONSTANTS.FORMS.PASTEL, item.isPressed);
      } else if (item.type === CONSTANTS.ENTITY_TYPES.SWITCH_CRIMSON) {
        spriteRenderer.drawSwitch(ctx, item.x * T, item.y * T, T, CONSTANTS.FORMS.CRIMSON, item.isPressed);
      }
    }
  }
}
