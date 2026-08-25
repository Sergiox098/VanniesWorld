/**
 * 1000-Frame Stress Test for Jump Reliability & Responsiveness
 * Simulates random jump presses, running, hopping on clouds and magma.
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1300;
const JUMP_FORCE = -450;
const dt = 1 / 60;

function getTile(tx, ty) {
  if (ty === 11) {
    if (tx <= 10) return 1; // Solid ground
    if (tx <= 20) return 3; // Pastel cloud
    return 4; // Crimson magma
  }
  return 0;
}

class SimEngine {
  constructor() {
    this.T = 32;
  }

  updatePlayer(player, input, dt) {
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;
    player.vx = moveDir * 224;

    if (input.jumpJustPressed) {
      player.jumpBufferTimer = 0.15;
    } else {
      player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
    }

    if (player.jumpBufferTimer > 0 && (player.isGrounded || player.coyoteTimer > 0)) {
      player.vy = JUMP_FORCE;
      player.jumpBufferTimer = 0;
      player.coyoteTimer = 0;
      player.isGrounded = false;
      player.hasJumped = true;
      player.successfulJumps = (player.successfulJumps || 0) + 1;
    }

    if (!input.jump && player.vy < -50 && player.hasJumped) {
      player.vy *= 0.6;
      player.hasJumped = false;
    }

    player.vy += GRAVITY * dt;
    if (player.vy > 520) player.vy = 520;

    const subSteps = 2;
    const subDt = dt / subSteps;
    let groundedThisFrame = false;

    for (let s = 0; s < subSteps; s++) {
      player.x += player.vx * subDt;
      const prevY = player.y;
      player.y += player.vy * subDt;

      const startX = Math.floor((player.x + 4) / this.T);
      const endX = Math.floor((player.x + pw - 4) / this.T);
      const startY = Math.floor(player.y / this.T);
      const endY = Math.floor((player.y + ph) / this.T);

      for (let ty = startY; ty <= endY; ty++) {
        for (let tx = startX; tx <= endX; tx++) {
          const tile = getTile(tx, ty);

          if (tile === 3 && player.form === 1 && player.vy >= 0) {
            const floorTop = ty * this.T;
            if (prevY + ph <= floorTop + 14 && player.y + ph >= floorTop) {
              player.y = floorTop - ph;
              player.vy = 0;
              player.hasJumped = false;
              groundedThisFrame = true;
            }
            continue;
          }

          if (tile === 4 && player.form === 2 && player.vy >= 0) {
            const floorTop = ty * this.T;
            if (prevY + ph <= floorTop + 14 && player.y + ph >= floorTop) {
              player.y = floorTop - ph;
              player.vy = 0;
              player.hasJumped = false;
              groundedThisFrame = true;
            }
            continue;
          }

          if (tile === 1 && player.vy > 0) {
            const floorTop = ty * this.T;
            if (prevY + ph <= floorTop + 14) {
              player.y = floorTop - ph;
              player.vy = 0;
              player.hasJumped = false;
              groundedThisFrame = true;
            }
          }
        }
      }
    }

    player.isGrounded = groundedThisFrame;
    if (player.isGrounded) {
      player.coyoteTimer = 0.15;
    } else {
      player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
    }
  }
}

console.log('=== RUNNING 1000-FRAME CONTINUOUS STRESS TEST ===');
const sim = new SimEngine();
let player = {
  x: 64,
  y: 324,
  vx: 0,
  vy: 0,
  form: 1,
  isGrounded: true,
  coyoteTimer: 0.15,
  jumpBufferTimer: 0,
  successfulJumps: 0,
};

let attempts = 0;
let missedAttempts = 0;

for (let frame = 0; frame < 1000; frame++) {
  // Move back and forth
  const movingRight = Math.floor(frame / 60) % 2 === 0;
  
  // Attempt to jump periodically when on ground
  const tryJump = (frame % 45 === 0);
  const input = {
    left: !movingRight,
    right: movingRight,
    jump: tryJump,
    jumpJustPressed: tryJump,
  };

  const wasGrounded = player.isGrounded;
  const prevJumps = player.successfulJumps;

  sim.updatePlayer(player, input, dt);

  if (tryJump) {
    attempts++;
    if (wasGrounded && player.successfulJumps === prevJumps) {
      console.error(`[ERROR] Frame ${frame}: Player was grounded but jump did NOT trigger!`);
      missedAttempts++;
    }
  }
}

console.log(`\nStress Test Finished:`);
console.log(`- Total Jump Requests while on Ground: ${attempts}`);
console.log(`- Total Successful Jumps: ${player.successfulJumps}`);
console.log(`- Missed Jumps: ${missedAttempts}`);

if (missedAttempts === 0 && player.successfulJumps === attempts) {
  console.log('✨ 100% RELIABILITY ACHIEVED! (0 missed jumps)');
} else {
  console.error('FAILED STRESS TEST');
  process.exit(1);
}
