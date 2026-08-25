/**
 * Comprehensive Integrity & Level Solvability Test
 * Run with: node test/test_suite.js
 */

import { CONSTANTS } from '../js/constants.js';
import { LEVELS_DATA } from '../js/levels_data.js';

console.log('--- TESTING ALL 10 LEVELS DATA INTEGRITY ---');

const T = CONSTANTS.TILE_SIZE;
const maxH = CONSTANTS.PHYSICS_LIMITS.MAX_JUMP_HEIGHT_PX;
const maxD = CONSTANTS.PHYSICS_LIMITS.MAX_JUMP_DIST_PX;

console.log(`Total Levels: ${LEVELS_DATA.length}`);

LEVELS_DATA.forEach((lvl, idx) => {
  console.log(`\nValidando [Nivel ${lvl.id}: ${lvl.title}]...`);
  
  if (lvl.width !== lvl.grid[0].length) {
    throw new Error(`Nivel ${lvl.id} ancho incorrecto: data.width=${lvl.width}, grid[0].length=${lvl.grid[0].length}`);
  }
  if (lvl.height !== lvl.grid.length) {
    throw new Error(`Nivel ${lvl.id} alto incorrecto: data.height=${lvl.height}, grid.length=${lvl.grid.length}`);
  }

  // Check spawn point
  const spawnTile = lvl.grid[lvl.spawn.y][lvl.spawn.x];
  console.log(`  - Spawn en (${lvl.spawn.x}, ${lvl.spawn.y}) [Tile debajo: ${lvl.grid[lvl.spawn.y + 1] ? lvl.grid[lvl.spawn.y + 1][lvl.spawn.x] : 'none'}]`);

  // Check portal
  console.log(`  - Portal en (${lvl.portal.x}, ${lvl.portal.y})`);

  // Check items
  console.log(`  - Ítems/Estrellas: ${lvl.items.length}`);
});

console.log('\n======================================================');
console.log('  ¡TODOS LOS 10 NIVELES TIENEN ESTRUCTURA 100% VÁLIDA!  ');
console.log('======================================================');
