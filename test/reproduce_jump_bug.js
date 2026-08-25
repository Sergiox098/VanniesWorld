/**
 * Test to reproduce the isGrounded bug across multiple frames
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1300;
const JUMP_FORCE = -450;
const dt = 1 / 60;

function getTile(tx, ty) {
  if (ty >= 11) return 1; // Floor at row 11 (y = 352)
  return 0;
}

let player = {
  x: 64,
  y: 324, // Standing on row 11 (352 - 28 = 324)
  vx: 0,
  vy: 0,
  isGrounded: true,
  coyoteTimer: 0.15,
  jumpBufferTimer: 0,
};

console.log('--- SIMULATION: Standing on floor for 30 frames ---');

for (let frame = 0; frame < 30; frame++) {
  // Section 2: Coyote timer update
  if (player.isGrounded) {
    player.coyoteTimer = 0.15;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);
  }

  // Section 5: Gravity
  player.vy += GRAVITY * dt;

  // Section 6: Sub-steps
  const subSteps = 2;
  const subDt = dt / subSteps;

  for (let s = 0; s < subSteps; s++) {
    const prevY = player.y;
    player.y += player.vy * subDt;

    // resolveVertical
    player.isGrounded = false;
    const startX = Math.floor((player.x + 4) / T);
    const endX = Math.floor((player.x + pw - 4) / T);
    const startY = Math.floor(player.y / T);
    const endY = Math.floor((player.y + ph) / T);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = getTile(tx, ty);
        if (tile === 1) {
          if (player.vy > 0) {
            const floorTop = ty * T;
            if (prevY + ph <= floorTop + 14) {
              player.y = floorTop - ph;
              player.vy = 0;
              player.isGrounded = true;
            }
          }
        }
      }
    }
  }

  console.log(`Frame ${frame}: isGrounded = ${player.isGrounded}, coyoteTimer = ${player.coyoteTimer.toFixed(3)}, vy = ${player.vy.toFixed(1)}`);
}

// Now test jump at frame 30:
console.log('\n--- ATTEMPTING JUMP AT FRAME 30 ---');
player.jumpBufferTimer = 0.15;
const canJump = player.jumpBufferTimer > 0 && (player.isGrounded || player.coyoteTimer > 0);
console.log(`Can jump? ${canJump ? 'YES' : 'NO (BUG CONFIRMED!)'}`);
