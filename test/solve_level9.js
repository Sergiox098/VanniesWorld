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
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 0: World Ceiling
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 1: Open Sky
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 2: Open Sky
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 3: Open Sky
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 4: Open Sky
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 5: Open Sky
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,2], // 6: Summit Ledge (16..20)
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2], // 7
  [2,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 8: Cloud 3 (12..15)
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 9
  [2,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,2], // 10: Cloud 2 (8..11), Magma 1 (21..26)
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 11
  [2,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 12: Cloud 1 (4..7)
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 13
  [2,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2], // 14: Base Spawn (1..3), Goal (26..30)
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 15
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

console.log('=== SIMULATING COMPLETE LEVEL 9 PLAYTHROUGH ===\n');

const level = new MockLevel(level9Grid);
const player = new MockPlayer(2 * 32, 13 * 32); // Spawn at Row 14 (y = 13 * 32 = 416)

let stage = 1;
const dt = 1 / 60;
let reachedPortal = false;

for (let frame = 1; frame <= 1000; frame++) {
  const input = { left: false, right: false, jumpJustPressed: false };

  // 1. From Base (Row 14, x=1..3) -> Jump to Cloud 1 (Row 12, x=4..6)
  if (stage === 1) {
    input.right = true;
    if (player.isGrounded && player.x >= 2 * 32) input.jumpJustPressed = true;
    if (player.isGrounded && Math.abs((player.y + 28) / 32 - 12) < 0.1 && player.x >= 4 * 32) {
      console.log(`[Frame ${frame}] ✅ Stage 1: Landed on Cloud 1 (Row 12) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      stage = 2;
    }
  }
  // 2. From Cloud 1 (Row 12) -> Jump to Cloud 2 (Row 10, x=8..10)
  else if (stage === 2) {
    input.right = true;
    if (player.isGrounded && player.x >= 5 * 32) input.jumpJustPressed = true;
    if (player.isGrounded && Math.abs((player.y + 28) / 32 - 10) < 0.1 && player.x >= 8 * 32) {
      console.log(`[Frame ${frame}] ✅ Stage 2: Landed on Cloud 2 (Row 10) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      stage = 3;
    }
  }
  // 3. From Cloud 2 (Row 10) -> Jump to Cloud 3 (Row 8, x=12..14)
  else if (stage === 3) {
    input.right = true;
    if (player.isGrounded && player.x >= 9 * 32) input.jumpJustPressed = true;
    if (player.isGrounded && Math.abs((player.y + 28) / 32 - 8) < 0.1 && player.x >= 12 * 32) {
      console.log(`[Frame ${frame}] ✅ Stage 3: Landed on Cloud 3 (Row 8) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      stage = 4;
    }
  }
  // 4. From Cloud 3 (Row 8) -> Jump to Summit Solid Ledge (Row 6, x=16..19)
  else if (stage === 4) {
    input.right = true;
    if (player.isGrounded && player.x >= 13 * 32) input.jumpJustPressed = true;
    if (player.isGrounded && Math.abs((player.y + 28) / 32 - 6) < 0.1 && player.x >= 16 * 32) {
      console.log(`[Frame ${frame}] ✅ Stage 4: Landed on Summit Solid Ledge (Row 6) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      player.form = CONSTANTS.FORMS.CRIMSON; // Safely switch on stone to Demon!
      console.log(`[Frame ${frame}] 😈 Transformed safely to Form 2 (Carmesí) on solid stone.`);
      stage = 5;
    }
  }
  // 5. From Summit Ledge (Row 6, x=16..20) -> Jump down to Magma 1 (Row 10, x=21..24)
  else if (stage === 5) {
    input.right = true;
    if (player.isGrounded && player.x >= 18 * 32) input.jumpJustPressed = true;
    if (player.isGrounded && Math.abs((player.y + 28) / 32 - 10) < 0.1 && player.x >= 21 * 32) {
      console.log(`[Frame ${frame}] ✅ Stage 5: Landed on Magma 1 (Row 10) at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
      stage = 6;
    }
  }
  // 6. From Magma 1 (Row 10, x=21..24) -> Jump down to Goal (Row 14, x=26..30)
  else if (stage === 6) {
    input.right = true;
    if (player.isGrounded && player.x >= 22.5 * 32) input.jumpJustPressed = true;
    if (player.isGrounded && Math.abs((player.y + 28) / 32 - 14) < 0.1 && player.x >= 26 * 32) {
      console.log(`[Frame ${frame}] 🏆 REACHED GOAL PLATFORM at (${player.x.toFixed(1)}, ${player.y.toFixed(1)})!`);
      reachedPortal = true;
      break;
    }
  }

  updatePhysics(player, level, input, dt);

  if (frame >= 158 && frame <= 220) {
    console.log(`[Frame ${frame}] stage: ${stage}, x: ${player.x.toFixed(1)}, y: ${player.y.toFixed(1)}, vx: ${player.vx.toFixed(1)}, vy: ${player.vy.toFixed(1)}, gr: ${player.isGrounded}, form: ${player.form}`);
  }
}

if (reachedPortal) {
  console.log('\n🎉 LEVEL 9 COMPLETED 100% IN FULL SIMULATION!');
} else {
  console.error('\n❌ Level 9 simulation stopped at stage', stage);
  process.exit(1);
}
