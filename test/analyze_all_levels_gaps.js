/**
 * Scan all 10 levels and detect any impossible gaps or excessive vertical steps.
 */

const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/const LEVELS_DATA = (\[[\s\S]*?\]);\s*\/\//);
if (!scriptMatch) {
  console.error('Could not extract LEVELS_DATA');
  process.exit(1);
}

const CONSTANTS = {
  FORMS: { PASTEL: 1, CRIMSON: 2 },
  TILE_TYPES: {
    EMPTY: 0, SOLID_GROUND: 1, SOLID_STONE: 2, PASTEL_CLOUD: 3, CRIMSON_MAGMA: 4, SPIKES: 5, PASTEL_BARRIER: 6, CRIMSON_BARRIER: 7
  },
  ENTITY_TYPES: {
    PORTAL_GOAL: 'portal_goal', COIN_STAR: 'coin_star', SWITCH_PASTEL: 'switch_pastel', SWITCH_CRIMSON: 'switch_crimson'
  }
};

const LEVELS_DATA = eval(scriptMatch[1]);

console.log(`Found ${LEVELS_DATA.length} levels. Analyzing each level for physical jump viability...\n`);

const H_MAX_TILES = 2.6; // 3.0 max theoretical, 2.6 comfortable safe limit
const D_MAX_TILES = 4.5; // 5.6 max theoretical, 4.5 comfortable safe limit

LEVELS_DATA.forEach((lvl) => {
  console.log(`=======================================================`);
  console.log(`Level ${lvl.id}: ${lvl.title} (${lvl.width}x${lvl.height})`);
  console.log(`Spawn: (${lvl.spawn.x}, ${lvl.spawn.y}), Portal: (${lvl.portal.x}, ${lvl.portal.y})`);

  // Find all platforms and walkable surfaces
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

  console.log(`Detected ${platforms.length} walkable surfaces:`);
  platforms.forEach((p, i) => {
    const typeName = p.type === 1 ? 'Ground' : p.type === 3 ? 'Cloud' : p.type === 4 ? 'Magma' : 'Barrier';
    console.log(`  [P${i+1}] Row ${p.y}: x=${p.startX}..${p.endX} (${typeName})`);
  });

  // Check transitions between successive platforms from spawn to portal
  for (let i = 0; i < platforms.length - 1; i++) {
    const p1 = platforms[i];
    const p2 = platforms[i + 1];
    const dy = p1.y - p2.y; // Positive if p2 is higher than p1
    const dx = Math.max(0, p2.startX - p1.endX);
    if (dy > H_MAX_TILES) {
      console.warn(`  ⚠️ WARNING: Step from P${i+1}(Row ${p1.y}) to P${i+2}(Row ${p2.y}) is ${dy} tiles high (> ${H_MAX_TILES} max)!`);
    }
    if (dx > D_MAX_TILES) {
      console.warn(`  ⚠️ WARNING: Gap between P${i+1} and P${i+2} is ${dx} tiles wide (> ${D_MAX_TILES} max)!`);
    }
  }
});
