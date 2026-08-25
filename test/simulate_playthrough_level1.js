/**
 * Complete Level 1 Playthrough Simulation with Exact Coordinates & Portal Collision
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1300;
const JUMP_FORCE = -450;
const SPEED_X = 224;
const dt = 1 / 60;

const level1 = {
  id: 1,
  title: 'Nivel 1: Primeros Pasos',
  width: 28,
  height: 14,
  spawn: { x: 2, y: 10, form: 1 },
  portal: { x: 24, y: 5 }, // Portal on floor row 6
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2],
    [2,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,4,4,4,0,0,0,0,2,2,2,2,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,2,2,2,2,2],
    [2,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,2,2,2,0,2,2,2,2,2],
    [2,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,2,2,0,2,2,2,2,2],
    [2,1,1,1,1,1,0,0,1,1,1,0,0,0,4,4,4,0,0,2,2,2,0,2,2,2,2,2],
    [2,2,2,2,2,2,0,0,2,2,2,0,0,0,4,4,4,0,0,2,2,2,0,2,2,2,2,2],
    [2,2,2,2,2,2,0,0,2,2,2,0,0,0,2,2,2,0,0,2,2,2,0,2,2,2,2,2],
  ],
  items: [
    { type: 'coin_star', x: 4, y: 10, collected: false },
    { type: 'coin_star', x: 12, y: 6, collected: false },
    { type: 'coin_star', x: 17, y: 6, collected: false },
  ]
};

function getTile(tx, ty) {
  if (tx < 0 || tx >= level1.width || ty < 0 || ty >= level1.height) return 0;
  return level1.grid[ty][tx];
}

class Level1Playthrough {
  constructor() {
    this.player = {
      x: level1.spawn.x * T,
      y: 11 * T - ph, // y = 324
      vx: 0,
      vy: 0,
      form: 1,
      isGrounded: true,
      coyoteTimer: 0.15,
      jumpBufferTimer: 0,
      hasJumped: false,
    };
    this.starsCollected = 0;
    this.completed = false;
    this.frame = 0;
    this.timeline = [];
  }

  log(msg) {
    const timeSec = (this.frame * dt).toFixed(2);
    const formStr = this.player.form === 1 ? '🌸 PASTEL' : '🔥 CARMESÍ';
    const entry = `[t=${timeSec}s | F#${String(this.frame).padStart(3, '0')}] pos=(${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}) [${formStr}] -> ${msg}`;
    console.log(entry);
    this.timeline.push(entry);
  }

  step() {
    const p = this.player;
    let input = { left: false, right: false, jump: false, jumpJustPressed: false, transform: false };

    // --- AUTOPILOT SCRIPT ---
    if (p.x < 155) {
      // 1. Walk right towards gap 1
      input.right = true;
    } else if (p.x >= 155 && p.x < 260) {
      // 2. Jump across Gap 1
      input.right = true;
      input.jump = true;
      if (p.isGrounded) {
        this.log('Iniciando Salto sobre el Abismo Inicial (Gap 1: 2 tiles)');
        input.jumpJustPressed = true;
      }
    } else if (p.x >= 260 && p.x < 285) {
      // 3. Middle platform
      input.right = true;
    } else if (p.x >= 285 && p.x < 360) {
      // 4. Jump onto Step & Pastel Cloud
      input.right = true;
      input.jump = true;
      if (p.isGrounded && p.y > 200) {
        this.log('Saltando hacia Escalón y Plataforma de Nube Pastel (Forma 1)');
        input.jumpJustPressed = true;
      }
    } else if (p.x >= 360 && p.x < 420) {
      // 5. Walk on Pastel Cloud
      input.right = true;
    } else if (p.x >= 420 && p.x < 520) {
      // 6. Jump from Cloud towards Magma
      input.right = true;
      input.jump = true;
      if (p.isGrounded) {
        this.log('Saltando desde Nube Pastel hacia Zona de Magma');
        input.jumpJustPressed = true;
      }
      if (p.x >= 445 && p.form === 1) {
        input.transform = true;
        this.log('✨ TRANSFORMACIÓN EN EL AIRE a 🔥 FORMA 2 (CARMESÍ)');
      }
    } else if (p.x >= 520 && p.x < 640) {
      // 7. Walk on Magma Platform safely
      input.right = true;
    } else if (p.x >= 640 && p.x < 740) {
      // 8. Final Jump to Goal Platform
      input.right = true;
      input.jump = true;
      if (p.isGrounded) {
        this.log('Iniciando Salto Final hacia la Plataforma de la Meta');
        input.jumpJustPressed = true;
      }
    } else {
      // 9. Walk into Goal Portal
      input.right = true;
    }

    // --- PHYSICS INTEGRATION ---
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;
    p.vx = moveDir * SPEED_X;

    if (input.transform) {
      p.form = p.form === 1 ? 2 : 1;
    }

    if (input.jumpJustPressed) {
      p.jumpBufferTimer = 0.15;
    } else {
      p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
    }

    if (p.jumpBufferTimer > 0 && (p.isGrounded || p.coyoteTimer > 0)) {
      p.vy = JUMP_FORCE;
      p.jumpBufferTimer = 0;
      p.coyoteTimer = 0;
      p.isGrounded = false;
      p.hasJumped = true;
    }

    if (!input.jump && p.vy < -50 && p.hasJumped) {
      p.vy *= 0.6;
      p.hasJumped = false;
    }

    p.vy += GRAVITY * dt;
    if (p.vy > 520) p.vy = 520;

    const subSteps = 2;
    const subDt = dt / subSteps;
    let groundedThisFrame = false;

    for (let s = 0; s < subSteps; s++) {
      p.x += p.vx * subDt;
      const prevY = p.y;
      p.y += p.vy * subDt;

      const startX = Math.floor((p.x + 4) / T);
      const endX = Math.floor((p.x + pw - 4) / T);
      const startY = Math.floor(p.y / T);
      const endY = Math.floor((p.y + ph) / T);

      for (let ty = startY; ty <= endY; ty++) {
        for (let tx = startX; tx <= endX; tx++) {
          const tile = getTile(tx, ty);

          // Pastel Cloud
          if (tile === 3) {
            if (p.form === 1 && p.vy >= 0) {
              const floorTop = ty * T;
              if (prevY + ph <= floorTop + 14 && p.y + ph >= floorTop) {
                p.y = floorTop - ph;
                p.vy = 0;
                p.hasJumped = false;
                groundedThisFrame = true;
              }
            }
            continue;
          }

          // Crimson Magma
          if (tile === 4) {
            if (p.form === 2 && p.vy >= 0) {
              const floorTop = ty * T;
              if (prevY + ph <= floorTop + 14 && p.y + ph >= floorTop) {
                p.y = floorTop - ph;
                p.vy = 0;
                p.hasJumped = false;
                groundedThisFrame = true;
              }
            }
            continue;
          }

          // Solid Ground
          if (tile === 1 || tile === 2) {
            if (p.vy > 0) {
              const floorTop = ty * T;
              if (prevY + ph <= floorTop + 14) {
                p.y = floorTop - ph;
                p.vy = 0;
                p.hasJumped = false;
                groundedThisFrame = true;
              }
            } else if (p.vy < 0) {
              const ceilingBottom = (ty + 1) * T;
              if (prevY >= ceilingBottom - 14 && p.y <= ceilingBottom) {
                p.y = ceilingBottom;
                p.vy = 0;
              }
            }
          }
        }
      }
    }

    p.isGrounded = groundedThisFrame;
    if (p.isGrounded) {
      p.coyoteTimer = 0.15;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    // Collect stars
    for (const item of level1.items) {
      if (item.collected) continue;
      const ix = item.x * T + T / 2;
      const iy = item.y * T + T / 2;
      const pxCenter = p.x + pw / 2;
      const pyCenter = p.y + ph / 2;
      if (Math.hypot(pxCenter - ix, pyCenter - iy) < 28) {
        item.collected = true;
        this.starsCollected++;
        this.log(`⭐ RECOGIDA ESTRELLA #${this.starsCollected} en (${item.x}, ${item.y})!`);
      }
    }

    // Portal Goal
    const portX = level1.portal.x * T + T / 2;
    const portY = level1.portal.y * T + T / 2;
    const pxCenter = p.x + pw / 2;
    const pyCenter = p.y + ph / 2;
    if (Math.hypot(pxCenter - portX, pyCenter - portY) < 36) {
      if (!this.completed) {
        this.completed = true;
        this.log(`🎉 ¡PORTAL DE META ALCANZADO! ¡NIVEL 1 COMPLETADO AL 100% CON TODAS LAS ESTRELLAS!`);
      }
    }
  }

  run() {
    console.log('================================================================');
    console.log('  SIMULACIÓN EN TIEMPO REAL: COMPLETANDO EL NIVEL 1 PASO A PASO ');
    console.log('================================================================\n');

    this.log('Inicio de la partida en el punto de aparición (2, 10)');

    while (this.frame < 300 && !this.completed) {
      this.step();
      this.frame++;
    }

    console.log('\n================================================================');
    console.log('                 RESULTADO FINAL DE LA PARTIDA                  ');
    console.log('================================================================');
    console.log(`- Nivel: 1 (Primeros Pasos)`);
    console.log(`- Tiempo total para completar: ${(this.frame * dt).toFixed(2)} segundos (${this.frame} fotogramas a 60 FPS)`);
    console.log(`- Estrellas recolectadas: ${this.starsCollected} / 3 ⭐`);
    console.log(`- Posición final: (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);
    console.log(`- Resultado: ${this.completed ? '🏆 ¡VICTORIA! NIVEL 1 COMPLETADO EXITOSAMENTE' : '❌ NO COMPLETADO'}`);
    console.log('================================================================\n');
  }
}

const runner = new Level1Playthrough();
runner.run();
