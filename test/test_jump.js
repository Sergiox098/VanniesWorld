/**
 * Test jump simulation and collision resolution
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1300;
const JUMP_FORCE = -450;
const SPEED_X = 224;

// Simple grid: row 11 is floor (1), row 0 is ceiling (2), row 1..10 is empty (0)
function getTile(tx, ty) {
  if (ty >= 11) return 1;
  if (ty <= 0) return 2;
  return 0;
}

function isSolidV(tile) {
  return tile === 1 || tile === 2;
}

let player = {
  x: 64,
  y: 324, // Standing on row 11 (11 * 32 - 28 = 324)
  vx: 0,
  vy: 0,
  isGrounded: true,
};

console.log('Initial player position:', player);

// Trigger jump
player.vy = JUMP_FORCE;
player.isGrounded = false;
console.log('Jump initiated: vy =', player.vy);

const dt = 1 / 60;
let highestY = player.y;
let frames = 0;

for (let f = 0; f < 60; f++) {
  player.vy += GRAVITY * dt;

  const prevY = player.y;
  player.y += player.vy * dt;

  // Resolve vertical collision with proper ceiling/floor logic
  const startX = Math.floor((player.x + 4) / T);
  const endX = Math.floor((player.x + pw - 4) / T);
  const startY = Math.floor(player.y / T);
  const endY = Math.floor((player.y + ph) / T);

  player.isGrounded = false;

  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      const tile = getTile(tx, ty);
      if (isSolidV(tile)) {
        if (player.vy > 0) {
          // Falling into floor
          const floorTop = ty * T;
          if (prevY + ph <= floorTop + 12) {
            player.y = floorTop - ph;
            player.vy = 0;
            player.isGrounded = true;
          }
        } else if (player.vy < 0) {
          // Jumping into ceiling
          const ceilingBottom = (ty + 1) * T;
          if (prevY >= ceilingBottom - 12) {
            player.y = ceilingBottom;
            player.vy = 0;
          }
        }
      }
    }
  }

  if (player.y < highestY) {
    highestY = player.y;
  }

  if (f < 10 || player.isGrounded) {
    console.log(`Frame ${f}: y = ${player.y.toFixed(2)}, vy = ${player.vy.toFixed(2)}, isGrounded = ${player.isGrounded}`);
  }

  if (player.isGrounded && f > 2) {
    console.log(`Landed at frame ${f}`);
    break;
  }
}

const heightReachedPx = 324 - highestY;
const heightReachedTiles = heightReachedPx / T;
console.log(`\nJump Results:`);
console.log(`- Peak Height Reached: ${heightReachedPx.toFixed(2)} px (${heightReachedTiles.toFixed(2)} tiles)`);
console.log(`- Jump Success: ${heightReachedPx > 64 ? 'YES (> 2 tiles)' : 'NO'}`);
