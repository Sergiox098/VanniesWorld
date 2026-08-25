/**
 * Comprehensive physics simulation test for 100% reliable jumping
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1300;
const JUMP_FORCE = -450;
const SPEED_X = 224;
const dt = 1 / 60;

class MockPhysics {
  constructor() {
    this.T = 32;
    this.COYOTE_TIME = 0.15;
    this.JUMP_BUFFER = 0.15;
    this.JUMP_FORCE = -450;
    this.GRAVITY = 1300;
    this.SPEED_X = 224;
    this.TERMINAL_VELOCITY = 520;
    this.JUMP_CUT_MULTIPLIER = 0.6;
  }

  getTile(tx, ty) {
    if (ty >= 11) return 1; // Solid floor at row 11 (y = 352)
    if (ty <= 0) return 2;  // Ceiling at row 0
    return 0;
  }

  isSolid(tile) {
    return tile === 1 || tile === 2;
  }

  update(player, input) {
    // 1. Horizontal
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;
    player.vx = moveDir * this.SPEED_X;

    // 2. Timers
    if (input.jumpJustPressed) {
      player.jumpBufferTimer = this.JUMP_BUFFER;
    } else {
      player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
    }

    // 3. Jump Execution
    if (player.jumpBufferTimer > 0 && (player.isGrounded || player.coyoteTimer > 0)) {
      player.vy = this.JUMP_FORCE;
      player.jumpBufferTimer = 0;
      player.coyoteTimer = 0;
      player.isGrounded = false;
      player.hasJumped = true;
      player.jumpCount = (player.jumpCount || 0) + 1;
    }

    // Variable jump cut
    if (!input.jump && player.vy < -50 && player.hasJumped) {
      player.vy *= this.JUMP_CUT_MULTIPLIER;
      player.hasJumped = false;
    }

    // 4. Gravity
    player.vy += this.GRAVITY * dt;
    if (player.vy > this.TERMINAL_VELOCITY) player.vy = this.TERMINAL_VELOCITY;

    // 5. Sub-steps
    const subSteps = 2;
    const subDt = dt / subSteps;
    let groundedThisFrame = false;

    for (let s = 0; s < subSteps; s++) {
      // Horizontal
      player.x += player.vx * subDt;

      // Vertical
      const prevY = player.y;
      player.y += player.vy * subDt;

      const startX = Math.floor((player.x + 4) / this.T);
      const endX = Math.floor((player.x + pw - 4) / this.T);
      const startY = Math.floor(player.y / this.T);
      const endY = Math.floor((player.y + ph) / this.T);

      for (let ty = startY; ty <= endY; ty++) {
        for (let tx = startX; tx <= endX; tx++) {
          const tile = this.getTile(tx, ty);
          if (this.isSolid(tile)) {
            if (player.vy > 0) {
              const floorTop = ty * this.T;
              if (prevY + ph <= floorTop + 14) {
                player.y = floorTop - ph;
                player.vy = 0;
                groundedThisFrame = true;
                player.hasJumped = false;
              }
            } else if (player.vy < 0) {
              const ceilingBottom = (ty + 1) * this.T;
              if (prevY >= ceilingBottom - 14 && player.y <= ceilingBottom) {
                player.y = ceilingBottom;
                player.vy = 0;
              }
            }
          }
        }
      }
    }

    // Update grounded state & coyote timer
    player.isGrounded = groundedThisFrame;
    if (player.isGrounded) {
      player.coyoteTimer = this.COYOTE_TIME;
    } else {
      player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
    }
  }
}

// SIMULATION 1: Stand on floor for 200 frames, test jump at frame 50, 100, 150
console.log('=== SIMULATION 1: Multiple Jumps while Standing/Walking ===');
const physics = new MockPhysics();
let player = {
  x: 64,
  y: 324,
  vx: 0,
  vy: 0,
  isGrounded: true,
  coyoteTimer: 0.15,
  jumpBufferTimer: 0,
  jumpCount: 0,
};

let jumpsSuccessful = 0;
const testJumpFrames = [20, 70, 120, 170, 220, 270, 320, 370, 420, 470];

for (let f = 0; f < 500; f++) {
  const isJumpFrame = testJumpFrames.includes(f);
  const input = {
    left: false,
    right: f > 50 && f < 250, // Walking right part of the time
    jump: isJumpFrame,
    jumpJustPressed: isJumpFrame,
  };

  const prevJumps = player.jumpCount;
  physics.update(player, input);

  if (isJumpFrame) {
    if (player.jumpCount > prevJumps) {
      jumpsSuccessful++;
      console.log(`[PASS] Jump triggered successfully at Frame ${f} (isGrounded before = ${player.isGrounded}, vy = ${player.vy.toFixed(1)})`);
    } else {
      console.error(`[FAIL] Jump FAILED at Frame ${f}! isGrounded = ${player.isGrounded}, coyoteTimer = ${player.coyoteTimer}`);
    }
  }
}

console.log(`\nResults: ${jumpsSuccessful} / ${testJumpFrames.length} jumps succeeded.`);
if (jumpsSuccessful === testJumpFrames.length) {
  console.log('✨ ALL 10 JUMP ATTEMPTS PASSED 100% RELIABLY!');
} else {
  console.error('FAILURES DETECTED');
  process.exit(1);
}
