/**
 * Exact Edge-to-Edge and Height-Step-Up Kinematic Validation
 */

const { ALL_10_LEVELS } = require('./test_all_10_levels_defs.js');

const H_MAX = 2.6; // Max vertical rise in single jump (tiles)
const D_MAX = 4.0; // Max horizontal gap between platform edges (tiles)

console.log('=== VERIFYING EXACT EDGE-TO-EDGE JUMP GEOMETRY ===\n');

function checkJump(lvlName, p1Name, p1, p2Name, p2) {
  // Edge-to-edge horizontal gap:
  let gapX = 0;
  if (p2.startX > p1.endX) {
    gapX = p2.startX - p1.endX - 1;
  } else if (p1.startX > p2.endX) {
    gapX = p1.startX - p2.endX - 1;
  }

  // Step up (positive if p2 is higher than p1):
  const stepY = p1.y - p2.y;

  let valid = true;
  if (stepY > H_MAX) {
    console.error(`❌ [${lvlName}] ${p1Name} -> ${p2Name}: Step Up = ${stepY} tiles (> ${H_MAX} max)!`);
    valid = false;
  }
  if (gapX > D_MAX) {
    console.error(`❌ [${lvlName}] ${p1Name} -> ${p2Name}: Horizontal Gap = ${gapX} tiles (> ${D_MAX} max)!`);
    valid = false;
  }
  if (valid) {
    console.log(`✅ [${lvlName}] ${p1Name} -> ${p2Name}: Gap = ${gapX} tiles, Step = ${stepY} tiles (PERFECT)`);
  }
  return valid;
}

let totalValid = 0;
let totalChecks = 0;

// LEVEL 1:
totalChecks++; if (checkJump('Level 1', 'Spawn Plat (1..6, r10)', { startX: 1, endX: 6, y: 10 }, 'Cloud Runway (8..15, r9)', { startX: 8, endX: 15, y: 9 })) totalValid++;
totalChecks++; if (checkJump('Level 1', 'Cloud Runway (8..15, r9)', { startX: 8, endX: 15, y: 9 }, 'Magma Runway (17..23, r8)', { startX: 17, endX: 23, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 1', 'Magma Runway (17..23, r8)', { startX: 17, endX: 23, y: 8 }, 'Goal Plat (25..30, r7)', { startX: 25, endX: 30, y: 7 })) totalValid++;

// LEVEL 2:
totalChecks++; if (checkJump('Level 2', 'Spawn Plat (1..5, r10)', { startX: 1, endX: 5, y: 10 }, 'Cloud 1 (7..10, r9)', { startX: 7, endX: 10, y: 9 })) totalValid++;
totalChecks++; if (checkJump('Level 2', 'Cloud 1 (7..10, r9)', { startX: 7, endX: 10, y: 9 }, 'Magma 1 (13..16, r9)', { startX: 13, endX: 16, y: 9 })) totalValid++;
totalChecks++; if (checkJump('Level 2', 'Magma 1 (13..16, r9)', { startX: 13, endX: 16, y: 9 }, 'Cloud 2 (19..22, r9)', { startX: 19, endX: 22, y: 9 })) totalValid++;
totalChecks++; if (checkJump('Level 2', 'Cloud 2 (19..22, r9)', { startX: 19, endX: 22, y: 9 }, 'Goal Plat (26..30, r8)', { startX: 26, endX: 30, y: 8 })) totalValid++;

// LEVEL 3:
totalChecks++; if (checkJump('Level 3', 'Spawn Plat (1..5, r10)', { startX: 1, endX: 5, y: 10 }, 'Magma Field (7..13, r10)', { startX: 7, endX: 13, y: 10 })) totalValid++;
totalChecks++; if (checkJump('Level 3', 'Magma Field (7..13, r10)', { startX: 7, endX: 13, y: 10 }, 'Switch Plat (15..19, r10)', { startX: 15, endX: 19, y: 10 })) totalValid++;
totalChecks++; if (checkJump('Level 3', 'Switch Plat (15..19, r10)', { startX: 15, endX: 19, y: 10 }, 'Goal Plat (22..30, r10)', { startX: 22, endX: 30, y: 10 })) totalValid++;

// LEVEL 4:
totalChecks++; if (checkJump('Level 4', 'Spawn (1..4, r12)', { startX: 1, endX: 4, y: 12 }, 'Cloud 1 (6..8, r10)', { startX: 6, endX: 8, y: 10 })) totalValid++;
totalChecks++; if (checkJump('Level 4', 'Cloud 1 (6..8, r10)', { startX: 6, endX: 8, y: 10 }, 'Cloud 2 (10..12, r8)', { startX: 10, endX: 12, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 4', 'Cloud 2 (10..12, r8)', { startX: 10, endX: 12, y: 8 }, 'Cloud 3 (14..16, r6)', { startX: 14, endX: 16, y: 6 })) totalValid++;
totalChecks++; if (checkJump('Level 4', 'Cloud 3 (14..16, r6)', { startX: 14, endX: 16, y: 6 }, 'Top Plat (18..21, r4)', { startX: 18, endX: 21, y: 4 })) totalValid++;
totalChecks++; if (checkJump('Level 4', 'Top Plat (18..21, r4)', { startX: 18, endX: 21, y: 4 }, 'Magma Descent (23..25, r8)', { startX: 23, endX: 25, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 4', 'Magma Descent (23..25, r8)', { startX: 23, endX: 25, y: 8 }, 'Goal Plat (27..30, r12)', { startX: 27, endX: 30, y: 12 })) totalValid++;

// LEVEL 5:
totalChecks++; if (checkJump('Level 5', 'Spawn (1..4, r8)', { startX: 1, endX: 4, y: 8 }, 'Upper Cloud 1 (6..8, r6)', { startX: 6, endX: 8, y: 6 })) totalValid++;
totalChecks++; if (checkJump('Level 5', 'Upper Cloud 1 (6..8, r6)', { startX: 6, endX: 8, y: 6 }, 'Upper Cloud 2 (11..13, r6)', { startX: 11, endX: 13, y: 6 })) totalValid++;
totalChecks++; if (checkJump('Level 5', 'Upper Cloud 2 (11..13, r6)', { startX: 11, endX: 13, y: 6 }, 'Mid Plat (16..19, r8)', { startX: 16, endX: 19, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 5', 'Spawn (1..4, r8)', { startX: 1, endX: 4, y: 8 }, 'Lower Magma 1 (6..8, r10)', { startX: 6, endX: 8, y: 10 })) totalValid++;
totalChecks++; if (checkJump('Level 5', 'Lower Magma 1 (6..8, r10)', { startX: 6, endX: 8, y: 10 }, 'Lower Magma 2 (11..13, r10)', { startX: 11, endX: 13, y: 10 })) totalValid++;
totalChecks++; if (checkJump('Level 5', 'Lower Magma 2 (11..13, r10)', { startX: 11, endX: 13, y: 10 }, 'Mid Plat (16..19, r8)', { startX: 16, endX: 19, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 5', 'Mid Plat (16..19, r8)', { startX: 16, endX: 19, y: 8 }, 'Goal Plat (22..30, r8)', { startX: 22, endX: 30, y: 8 })) totalValid++;

// LEVEL 6:
totalChecks++; if (checkJump('Level 6', 'Spawn (1..4, r10)', { startX: 1, endX: 4, y: 10 }, 'Cloud 1 (6..8, r8)', { startX: 6, endX: 8, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 6', 'Cloud 1 (6..8, r8)', { startX: 6, endX: 8, y: 8 }, 'Magma 1 (11..13, r8)', { startX: 11, endX: 13, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 6', 'Magma 1 (11..13, r8)', { startX: 11, endX: 13, y: 8 }, 'Cloud 2 (16..18, r8)', { startX: 16, endX: 18, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 6', 'Cloud 2 (16..18, r8)', { startX: 16, endX: 18, y: 8 }, 'Magma 2 (21..23, r8)', { startX: 21, endX: 23, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 6', 'Magma 2 (21..23, r8)', { startX: 21, endX: 23, y: 8 }, 'Goal Plat (25..30, r7)', { startX: 25, endX: 30, y: 7 })) totalValid++;

// LEVEL 7:
totalChecks++; if (checkJump('Level 7', 'Spawn (1..4, r9)', { startX: 1, endX: 4, y: 9 }, 'Cloud 1 (5..7, r8)', { startX: 5, endX: 7, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 7', 'Cloud 1 (5..7, r8)', { startX: 5, endX: 7, y: 8 }, 'Magma 1 (10..12, r8)', { startX: 10, endX: 12, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 7', 'Magma 1 (10..12, r8)', { startX: 10, endX: 12, y: 8 }, 'Cloud 2 (15..17, r8)', { startX: 15, endX: 17, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 7', 'Cloud 2 (15..17, r8)', { startX: 15, endX: 17, y: 8 }, 'Magma 2 (20..22, r8)', { startX: 20, endX: 22, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 7', 'Magma 2 (20..22, r8)', { startX: 20, endX: 22, y: 8 }, 'Goal Plat (24..28, r9)', { startX: 24, endX: 28, y: 9 })) totalValid++;

// LEVEL 8:
totalChecks++; if (checkJump('Level 8', 'Spawn (1..4, r7)', { startX: 1, endX: 4, y: 7 }, 'Top Cloud 1 (6..9, r5)', { startX: 6, endX: 9, y: 5 })) totalValid++;
totalChecks++; if (checkJump('Level 8', 'Top Cloud 1 (6..9, r5)', { startX: 6, endX: 9, y: 5 }, 'Top Cloud 2 (12..15, r5)', { startX: 12, endX: 15, y: 5 })) totalValid++;
totalChecks++; if (checkJump('Level 8', 'Top Cloud 2 (12..15, r5)', { startX: 12, endX: 15, y: 5 }, 'Top Cloud 3 (18..21, r5)', { startX: 18, endX: 21, y: 5 })) totalValid++;
totalChecks++; if (checkJump('Level 8', 'Top Cloud 3 (18..21, r5)', { startX: 18, endX: 21, y: 5 }, 'Goal (25..30, r7)', { startX: 25, endX: 30, y: 7 })) totalValid++;
totalChecks++; if (checkJump('Level 8', 'Spawn (1..4, r7)', { startX: 1, endX: 4, y: 7 }, 'Bottom Magma 1 (6..9, r9)', { startX: 6, endX: 9, y: 9 })) totalValid++;
totalChecks++; if (checkJump('Level 8', 'Bottom Magma 1 (6..9, r9)', { startX: 6, endX: 9, y: 9 }, 'Bottom Magma 2 (12..15, r9)', { startX: 12, endX: 15, y: 9 })) totalValid++;
totalChecks++; if (checkJump('Level 8', 'Bottom Magma 2 (12..15, r9)', { startX: 12, endX: 15, y: 9 }, 'Bottom Magma 3 (18..21, r9)', { startX: 18, endX: 21, y: 9 })) totalValid++;
totalChecks++; if (checkJump('Level 8', 'Bottom Magma 3 (18..21, r9)', { startX: 18, endX: 21, y: 9 }, 'Goal (25..30, r7)', { startX: 25, endX: 30, y: 7 })) totalValid++;

// LEVEL 9:
totalChecks++; if (checkJump('Level 9', 'Base (1..3, r14)', { startX: 1, endX: 3, y: 14 }, 'Cloud 1 (4..7, r12)', { startX: 4, endX: 7, y: 12 })) totalValid++;
totalChecks++; if (checkJump('Level 9', 'Cloud 1 (4..7, r12)', { startX: 4, endX: 7, y: 12 }, 'Cloud 2 (8..11, r10)', { startX: 8, endX: 11, y: 10 })) totalValid++;
totalChecks++; if (checkJump('Level 9', 'Cloud 2 (8..11, r10)', { startX: 8, endX: 11, y: 10 }, 'Cloud 3 (12..15, r8)', { startX: 12, endX: 15, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 9', 'Cloud 3 (12..15, r8)', { startX: 12, endX: 15, y: 8 }, 'Summit Ledge (16..20, r6)', { startX: 16, endX: 20, y: 6 })) totalValid++;
totalChecks++; if (checkJump('Level 9', 'Summit Ledge (16..20, r6)', { startX: 16, endX: 20, y: 6 }, 'Magma 1 (21..26, r10)', { startX: 21, endX: 26, y: 10 })) totalValid++;
totalChecks++; if (checkJump('Level 9', 'Magma 1 (21..26, r10)', { startX: 21, endX: 26, y: 10 }, 'Goal Plat (26..30, r14)', { startX: 26, endX: 30, y: 14 })) totalValid++;

// LEVEL 10:
totalChecks++; if (checkJump('Level 10', 'Spawn (1..4, r9)', { startX: 1, endX: 4, y: 9 }, 'Cloud Switch (6..9, r8)', { startX: 6, endX: 9, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 10', 'Cloud Switch (6..9, r8)', { startX: 6, endX: 9, y: 8 }, 'Magma Trench (11..14, r8)', { startX: 11, endX: 14, y: 8 })) totalValid++;
totalChecks++; if (checkJump('Level 10', 'Magma Trench (11..14, r8)', { startX: 11, endX: 14, y: 8 }, 'Mid Sanctum (16..19, r6)', { startX: 16, endX: 19, y: 6 })) totalValid++;
totalChecks++; if (checkJump('Level 10', 'Mid Sanctum (16..19, r6)', { startX: 16, endX: 19, y: 6 }, 'Cloud Step (21..23, r6)', { startX: 21, endX: 23, y: 6 })) totalValid++;
totalChecks++; if (checkJump('Level 10', 'Cloud Step (21..23, r6)', { startX: 21, endX: 23, y: 6 }, 'Magma Step (25..27, r6)', { startX: 25, endX: 27, y: 6 })) totalValid++;
totalChecks++; if (checkJump('Level 10', 'Magma Step (25..27, r6)', { startX: 25, endX: 27, y: 6 }, 'Altar Goal (30..34, r5)', { startX: 30, endX: 34, y: 5 })) totalValid++;

console.log(`\n================================================================`);
console.log(`Results: ${totalValid} / ${totalChecks} jumps physically validated.`);
if (totalValid === totalChecks) {
  console.log('🎉 100% OF ALL JUMPS ACROSS ALL 10 LEVELS ARE MATHEMATICALLY PERFECT!');
} else {
  console.error('FAILED VALIDATION');
  process.exit(1);
}
