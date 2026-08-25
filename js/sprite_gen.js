/**
 * Vannie's World - Procedural Pixel Art & Graphics Engine
 * Draws beautiful kawaii pixel art directly to canvas for guaranteed crispness, zero load latency.
 */

import { CONSTANTS } from './constants.js';

export class SpriteRenderer {
  constructor() {
    this.animTime = 0;
  }

  update(dt) {
    this.animTime += dt;
  }

  // --- DRAW PLAYER ---
  drawPlayer(ctx, player) {
    const isPastel = player.form === CONSTANTS.FORMS.PASTEL;
    const facing = player.facing;
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    const w = CONSTANTS.PLAYER.WIDTH;
    const h = CONSTANTS.PLAYER.HEIGHT;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(facing, 1);

    // Transform flash / invulnerability effect
    if (player.transformFlashTimer > 0) {
      const alpha = 0.5 + 0.5 * Math.sin(player.transformFlashTimer * 40);
      ctx.globalAlpha = alpha;
    }

    // Squash and stretch
    let scaleX = 1.0;
    let scaleY = 1.0;
    const isGrounded = player.isGrounded;
    const isMoving = Math.abs(player.vx) > 10;

    if (!isGrounded) {
      if (player.vy < -50) {
        // Jumping up (stretch)
        scaleX = 0.85;
        scaleY = 1.15;
      } else if (player.vy > 50) {
        // Falling down (squash)
        scaleX = 1.1;
        scaleY = 0.9;
      }
    } else if (isMoving) {
      // Running bounce
      const bounce = Math.sin(this.animTime * 14) * 0.08;
      scaleX = 1.0 - bounce;
      scaleY = 1.0 + bounce;
    } else {
      // Idle breathing
      const breath = Math.sin(this.animTime * 3) * 0.04;
      scaleX = 1.0 + breath;
      scaleY = 1.0 - breath;
    }

    ctx.scale(scaleX, scaleY);

    if (isPastel) {
      this.drawPastelVannie(ctx, -w / 2, -h / 2, w, h, isMoving, isGrounded);
    } else {
      this.drawCrimsonVannie(ctx, -w / 2, -h / 2, w, h, isMoving, isGrounded);
    }

    ctx.restore();
  }

  // --- FORM 1: PASTEL VANNIE (Kawaii Bunny/Cat Slime) ---
  drawPastelVannie(ctx, x, y, w, h, isMoving, isGrounded) {
        const pal = CONSTANTS.PALETTE.PASTEL

  drawTile(ctx, tileType, x, y, size, activeForm) {
    switch (tileType) {
      case CONSTANTS.TILE_TYPES.SOLID_GROUND:
        this.drawGroundTile(ctx, x, y, size);
        break;
      case CONSTANTS.TILE_TYPES.SOLID_STONE:
        this.drawStoneTile(ctx, x, y, size);
        break;
      case CONSTANTS.TILE_TYPES.PASTEL_CLOUD:
        this.drawPastelCloudTile(ctx, x, y, size, activeForm === CONSTANTS.FORMS.PASTEL);
        break;
      case CONSTANTS.TILE_TYPES.CRIMSON_MAGMA:
        this.drawCrimsonMagmaTile(ctx, x, y, size, activeForm === CONSTANTS.FORMS.CRIMSON);
        break;
      case CONSTANTS.TILE_TYPES.SPIKES:
        this.drawSpikesTile(ctx, x, y, size);
        break;
      case CONSTANTS.TILE_TYPES.PASTEL_BARRIER:
        this.drawBarrierTile(ctx, x, y, size, CONSTANTS.FORMS.PASTEL);
        break;
      case CONSTANTS.TILE_TYPES.CRIMSON_BARRIER:
        this.drawBarrierTile(ctx, x, y, size, CONSTANTS.FORMS.CRIMSON);
        break;
      case CONSTANTS.TILE_TYPES.ONE_WAY_PLATFORM:
        this.drawOneWayPlatform(ctx, x, y, size);
        break;
    }
  }

  drawGroundTile(ctx, x, y, size) {
    // Dirt base
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(x, y, size, size);

    // Dirt pebble accents
    ctx.fillStyle = '#55341E';
    ctx.fillRect(x + 4, y + 14, 4, 3);
    ctx.fillRect(x + 18, y + 22, 5, 4);
    ctx.fillRect(x + 12, y + 26, 3, 3);

    // Pastel grass top layer
    ctx.fillStyle = '#8EE4AF';
    ctx.fillRect(x, y, size, 8);

    // Cute grass blades hanging down
    ctx.fillStyle = '#78D69A';
    for (let i = 0; i < size; i += 6) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + 8);
      ctx.lineTo(x + i + 3, y + 12 + ((i % 4)));
      ctx.lineTo(x + i + 6, y + 8);
      ctx.fill();
    }

    // Little flowers on grass
    if ((x + y) % 64 === 0) {
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.arc(x + 16, y + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x + 16, y + 4, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawStoneTile(ctx, x, y, size) {
    ctx.fillStyle = '#5A5975';
    ctx.fillRect(x, y, size, size);

    // Stone brick borders
    ctx.strokeStyle = '#434259';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    // Brick highlight
    ctx.fillStyle = '#6E6D8D';
    ctx.fillRect(x + 2, y + 2, size - 4, 3);
  }

  drawPastelCloudTile(ctx, x, y, size, isSolidForCurrentForm) {
    const alpha = isSolidForCurrentForm ? 0.95 : 0.45;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Cloud soft pink/mint glow
    ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 4, 0, Math.PI * 2);
    ctx.fill();

    // Main cloud puffs
    ctx.fillStyle = '#FFF5F8';
    ctx.beginPath();
    ctx.arc(x + 8, y + 16, 8, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 12, 9, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 16, 8, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 22, 7, 0, Math.PI * 2);
    ctx.fill();

    // Pastel Pink Rim
    ctx.strokeStyle = '#FFB6C1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Little floating star if active
    if (isSolidForCurrentForm) {
      const starY = y + 8 + Math.sin(this.animTime * 4 + x) * 2;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + 16, starY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCrimsonMagmaTile(ctx, x, y, size, isSafeForCurrentForm) {
    // Dark Obsidian Crust
    ctx.fillStyle = '#2B1115';
    ctx.fillRect(x, y, size, size);

    // Glowing Lava base
    const pulse = Math.sin(this.animTime * 6 + (x * 0.1)) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(255, 63, 52, ${pulse})`;
    ctx.fillRect(x, y + 8, size, size - 8);

    // Bright yellow/orange magma core
    ctx.fillStyle = '#FFD166';
    ctx.fillRect(x + 4, y + 12, size - 8, size - 16);

    // Animated magma bubbles / heat waves
    const bubbleY = y + 6 + Math.sin(this.animTime * 8 + x) * 3;
    ctx.fillStyle = '#FF3F34';
    ctx.beginPath();
    ctx.arc(x + 10, bubbleY, 3, 0, Math.PI * 2);
    ctx.arc(x + 22, bubbleY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Top danger warning / safe indicator
    if (!isSafeForCurrentForm) {
      // Blazing flames when hazardous to Pastel
      ctx.fillStyle = 'rgba(255, 60, 0, 0.6)';
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 8);
      ctx.lineTo(x + 8, y + 2 + Math.sin(this.animTime * 12) * 3);
      ctx.lineTo(x + 14, y + 8);
      ctx.lineTo(x + 20, y + 1 + Math.cos(this.animTime * 12) * 3);
      ctx.lineTo(x + 26, y + 8);
      ctx.fill();
    } else {
      // Cute golden aura when safe for Crimson
      ctx.strokeStyle = '#FFD166';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }
  }

  drawSpikesTile(ctx, x, y, size) {
    ctx.fillStyle = '#D90429';
    for (let i = 0; i < size; i += 8) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + size);
      ctx.lineTo(x + i + 4, y + 4);
      ctx.lineTo(x + i + 8, y + size);
      ctx.closePath();
      ctx.fill();

      // Highlight
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + i + 4, y + 4);
      ctx.lineTo(x + i + 4, y + size);
      ctx.stroke();
    }
  }

  drawBarrierTile(ctx, x, y, size, formType) {
    const isPastel = formType === CONSTANTS.FORMS.PASTEL;
    const color = isPastel ? 'rgba(255, 182, 193, 0.7)' : 'rgba(217, 4, 41, 0.7)';
    const runeColor = isPastel ? '#FFFFFF' : '#FFD166';

    ctx.fillStyle = color;
    ctx.fillRect(x + 4, y, size - 8, size);

    // Laser runes
    ctx.fillStyle = runeColor;
    const barY = (y + (this.animTime * 40) % size);
    ctx.fillRect(x + 6, barY, size - 12, 3);
  }

  drawOneWayPlatform(ctx, x, y, size) {
    ctx.fillStyle = '#A0E7E5';
    this.roundRect(ctx, x, y, size, 8, 3);
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // --- DRAW INTERACTIVES / ENTITIES ---
  drawPortal(ctx, x, y, size, isOpen) {
    const cx = x + size / 2;
    const cy = y + size / 2;

    ctx.save();
    // Swirling portal aura
    const rot = this.animTime * 2;
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, size * 0.7);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, '#FFB6C1');
    grad.addColorStop(0.8, '#D90429');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // 4 Kawaii rotating starlets
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const sx = Math.cos(angle) * (size * 0.45);
      const sy = Math.sin(angle) * (size * 0.45);
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Center cute icon
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, 6 + Math.sin(this.animTime * 6) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCrystal(ctx, x, y, size, formType) {
    const isPastel = formType === CONSTANTS.FORMS.PASTEL;
    const cx = x + size / 2;
    const cy = y + size / 2 + Math.sin(this.animTime * 4 + x) * 3;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = isPastel ? '#FFB6C1' : '#D90429';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();

    // Inner bright shine
    ctx.fillStyle = isPastel ? '#FFFFFF' : '#FFD166';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 5);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawSwitch(ctx, x, y, size, formType, isPressed) {
    const isPastel = formType === CONSTANTS.FORMS.PASTEL;
    const color = isPastel ? '#FFB6C1' : '#D90429';
    const h = isPressed ? 4 : 8;
    const sy = y + size - h;

    // Switch Base
    ctx.fillStyle = '#434259';
    ctx.fillRect(x + 4, y + size - 3, size - 8, 3);

    // Button pad
    ctx.fillStyle = color;
    this.roundRect(ctx, x + 6, sy, size - 12, h, 2);
    ctx.fill();

    if (!isPressed) {
      ctx.fillStyle = isPastel ? '#FFFFFF' : '#FFD166';
      ctx.beginPath();
      ctx.arc(x + size / 2, sy + 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- HELPER: ROUNDED RECTANGLE ---
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}


