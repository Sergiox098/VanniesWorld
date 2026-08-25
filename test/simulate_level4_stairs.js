const CONSTANTS = {
  TILE_SIZE: 32,
  FORMS: { PASTEL: 1, CRIMSON: 2 },
  TILE_TYPES: {
    EMPTY: 0,
    SOLID_GROUND: 1,
    SOLID_STONE: 2,
    PASTEL_CLOUD: 3,
    CRIMSON_MAGMA: 4,
    SPIKES: 5,
    PASTEL_BARRIER: 6,
    CRIMSON_BARRIER: 7
  },
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

const level4Grid = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 0
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 1
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 2
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 3
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,2], // 4: Top Switch Plat
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,2], // 5
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 6: Step 3 Cloud
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,2], // 7: Descent Magma 1
  [2,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 8: Step 2 Cloud
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,2], // 9: Barrier
  [2,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,7,0,0,0,0,2], // 10: Step 1 Cloud
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,2], // 11: Barrier
  [2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,1,1,1,1,2], // 12: Spawn & Goal
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 13
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

  // Horizontal motion
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
    // Resolve X
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

    // Resolve Y
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

console.log('=== SIMULATING PLAYER CLIMBING LEVEL 4 CELESTIAL STAIRS ===\n');

const level = new MockLevel(level4Grid);
const player = new MockPlayer(2 * 32, 11 * 32); // Spawn at (x=64, y=352)

console.log(`Starting at Spawn: (${player.x.toFixed(1)}, ${player.y.toFixed(1)}), Grounded: ${player.isGrounded}`);

let stepsReached = { step1: false, step2: false, step3: false, topPlatform: false };

const dt = 1 / 60;
for (let frame = 1; frame <= 400; frame++) {
  const input = { left: false, right: true, jumpJustPressed: false };

  // Jump commands at strategic points
  if (player.isGrounded && player.x >= 64 && player.x <= 90 && !stepsReached.step1) {
    input.jumpJustPressed = true;
  } else if (player.isGrounded && player.x >= 7 * 32 && !stepsReached.step2) {
    input.jumpJustPressed = true;
  } else if (player.isGrounded && player.x >= 11 * 32 && !stepsReached.step3) {
    input.jumpJustPressed = true;
  } else if (player.isGrounded && player.x >= 15 * 32 && !stepsReached.topPlatform) {
    input.jumpJustPressed = true;
  }

  updatePhysics(player, level, input, dt);

  const tileX = player.x / 32;
  const tileY = (player.y + 28) / 32;

  if (player.isGrounded) {
    if (tileY === 10 && tileX >= 6 && tileX <= 9 && !stepsReached.step1) {
      stepsReached.step1 = true;
      console.log(`[Frame ${frame}] ✅ Reached Stair Step 1 (Cloud Row 10) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
    }
    if (tileY === 8 && tileX >= 10 && tileX <= 13 && !stepsReached.step2) {
      stepsReached.step2 = true;
      console.log(`[Frame ${frame}] ✅ Reached Stair Step 2 (Cloud Row 8) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
    }
    if (tileY === 6 && tileX >= 14 && tileX <= 17 && !stepsReached.step3) {
      stepsReached.step3 = true;
      console.log(`[Frame ${frame}] ✅ Reached Stair Step 3 (Cloud Row 6) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
    }
    if (tileY === 4 && tileX >= 18 && tileX <= 22 && !stepsReached.topPlatform) {
      stepsReached.topPlatform = true;
      console.log(`[Frame ${frame}] 🏆 Reached TOP PLATFORM (Row 4, Switch Location) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})!`);
      break;
    }
  }
}

if (stepsReached.topPlatform) {
  console.log('\n✨ SIMULATION SUCCESS: All stairs in Level 4 can be climbed fluidly and without getting stuck!');
} else {
  console.error('\n❌ Simulation failed to climb stairs:', stepsReached);
  process.exit(1);
}
