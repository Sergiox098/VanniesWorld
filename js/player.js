/**
 * Vannie's World - Player Entity
 * Dual-form state machine, transformation mechanics, and particle spawning.
 */

import { CONSTANTS } from './constants.js';
import { audio } from './audio.js';

export class Player {
  constructor(spawnX, spawnY) {
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.reset();
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = Right, -1 = Left
    this.form = CONSTANTS.FORMS.PASTEL; // Start as Pastel Form
    this.isGrounded = false;
    this.hasJumped = false;
    this.isDead = false;
    this.deathTimer = 0;

    // Timers
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.transformCooldown = 0;
    this.transformFlashTimer = 0;

    // Active Checkpoint
    this.checkpointX = this.spawnX;
    this.checkpointY = this.spawnY;
  }

  setSpawn(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.checkpointX = x;
    this.checkpointY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  setCheckpoint(x, y) {
    this.checkpointX = x;
    this.checkpointY = y;
  }

  update(dt, particleSystem) {
    // Transform cooldown & flash
    if (this.transformCooldown > 0) {
      this.transformCooldown = Math.max(0, this.transformCooldown - dt);
    }
    if (this.transformFlashTimer > 0) {
      this.transformFlashTimer = Math.max(0, this.transformFlashTimer - dt);
    }

    // Death / Respawn handling
    if (this.isDead) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.respawn(particleSystem);
      }
      return;
    }

    // Spawn subtle ambient aura particles
    if (particleSystem && Math.random() < 0.25) {
      const isPastel = this.form === CONSTANTS.FORMS.PASTEL;
      particleSystem.spawn(
        this.x + Math.random() * CONSTANTS.PLAYER.WIDTH,
        this.y + CONSTANTS.PLAYER.HEIGHT - 4,
        (Math.random() - 0.5) * 20,
        -15 - Math.random() * 20,
        isPastel ? '#FFB6C1' : '#D90429',
        0.5,
        2.5
      );
    }
  }

  // --- TRANSFORMATION ---
  transform(particleSystem) {
    if (this.isDead || this.transformCooldown > 0) return false;

    this.form = this.form === CONSTANTS.FORMS.PASTEL
      ? CONSTANTS.FORMS.CRIMSON
      : CONSTANTS.FORMS.PASTEL;

    this.transformCooldown = 0.15; // Quick responsive cooldown
    this.transformFlashTimer = 0.25;

    // Play Audio
    audio.playTransform(this.form);

    // Spawn magical starburst / particle explosion
    if (particleSystem) {
      const isPastel = this.form === CONSTANTS.FORMS.PASTEL;
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 60 + Math.random() * 80;
        const color = isPastel
          ? (i % 2 === 0 ? '#FFB6C1' : '#A0E7E5')
          : (i % 2 === 0 ? '#D90429' : '#FFD166');

        particleSystem.spawn(
          this.x + CONSTANTS.PLAYER.WIDTH / 2,
          this.y + CONSTANTS.PLAYER.HEIGHT / 2,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          0.45 + Math.random() * 0.2,
          3.5
        );
      }
    }

    return true;
  }

  onJump() {
    audio.playJump(this.form);
  }

  die(reason, particleSystem) {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTimer = 0.6; // 600ms respawn delay
    this.vx = 0;
    this.vy = 0;

    audio.playHurt();

    if (particleSystem) {
      // Death poof explosion
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 90;
        particleSystem.spawn(
          this.x + CONSTANTS.PLAYER.WIDTH / 2,
          this.y + CONSTANTS.PLAYER.HEIGHT / 2,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          '#FFF0F5',
          0.5,
          3.0
        );
      }
    }
  }

  respawn(particleSystem) {
    this.x = this.checkpointX;
    this.y = this.checkpointY;
    this.vx = 0;
    this.vy = 0;
    this.isDead = false;
    this.transformFlashTimer = 0.4;

    if (particleSystem) {
      // Soft respawn fairy dust
      for (let i = 0; i < 12; i++) {
        particleSystem.spawn(
          this.x + CONSTANTS.PLAYER.WIDTH / 2 + (Math.random() - 0.5) * 16,
          this.y + CONSTANTS.PLAYER.HEIGHT / 2 + (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 30,
          -30 - Math.random() * 30,
          '#A0E7E5',
          0.6,
          2.5
        );
      }
    }
  }
}
