const CONSTANTS = {
  TILE_SIZE: 32,
  FORMS: { PASTEL: 1, CRIMSON: 2 },
  PLAYER: {
    WIDTH: 24,
    HEIGHT: 28,
    SPEED: 224,
    ACCEL: 2400,
    FRICTION: 2600,
    GRAVITY: 1200,
    JUMP_IMPULSE: -480,
    COYOTE_TIME: 0.18,
    JUMP_BUFFER: 0.18,
  }
};

const level9Grid = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 0
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 1
  [2,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,2], // 2: Summit Goal (Portal at 11, 1)
  [2,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,2], // 3
  [2,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,2], // 4: Step 5 Cloud
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 5
  [2,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0,2], // 6: Step 4 Magma
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 7
  [2,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,2], // 8: Step 3 Cloud
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 9
  [2,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0,2], // 10: Step 2 Magma
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 11
  [2,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,2], // 12: Step 1 Cloud
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 13
  [2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 14: Base Ground (Spawn at 2, 13)
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 15
];

class MockLevel {
  constructor(grid) {
    this.grid = grid;
    this.heightInTiles = grid.length;
    this.widthInTiles = grid[0].length;
  }
  getTile(tx, ty) {
    if (tx < 0 || tx >= this.widthInTiles || ty < 0 || ty >= this.heightInTiles) return 2;
    return this.grid[ty][tx];
  }
}

class MockPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.form = CONSTANTS.FORMS.PASTEL;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
  }
}

function updatePhysics(player, level, input, dt) {
  const T = 32;
  const pw = CONSTANTS.PLAYER.WIDTH;
  const ph = CONSTANTS.PLAYER.HEIGHT;

  if (input.jumpJustPressed) player.jumpBufferTimer = CONSTANTS.PLAYER.JUMP_BUFFER;
  if (player.isGrounded) player.coyoteTimer = CONSTANTS.PLAYER.COYOTE_TIME;
  else player.coyoteTimer -= dt;

  if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
    player.vy = CONSTANTS.PLAYER.JUMP_IMPULSE;
    player.isGrounded = false;
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
  }

  let targetVx = 0;
  if (input.right) targetVx = CONSTANTS.PLAYER.SPEED;
  else if (input.left) targetVx = -CONSTANTS.PLAYER.SPEED;

  if (targetVx !== 0) {
    player.vx += (targetVx - player.vx) * Math.min(1, CONSTANTS.PLAYER.ACCEL * dt / CONSTANTS.PLAYER.SPEED);
  } else {
    player.vx += (0 - player.vx) * Math.min(1, CONSTANTS.PLAYER.FRICTION * dt / CONSTANTS.PLAYER.SPEED);
  }

  const subSteps = 3;
  const subDt = dt / subSteps;
  let groundedThisFrame = false;

  for (let s = 0; s < subSteps; s++) {
    player.vy += CONSTANTS.PLAYER.GRAVITY * subDt;

    // Move X
    player.x += player.vx * subDt;
    const startX = Math.floor(player.x / T);
    const endX = Math.floor((player.x + pw - 0.01) / T);
    const startY = Math.floor((player.y + 4) / T);
    const endY = Math.floor((player.y + ph - 4) / T);
    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = level.getTile(tx, ty);
        if (tile === 1 || tile === 2) {
          if (player.vx > 0) { player.x = tx * T - pw; player.vx = 0; }
          else if (player.vx < 0) { player.x = (tx + 1) * T; player.vx = 0; }
        }
      }
    }

    // Move Y
    const prevY = player.y;
    player.y += player.vy * subDt;

    const vStartX = Math.floor((player.x + 4) / T);
    const vEndX = Math.floor((player.x + pw - 4) / T);
    const vStartY = Math.floor(player.y / T);
    const vEndY = Math.floor((player.y + ph) / T);

    for (let ty = vStartY; ty <= vEndY; ty++) {
      for (let tx = vStartX; tx <= vEndX; tx++) {
        const tile = level.getTile(tx, ty);

        // One-way cloud
        if (tile === 3 && player.form === 1 && player.vy >= 0) {
          const floorTop = ty * T;
          if (prevY + ph <= floorTop + 24 && player.y + ph >= floorTop) {
            player.y = floorTop - ph;
            player.vy = 0;
            groundedThisFrame = true;
          }
        }
        // One-way magma
        else if (tile === 4 && player.form === 2 && player.vy >= 0) {
          const floorTop = ty * T;
          if (prevY + ph <= floorTop + 24 && player.y + ph >= floorTop) {
            player.y = floorTop - ph;
            player.vy = 0;
            groundedThisFrame = true;
          }
        }
        // Solid
        else if (tile === 1 || tile === 2) {
          if (player.vy > 0) {
            const floorTop = ty * T;
            if (prevY + ph <= floorTop + 24) {
              player.y = floorTop - ph;
              player.vy = 0;
              groundedThisFrame = true;
            }
          }
        }
      }
    }
  }

  player.isGrounded = groundedThisFrame;
}

console.log('=== SIMULATING LEVEL 9 TOWER CLIMB ===\n');
const level = new MockLevel(level9Grid);
const player = new MockPlayer(2 * 32, 13 * 32); // Spawn at row 13/14

let reachedSummit = false;
let currentStage = 1;
const dt = 1 / 60;

for (let frame = 1; frame <= 800; frame++) {
  const input = { left: false, right: false, jumpJustPressed: false };

  // Stage 1: Climb from Base (Row 14) to Step 1 Cloud (Row 12)
  if (currentStage === 1) {
    input.right = true;
    if (player.isGrounded && player.x >= 64) { input.jumpJustPressed = true; }
    if (player.isGrounded && (player.y + 28) / 32 === 12) {
      console.log(`[Frame ${frame}] ✅ Reached Step 1 Cloud (Row 12) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      player.form = 2; // Transform to Crimson for Magma
      currentStage = 2;
    }
  }
  // Stage 2: Climb from Step 1 Cloud (Row 12) to Step 2 Magma (Row 10)
  else if (currentStage === 2) {
    input.right = true;
    if (player.isGrounded && player.x >= 6 * 32) { input.jumpJustPressed = true; }
    if (player.isGrounded && (player.y + 28) / 32 === 10) {
      console.log(`[Frame ${frame}] ✅ Reached Step 2 Magma (Row 10) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      player.form = 1; // Transform to Pastel for Cloud
      currentStage = 3;
    }
  }
  // Stage 3: Climb from Step 2 Magma (Row 10) to Step 3 Cloud (Row 8)
  else if (currentStage === 3) {
    input.left = true;
    if (player.isGrounded && player.x <= 11 * 32) { input.jumpJustPressed = true; }
    if (player.isGrounded && (player.y + 28) / 32 === 8) {
      console.log(`[Frame ${frame}] ✅ Reached Step 3 Cloud (Row 8) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      player.form = 2; // Transform to Crimson for Magma
      currentStage = 4;
    }
  }
  // Stage 4: Climb from Step 3 Cloud (Row 8) to Step 4 Magma (Row 6)
  else if (currentStage === 4) {
    input.right = true;
    if (player.isGrounded && player.x >= 6 * 32) { input.jumpJustPressed = true; }
    if (player.isGrounded && (player.y + 28) / 32 === 6) {
      console.log(`[Frame ${frame}] ✅ Reached Step 4 Magma (Row 6) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      currentStage = 5;
    }
  }
  // Stage 5: Climb from Step 4 Magma (Row 6) to Step 5 Cloud (Row 4)
  else if (currentStage === 5) {
    input.left = true;
    if (player.isGrounded && player.x <= 11 * 32) {
      input.jumpJustPressed = true;
      player.form = 1; // Transform to Pastel in-air
    }
    if (player.isGrounded && (player.y + 28) / 32 === 4) {
      console.log(`[Frame ${frame}] ✅ Reached Step 5 Cloud (Row 4) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      currentStage = 6;
    }
  }
  // Stage 6: Climb from Step 5 Cloud (Row 4) to Summit Goal (Row 2)
  else if (currentStage === 6) {
    input.right = true;
    if (player.isGrounded && player.x >= 6 * 32) { input.jumpJustPressed = true; }
    if (player.isGrounded && (player.y + 28) / 32 === 2) {
      console.log(`[Frame ${frame}] 🏆 Reached Summit Goal (Row 2) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})!`);
      reachedSummit = true;
      break;
    }
  }

  updatePhysics(player, level, input, dt);
}

if (reachedSummit) {
  console.log('\n✨ SIMULATION SUCCESS: Level 9 Zigzag Ascent operates flawlessly!');
} else {
  console.error('\n❌ Level 9 simulation failed at stage', currentStage);
  process.exit(1);
}
