/**
 * Test to verify the new, intuitive, ultra-smooth Level 1 design
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1200;
const JUMP_FORCE = -480;
const SPEED_X = 224;
const dt = 1 / 60;

const level1 = {
  id: 1,
  title: 'Nivel 1: Primeros Pasos',
  subtitle: 'Aprende a transformar entre Forma Pastel y Forma Carmesí',
  tip: '¡La Forma Pastel pisa nubes! ¡Pulsa Cambio (Shift/X) para caminar sobre magma!',
  width: 32,
  height: 12,
  spawn: { x: 2, y: 9, form: 1 },
  portal: { x: 28, y: 6 },
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 0
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 1
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 2
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 3
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 4
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 5
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 6
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,2], // 7 -> Goal platform 25..30
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,0,2,2,2,2,2,2,2], // 8 -> Magma runway 17..23
    [2,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2], // 9 -> Cloud runway 8..15
    [2,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2], // 10 -> Spawn platform 1..6
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 11 -> Base
  ],
  items: [
    { type: 'coin_star', x: 4, y: 9, collected: false },
    { type: 'coin_star', x: 12, y: 8, collected: false },
    { type: 'coin_star', x: 20, y: 7, collected: false },
  ]
};

function getTile(tx, ty) {
  if (tx < 0 || tx >= level1.width || ty < 0 || ty >= level1.height) return 0;
  return level1.grid[ty][tx];
}

class TestSim {
  constructor() {
    this.player = {
      x: level1.spawn.x * T,
      y: 10 * T - ph, // Standing on row 10 (320 - 28 = 292)
      vx: 0,
      vy: 0,
      form: 1,
      isGrounded: true,
      coyoteTimer: 0.18,
      jumpBufferTimer: 0,
      hasJumped: false,
    };
    this.starsCollected = 0;
    this.completed = false;
    this.frame = 0;
  }

  log(msg) {
    const timeSec = (this.frame * dt).toFixed(2);
    const formStr = this.player.form === 1 ? '🌸 PASTEL' : '🔥 CARMESÍ';
    console.log(`[t=${timeSec}s | F#${String(this.frame).padStart(3, '0')}] (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}) [${formStr}] -> ${msg}`);
  }

  step() {
    const p = this.player;
    let input = { left: false, right: false, jump: false, jumpJustPressed: false, transform: false };

    // Simple, relaxed player inputs:
    if (p.x < 180) {
      // Walk on start platform
      input.right = true;
    } else if (p.x >= 180 && p.x < 260) {
      // Gentle jump from start platform to Cloud runway
      input.right = true;
      input.jump = true;
      if (p.isGrounded) {
        this.log('Salto suave hacia la pista de Nubes Pastel');
        input.jumpJustPressed = true;
      }
    } else if (p.x >= 260 && p.x < 460) {
      // Walk along the soft Cloud Runway
      input.right = true;
    } else if (p.x >= 460 && p.x < 550) {
      // Jump from Cloud to Magma runway
      input.right = true;
      input.jump = true;
      if (p.isGrounded) {
        this.log('Salto hacia la pista de Magma Ardiente');
        input.jumpJustPressed = true;
      }
      if (p.x >= 490 && p.form === 1) {
        input.transform = true;
        this.log('✨ TRANSFORMACIÓN a Forma Carmesí (Inmune a la lava)');
      }
    } else if (p.x >= 550 && p.x < 720) {
      // Walk along Magma runway
      input.right = true;
    } else if (p.x >= 720 && p.x < 810) {
      // Jump from Magma to Goal platform
      input.right = true;
      input.jump = true;
      if (p.isGrounded) {
        this.log('Salto final hacia la plataforma de la Meta');
        input.jumpJustPressed = true;
      }
    } else {
      // Walk into Portal
      input.right = true;
    }

    // Physics
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;
    p.vx = moveDir * SPEED_X;

    if (input.transform) {
      p.form = p.form === 1 ? 2 : 1;
    }

    if (input.jumpJustPressed) {
      p.jumpBufferTimer = 0.18;
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
      p.coyoteTimer = 0.18;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    // Stars
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

    // Portal
    const portX = level1.portal.x * T + T / 2;
    const portY = level1.portal.y * T + T / 2;
    const pxCenter = p.x + pw / 2;
    const pyCenter = p.y + ph / 2;
    if (Math.hypot(pxCenter - portX, pyCenter - portY) < 32) {
      if (!this.completed) {
        this.completed = true;
        this.log(`🎉 ¡PORTAL DE META ALCANZADO! ¡NIVEL 1 COMPLETADO!`);
      }
    }
  }

  run() {
    console.log('--- TEST RUNNER: NEW LEVEL 1 ---');
    while (this.frame < 300 && !this.completed) {
      this.step();
      this.frame++;
    }
    console.log(`Finished in ${(this.frame * dt).toFixed(2)}s | Stars: ${this.starsCollected}/3 | Victory: ${this.completed ? 'YES' : 'NO'}`);
  }
}

new TestSim().run();
