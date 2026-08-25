/**
 * Vannie's World - Main Game Engine
 * Fixed-step physics loop, state handling, HUD, and input listeners.
 */

import { CONSTANTS } from './constants.js';
import { Player } from './player.js';
import { Camera } from './camera.js';
import { LevelManager } from './level.js';
import { PhysicsEngine } from './physics.js';
import { SpriteRenderer } from './sprite_gen.js';
import { ParticleSystem } from './particles.js';
import { audio } from './audio.js';
import { LEVELS_DATA } from './levels_data.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Engine Systems
    this.physics = new PhysicsEngine();
    this.renderer = new SpriteRenderer();
    this.particles = new ParticleSystem();
    this.level = new LevelManager();
    this.camera = new Camera(CONSTANTS.VIEWPORT.WIDTH, CONSTANTS.VIEWPORT.HEIGHT);
    this.player = new Player(0, 0);

    // Timing
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1 / 60; // 60 Hz physics

    // Input state
    this.input = {
      left: false,
      right: false,
      jump: false,
      jumpJustPressed: false,
      transformJustPressed: false,
    };

    // UI & State
    this.currentLevelIndex = 0;
    this.gameState = 'PLAYING'; // 'PLAYING', 'LEVEL_COMPLETE', 'GAME_ALL_COMPLETE'
    this.victoryTimer = 0;

    this.initInput();
    this.loadLevel(0);
  }

  loadLevel(index) {
    const data = this.level.loadLevel(index);
    this.currentLevelIndex = index;
    this.gameState = 'PLAYING';
    this.victoryTimer = 0;
    this.particles.clear();

    const spawnPxX = data.spawn.x * CONSTANTS.TILE_SIZE;
    const spawnPxY = data.spawn.y * CONSTANTS.TILE_SIZE;
    this.player.setSpawn(spawnPxX, spawnPxY);
    this.player.form = data.spawn.form || CONSTANTS.FORMS.PASTEL;

    this.camera.reset(spawnPxX, spawnPxY);

    this.updateHUD();
  }

  restartLevel() {
    this.loadLevel(this.currentLevelIndex);
  }

  nextLevel() {
    if (this.currentLevelIndex < LEVELS_DATA.length - 1) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.gameState = 'GAME_ALL_COMPLETE';
    }
  }

  prevLevel() {
    if (this.currentLevelIndex > 0) {
      this.loadLevel(this.currentLevelIndex - 1);
    }
  }

  initInput() {
    window.addEventListener('keydown', (e) => {
      // Audio autoplay policy unlock on first interaction
      audio.ensureAudio();
      audio.startBGM();

      if (e.repeat) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.input.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.input.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyZ':
          this.input.jump = true;
          this.input.jumpJustPressed = true;
          break;
        case 'Space':
        case 'KeyX':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          this.input.transformJustPressed = true;
          break;
        case 'KeyR':
          this.restartLevel();
          break;
        case 'KeyM':
          audio.toggleMute();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.input.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.input.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyZ':
          this.input.jump = false;
          break;
      }
    });

    // Touch / On-screen Buttons
    this.setupTouchControls();
  }

  setupTouchControls() {
    const bindBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        audio.ensureAudio();
        audio.startBGM();
        if (onDown) onDown();
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        if (onUp) onUp();
      });
      el.addEventListener('pointerleave', (e) => {
        e.preventDefault();
        if (onUp) onUp();
      });
    };

    bindBtn('btn-left', () => { this.input.left = true; }, () => { this.input.left = false; });
    bindBtn('btn-right', () => { this.input.right = true; }, () => { this.input.right = false; });
    bindBtn('btn-jump', () => {
      this.input.jump = true;
      this.input.jumpJustPressed = true;
    }, () => {
      this.input.jump = false;
    });
    bindBtn('btn-transform', () => {
      this.input.transformJustPressed = true;
    }, null);
  }

  // --- MAIN LOOP ---
  start() {
    this.lastTime = performance.now();
    const frame = (time) => {
      const delta = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.accumulator += delta;
      while (this.accumulator >= this.fixedDt) {
        this.update(this.fixedDt);
        this.accumulator -= this.fixedDt;
      }

      this.render();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  update(dt) {
    this.renderer.update(dt);
    this.particles.update(dt);

    if (this.gameState === 'PLAYING') {
      // 1. Transform request
      if (this.input.transformJustPressed) {
        this.player.transform(this.particles);
        this.camera.shake(3);
        this.input.transformJustPressed = false;
      }

      // 2. Physics & Player update
      this.physics.updatePlayer(this.player, this.level, this.input, dt);
      this.player.update(dt, this.particles);

      // Reset one-frame input triggers
      this.input.jumpJustPressed = false;

      // 3. Level trigger check
      this.level.update(this.player, this.particles, dt);

      // 4. Camera Centering Smooth Follow
      this.camera.update(this.player, this.level, dt);

      // 5. Check level complete
      if (this.level.isLevelCompleted) {
        this.gameState = 'LEVEL_COMPLETE';
        this.victoryTimer = 0;
      }
    } else if (this.gameState === 'LEVEL_COMPLETE') {
      this.victoryTimer += dt;
      this.player.update(dt, this.particles);
      this.camera.update(this.player, this.level, dt);
    }

    this.updateHUD();
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Background with Parallax
    this.level.drawBackground(ctx, this.camera);

    // 2. World Coordinate Rendering
    this.camera.applyTransform(ctx);

    // Draw Tiles
    this.level.drawTiles(ctx, this.renderer, this.camera, this.player.form);

    // Draw Entities (Portal, Switches, Stars)
    this.level.drawEntities(ctx, this.renderer, this.camera);

    // Draw Player
    this.renderer.drawPlayer(ctx, this.player);

    // Draw Particles
    this.particles.draw(ctx);

    this.camera.restoreTransform(ctx);

    // 3. HUD / Overlays
    this.drawOverlays(ctx, w, h);
  }

  drawOverlays(ctx, w, h) {
    if (this.gameState === 'LEVEL_COMPLETE') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, w, h);

      // Cute Victory Card
      const cardW = 380;
      const cardH = 170;
      const cx = (w - cardW) / 2;
      const cy = (h - cardH) / 2;

      ctx.fillStyle = '#FFF5F8';
      this.renderer.roundRect(ctx, cx, cy, cardW, cardH, 16);
      ctx.fill();
      ctx.strokeStyle = '#FFB6C1';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#D90429';
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ ¡NIVEL COMPLETADO! ✨', w / 2, cy + 40);

      ctx.fillStyle = '#5A5975';
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillText(`Estrellas recogidas: ${this.level.starsCollected} / ${this.level.totalStars}`, w / 2, cy + 75);

      ctx.fillStyle = '#2B2D42';
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillText('Presiona ESPACIO o toca "Siguiente" para continuar', w / 2, cy + 115);

      ctx.restore();

      // Check keypress to advance
      if (this.input.jumpJustPressed || this.input.transformJustPressed) {
        this.input.jumpJustPressed = false;
        this.input.transformJustPressed = false;
        this.nextLevel();
      }
    } else if (this.gameState === 'GAME_ALL_COMPLETE') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, w, h);

      const cardW = 440;
      const cardH = 200;
      const cx = (w - cardW) / 2;
      const cy = (h - cardH) / 2;

      ctx.fillStyle = '#FFF5F8';
      this.renderer.roundRect(ctx, cx, cy, cardW, cardH, 16);
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#D90429';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 ¡FELICITACIONES! 🎉', w / 2, cy + 45);

      ctx.fillStyle = '#5A5975';
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillText('Has completado los 10 niveles de Vannie\'s World', w / 2, cy + 85);
      ctx.fillText('Dominaste la sincronía entre Pastel y Carmesí.', w / 2, cy + 110);

      ctx.fillStyle = '#2B2D42';
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillText('Presiona R para volver a jugar desde el Nivel 1', w / 2, cy + 155);

      ctx.restore();
    }
  }

  updateHUD() {
    const lvl = this.level.currentData;
    if (!lvl) return;

    const titleEl = document.getElementById('hud-level-title');
    const tipEl = document.getElementById('hud-level-tip');
    const formBadge = document.getElementById('hud-form-badge');
    const starsEl = document.getElementById('hud-stars');

    if (titleEl) titleEl.textContent = lvl.title;
    if (tipEl) tipEl.textContent = lvl.tip;

    if (formBadge) {
      const isPastel = this.player.form === CONSTANTS.FORMS.PASTEL;
      formBadge.textContent = isPastel ? '🌸 Forma 1: Pastel' : '🔥 Forma 2: Carmesí';
      formBadge.className = isPastel ? 'form-badge pastel-theme' : 'form-badge crimson-theme';
    }

    if (starsEl) {
      starsEl.textContent = `⭐ ${this.level.starsCollected}/${this.level.totalStars}`;
    }

    // Update level selector select element if present
    const selectEl = document.getElementById('level-select');
    if (selectEl && selectEl.value != this.currentLevelIndex) {
      selectEl.value = this.currentLevelIndex;
    }
  }
}
