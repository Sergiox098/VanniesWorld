/**
 * Vannie's World - Physics Engine
 * Form-aware AABB collisions, coyote time, jump buffering, and kinematic integration.
 */

import { CONSTANTS } from './constants.js';

export class PhysicsEngine {
  constructor() {
    this.T = CONSTANTS.TILE_SIZE;
  }

  updatePlayer(player, level, input, dt) {
    if (player.isDead) return;

    const pConst = CONSTANTS.PLAYER;

    // 1. Horizontal Movement & Input
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;

    if (moveDir !== 0) {
      player.vx = moveDir * pConst.SPEED_X;
      player.facing = moveDir;
    } else {
      player.vx = 0;
    }

    // 2. Coyote Time & Jump Buffering Timers
    if (player.isGrounded) {
      player.coyoteTimer = pConst.COYOTE_TIME;
    } else {
      player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
    }

    if (input.jumpJustPressed) {
      player.jumpBufferTimer = pConst.JUMP_BUFFER;
    } else {
      player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
    }

    // 3. Jump Execution
    if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
      player.vy = pConst.JUMP_FORCE;
      player.jumpBufferTimer = 0;
      player.coyoteTimer = 0;
      player.isGrounded = false;
      player.hasJumped = true;
      if (player.onJump) player.onJump();
    }

    // Variable jump height (releasing jump early cuts upward velocity)
    if (!input.jump && player.vy < 0 && player.hasJumped) {
      player.vy *= pConst.JUMP_CUT_MULTIPLIER;
      player.hasJumped = false;
    }

    // 4. Gravity & Fall Speed
    player.vy += pConst.GRAVITY * dt;
    if (player.vy > pConst.TERMINAL_VELOCITY) {
      player.vy = pConst.TERMINAL_VELOCITY;
    }

    // 5. Kinematic Integration with Sub-stepping for precise collisions
    const subSteps = 2;
    const subDt = dt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      // Horizontal sub-step
      const prevX = player.x;
      player.x += player.vx * subDt;
      this.resolveHorizontalCollisions(player, level);

      // Vertical sub-step
      const prevY = player.y;
      player.y += player.vy * subDt;
      this.resolveVerticalCollisions(player, level, prevY);
    }

    // 6. Hazard & Level Boundary Check
    this.checkHazards(player, level);
  }

  // Horizontal collision resolution
  resolveHorizontalCollisions(player, level) {
    const pw = CONSTANTS.PLAYER.WIDTH;
    const ph = CONSTANTS.PLAYER.HEIGHT;

    const startX = Math.floor(player.x / this.T);
    const endX = Math.floor((player.x + pw - 0.01) / this.T);
    const startY = Math.floor((player.y + 2) / this.T);
    const endY = Math.floor((player.y + ph - 2) / this.T);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = level.getTile(tx, ty);
        if (this.isTileSolidHorizontal(tile, player.form, level)) {
          if (player.vx > 0) {
            // Moving Right -> hit left edge of tile
            player.x = tx * this.T - pw;
            player.vx = 0;
          } else if (player.vx < 0) {
            // Moving Left -> hit right edge of tile
            player.x = (tx + 1) * this.T;
            player.vx = 0;
          }
        }
      }
    }
  }

  // Vertical collision resolution
  resolveVerticalCollisions(player, level, prevY) {
    const pw = CONSTANTS.PLAYER.WIDTH;
    const ph = CONSTANTS.PLAYER.HEIGHT;

    const startX = Math.floor((player.x + 3) / this.T);
    const endX = Math.floor((player.x + pw - 3) / this.T);
    const startY = Math.floor(player.y / this.T);
    const endY = Math.floor((player.y + ph) / this.T);

    player.isGrounded = false;

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = level.getTile(tx, ty);

        // One-way and Cloud platform logic
        if (tile === CONSTANTS.TILE_TYPES.PASTEL_CLOUD) {
          // Pastel cloud is solid ONLY for Form 1 (Pastel) from top
          if (player.form === CONSTANTS.FORMS.PASTEL && player.vy >= 0) {
            const tileTop = ty * this.T;
            if (prevY + ph <= tileTop + 8 && player.y + ph >= tileTop) {
              player.y = tileTop - ph;
              player.vy = 0;
              player.isGrounded = true;
              player.hasJumped = false;
            }
          }
          continue;
        }

        if (tile === CONSTANTS.TILE_TYPES.ONE_WAY_PLATFORM) {
          if (player.vy >= 0) {
            const tileTop = ty * this.T;
            if (prevY + ph <= tileTop + 8 && player.y + ph >= tileTop) {
              player.y = tileTop - ph;
              player.vy = 0;
              player.isGrounded = true;
              player.hasJumped = false;
            }
          }
          continue;
        }

        // Solid floor/ceiling logic
        if (this.isTileSolidVertical(tile, player.form, level)) {
          if (player.vy > 0) {
            // Falling down -> hit floor
            player.y = ty * this.T - ph;
            player.vy = 0;
            player.isGrounded = true;
            player.hasJumped = false;
          } else if (player.vy < 0) {
            // Jumping up -> hit ceiling
            player.y = (ty + 1) * this.T;
            player.vy = 0;
          }
        }
      }
    }
  }

  isTileSolidHorizontal(tile, form, level) {
    if (tile === CONSTANTS.TILE_TYPES.SOLID_GROUND || tile === CONSTANTS.TILE_TYPES.SOLID_STONE) {
      return true;
    }
    if (tile === CONSTANTS.TILE_TYPES.CRIMSON_MAGMA) {
      // Solid wall for Crimson form; lethal zone handled separately for Pastel
      return form === CONSTANTS.FORMS.CRIMSON;
    }
    if (tile === CONSTANTS.TILE_TYPES.PASTEL_BARRIER && !level.isPastelBarrierOpen) {
      return true;
    }
    if (tile === CONSTANTS.TILE_TYPES.CRIMSON_BARRIER && !level.isCrimsonBarrierOpen) {
      return true;
    }
    return false;
  }

  isTileSolidVertical(tile, form, level) {
    if (tile === CONSTANTS.TILE_TYPES.SOLID_GROUND || tile === CONSTANTS.TILE_TYPES.SOLID_STONE) {
      return true;
    }
    if (tile === CONSTANTS.TILE_TYPES.CRIMSON_MAGMA) {
      // Solid floor for Crimson form
      return form === CONSTANTS.FORMS.CRIMSON;
    }
    if (tile === CONSTANTS.TILE_TYPES.PASTEL_BARRIER && !level.isPastelBarrierOpen) {
      return true;
    }
    if (tile === CONSTANTS.TILE_TYPES.CRIMSON_BARRIER && !level.isCrimsonBarrierOpen) {
      return true;
    }
    return false;
  }

  // Check hazards (spikes, magma for Pastel, fall out of world)
  checkHazards(player, level) {
    const pw = CONSTANTS.PLAYER.WIDTH;
    const ph = CONSTANTS.PLAYER.HEIGHT;

    // Bottom pit fall death
    if (player.y > level.heightInTiles * this.T + 64) {
      player.die('fell_in_abyss');
      return;
    }

    const startX = Math.floor((player.x + 4) / this.T);
    const endX = Math.floor((player.x + pw - 4) / this.T);
    const startY = Math.floor((player.y + 4) / this.T);
    const endY = Math.floor((player.y + ph - 2) / this.T);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = level.getTile(tx, ty);

        // Spikes kill both forms
        if (tile === CONSTANTS.TILE_TYPES.SPIKES) {
          player.die('spikes');
          return;
        }

        // Magma kills Pastel form
        if (tile === CONSTANTS.TILE_TYPES.CRIMSON_MAGMA && player.form === CONSTANTS.FORMS.PASTEL) {
          player.die('magma');
          return;
        }
      }
    }
  }
}
