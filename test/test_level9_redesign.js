const fs = require('fs');

const LEVEL_9_REDESIGN = {
  id: 9,
  title: 'Nivel 9: Ascenso Volcánico',
  subtitle: 'Escala la torre alternando entre calor y ligereza',
  tip: 'Usa los descansos de piedra para cambiar de forma con seguridad.',
  width: 32,
  height: 14,
  spawn: { x: 2, y: 11, form: 1 },
  portal: { x: 2, y: 3 },
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 0
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 1
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 2
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 3
    [2,1,1,1,1,0,0,4,4,4,0,0,3,3,3,0,1,1,1,1,0,0,4,4,4,0,0,1,1,1,1,2], // 4: Top Summit, Magma, Cloud, Ledge 2, Magma, Top Right
    [2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,2,2,2,2,2], // 5
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], // 6
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,2], // 7: Safe Ledge 1 (16..20)
    [2,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2], // 8: Step 2 Cloud (11..13)
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2], // 9
    [2,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2], // 10: Step 1 Cloud (6..8)
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2], // 11
    [2,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2], // 12: Base Spawn (1..5)
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2], // 13
  ],
  items: [
    { type: 'coin_star', x: 7, y: 9 },
    { type: 'coin_star', x: 12, y: 7 },
    { type: 'coin_star', x: 18, y: 6 },
    { type: 'coin_star', x: 24, y: 3 },
    { type: 'coin_star', x: 9, y: 3 },
  ]
};

console.log('=== VERIFYING REDESIGNED LEVEL 9 TRAJECTORIES ===');

function check(p1Name, p1, p2Name, p2) {
  const gapX = p2.startX > p1.endX ? p2.startX - p1.endX - 1 : p1.startX - p2.endX - 1;
  const stepY = p1.y - p2.y;
  console.log(`${p1Name} -> ${p2Name}: Gap = ${gapX} tiles, Step = ${stepY} tiles`);
  if (stepY > 2.6 || gapX > 3.5) {
    console.error('❌ FAILED jump criteria!');
    process.exit(1);
  }
}

// 1. Base (1..5, r12) -> Step 1 Cloud (6..8, r10)
check('Base (1..5, r12)', { startX: 1, endX: 5, y: 12 }, 'Cloud 1 (6..8, r10)', { startX: 6, endX: 8, y: 10 });

// 2. Cloud 1 (6..8, r10) -> Cloud 2 (11..13, r8)
check('Cloud 1 (6..8, r10)', { startX: 6, endX: 8, y: 10 }, 'Cloud 2 (11..13, r8)', { startX: 11, endX: 13, y: 8 });

// 3. Cloud 2 (11..13, r8) -> Safe Ledge 1 (16..20, r7)
check('Cloud 2 (11..13, r8)', { startX: 11, endX: 13, y: 8 }, 'Safe Ledge 1 (16..20, r7)', { startX: 16, endX: 20, y: 7 });

// 4. Safe Ledge 1 (16..20, r7) -> Magma 1 (22..24, r4) [jump up from ledge to magma runway]
// From r7 to r4 is 3 tiles. Let's make Safe Ledge 1 at Row 6 so step up is only 2 tiles!
