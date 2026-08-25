/**
 * Multi-surface jumping & transformation test
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1300;
const JUMP_FORCE = -450;
const dt = 1 / 60;

// Grid with:
// x 0..10: Ground (1)
// x 11..20: Pastel Cloud (3)
// x 21..30: Crimson Magma (4)
function getTile(tx, ty) {
  if (ty === 11) {
    if (tx <= 10) return 1;
    if (tx <= 20) return 3;
    return 4;
  }
  return 0;
}

function updatePlayer(player, input) {
  // Horizontal
  let moveDir = 0;
  if (input.left) moveDir -= 1;
  if (input.right) moveDir += 1;
  player.vx = moveDir * 224;

  // Timers
  if (input.jumpJustPressed) {
    player.jumpBufferTimer = 0.15;
  } else {
    player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
  }

  // Jump execution
  if (player.jumpBufferTimer > 0 && (player.isGrounded || player.coyoteTimer > 0)) {
    player.vy = JUMP_FORCE;
    player.jumpBufferTimer = 0;
    player.coyoteTimer = 0;
    player.isGrounded = false;
    player.hasJumped = true;
    player.jumpsDone = (player.jumpsDone || 0) + 1;
  }

  // Variable jump
  if (!input.jump && player.vy < -50 && player.hasJumped) {
    player.vy *= 0.6;
    player.hasJumped = false;
  }

  // Gravity
  player.vy += GRAVITY * dt;
  if (player.vy > 520) player.vy = 520;

  // Sub-steps
  const subSteps = 2;
  const subDt = dt / subSteps;
  let groundedThisFrame = false;

  for (let s = 0; s < subSteps; s++) {
    player.x += player.vx * subDt;
    const prevY = player.y;
    player.y += player.vy * subDt;

    const startX = Math.floor((player.x + 4) / T);
    const endX = Math.floor((player.x + pw - 4) / T);
    const startY = Math.floor(player.y / T);
    const endY = Math.floor((player.y + ph) / T);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = getTile(tx, ty);

        // Pastel Cloud
        if (tile === 3) {
          if (player.form === 1 && player.vy >= 0) {
            const floorTop = ty * T;
            if (prevY + ph <= floorTop + 14) {
              player.y = floorTop - ph;
              player.vy = 0;
              groundedThisFrame = true;
              player.hasJumped = false;
            }
          }
          continue;
        }

        // Magma
        if (tile === 4) {
          if (player.form === 2 && player.vy >= 0) {
            const floorTop = ty * T;
            if (prevY + ph <= floorTop + 14) {
              player.y = floorTop - ph;
              player.vy = 0;
              groundedThisFrame = true;
              player.hasJumped = false;
            }
          }
          continue;
        }

        // Solid Ground
        if (tile === 1) {
          if (player.vy > 0) {
            const floorTop = ty * T;
            if (prevY + ph <= floorTop + 14) {
              player.y = floorTop - ph;
              player.vy = 0;
              groundedThisFrame = true;
              player.hasJumped = false;
            }
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

// TEST: Pastel jumps on Cloud
console.log('Test 1: Pastel Form jumping on Pastel Cloud...');
let p1 = { x: 15 * 32, y: 324, vx: 0, vy: 0, form: 1, isGrounded: true, coyoteTimer: 0.15, jumpBufferTimer: 0, jumpsDone: 0 };
for (let f = 0; f < 60; f++) {
  updatePlayer(p1, { jump: f === 20, jumpJustPressed: f === 20 });
}
console.log(`- Pastel jumped on cloud: ${p1.jumpsDone === 1 ? 'PASS' : 'FAIL'}`);

// TEST: Crimson jumps on Magma
console.log('Test 2: Crimson Form jumping on Crimson Magma...');
let p2 = { x: 25 * 32, y: 324, vx: 0, vy: 0, form: 2, isGrounded: true, coyoteTimer: 0.15, jumpBufferTimer: 0, jumpsDone: 0 };
for (let f = 0; f < 60; f++) {
  updatePlayer(p2, { jump: f === 20, jumpJustPressed: f === 20 });
}
console.log(`- Crimson jumped on magma: ${p2.jumpsDone === 1 ? 'PASS' : 'FAIL'}`);

if (p1.jumpsDone === 1 && p2.jumpsDone === 1) {
  console.log('\n✨ ALL MULTI-SURFACE JUMP SIMULATIONS PASSED 100%!');
} else {
  process.exit(1);
}
