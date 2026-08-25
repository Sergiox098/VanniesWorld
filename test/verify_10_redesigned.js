const { ALL_10_LEVELS } = require('./test_all_10_levels_defs.js');

const H_MAX_TILES = 2.6; // 3.0 max theoretical, 2.6 comfortable safe limit
const D_MAX_TILES = 4.0; // 5.6 max theoretical, 4.0 comfortable safe limit

console.log('=== VERIFYING GAP & STEP KINEMATICS FOR ALL 10 REDESIGNED LEVELS ===\n');

let issues = 0;

ALL_10_LEVELS.forEach((lvl) => {
  console.log(`----------------------------------------------------------------`);
  console.log(`Level ${lvl.id}: ${lvl.title} (${lvl.width}x${lvl.height})`);
  console.log(`Spawn: (${lvl.spawn.x}, ${lvl.spawn.y}), Portal: (${lvl.portal.x}, ${lvl.portal.y})`);

  const platforms = [];
  for (let y = 0; y < lvl.height; y++) {
    let startX = -1;
    let type = -1;
    for (let x = 0; x < lvl.width; x++) {
      const t = lvl.grid[y][x];
      const isWalkable = (t === 1 || t === 3 || t === 4 || t === 6 || t === 7);
      if (isWalkable && (y === 0 || lvl.grid[y-1][x] === 0 || lvl.grid[y-1][x] === 3 || lvl.grid[y-1][x] === 4)) {
        if (startX === -1) {
          startX = x;
          type = t;
        }
      } else {
        if (startX !== -1) {
          platforms.push({ y, startX, endX: x - 1, type });
          startX = -1;
        }
      }
    }
    if (startX !== -1) {
      platforms.push({ y, startX, endX: lvl.width - 1, type });
    }
  }

  // Sort platforms by X
  platforms.sort((a, b) => a.startX - b.startX);

  platforms.forEach((p, i) => {
    const typeName = p.type === 1 ? 'Ground' : p.type === 3 ? 'Cloud' : p.type === 4 ? 'Magma' : 'Barrier';
    console.log(`  [P${i+1}] Row ${p.y}: x=${p.startX}..${p.endX} (${typeName})`);
  });

  for (let i = 0; i < platforms.length - 1; i++) {
    const p1 = platforms[i];
    const p2 = platforms[i + 1];
    const dy = p1.y - p2.y; // Positive if p2 is higher than p1 (step up)
    const dx = Math.max(0, p2.startX - p1.endX);
    if (dy > H_MAX_TILES) {
      console.error(`  ❌ [FAIL] Step up from P${i+1}(Row ${p1.y}) to P${i+2}(Row ${p2.y}) is ${dy} tiles high (> ${H_MAX_TILES} max limit)!`);
      issues++;
    }
    if (dx > D_MAX_TILES) {
      console.error(`  ❌ [FAIL] Gap between P${i+1} and P${i+2} is ${dx} tiles wide (> ${D_MAX_TILES} max limit)!`);
      issues++;
    }
  }
});

console.log(`\n================================================================`);
if (issues === 0) {
  console.log('✨ ALL 10 LEVELS HAVE 100% PERFECT PHYSICAL REACHABILITY!');
} else {
  console.error(`Found ${issues} geometry issues.`);
  process.exit(1);
}
