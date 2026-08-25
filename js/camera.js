/**
 * Vannie's World - 2D Smooth Tracking Camera
 * Keeps the player as the central focus of the screen, tracking motion seamlessly in X and Y.
 */

import { CONSTANTS } from './constants.js';

export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.x = 0;
    this.y = 0;
    this.shakeIntensity = 0;
    this.shakeDecay = 10;
    this.lerpSpeed = 8.0; // Responsive yet smooth tracking
  }

  reset(targetX, targetY) {
    this.x = targetX - this.viewportWidth / 2;
    this.y = targetY - this.viewportHeight / 2;
    this.shakeIntensity = 0;
  }

  shake(intensity = 4) {
    this.shakeIntensity = intensity;
  }

  update(player, level, dt) {
    // 1. Calculate ideal centered camera target
    const playerCenterX = player.x + CONSTANTS.PLAYER.WIDTH / 2;
    const playerCenterY = player.y + CONSTANTS.PLAYER.HEIGHT / 2;

    // Slight vertical lead when jumping/falling
    const verticalLead = player.vy * 0.08;
    const idealX = playerCenterX - this.viewportWidth / 2;
    const idealY = (playerCenterY + verticalLead) - this.viewportHeight / 2;

    // 2. Smooth Lerp interpolation in X and Y
    const t = 1 - Math.exp(-this.lerpSpeed * dt);
    this.x += (idealX - this.x) * t;
    this.y += (idealY - this.y) * t;

    // 3. Clamp camera to level boundaries
    const levelWidthPx = level.widthInTiles * CONSTANTS.TILE_SIZE;
    const levelHeightPx = level.heightInTiles * CONSTANTS.TILE_SIZE;

    // If level is smaller than viewport, center it
    if (levelWidthPx <= this.viewportWidth) {
      this.x = (levelWidthPx - this.viewportWidth) / 2;
    } else {
      this.x = Math.max(0, Math.min(this.x, levelWidthPx - this.viewportWidth));
    }

    if (levelHeightPx <= this.viewportHeight) {
      this.y = (levelHeightPx - this.viewportHeight) / 2;
    } else {
      this.y = Math.max(0, Math.min(this.y, levelHeightPx - this.viewportHeight));
    }

    // 4. Update Screen Shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt);
    }
  }

  applyTransform(ctx) {
    ctx.save();
    let offsetX = this.x;
    let offsetY = this.y;

    if (this.shakeIntensity > 0) {
      offsetX += (Math.random() - 0.5) * 2 * this.shakeIntensity;
      offsetY += (Math.random() - 0.5) * 2 * this.shakeIntensity;
    }

    ctx.translate(-Math.round(offsetX), -Math.round(offsetY));
  }

  restoreTransform(ctx) {
    ctx.restore();
  }
}
