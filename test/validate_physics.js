/**
 * Physics Kinematics & Level 1 Solvability Validator
 * Run with: node test/validate_physics.js
 */

import { CONSTANTS } from '../js/constants.js';

console.log('====================================================');
console.log("  VANNIE'S WORLD - TECHNICAL VALIDATION OF PHYSICS  ");
console.log('====================================================\n');

const T = CONSTANTS.TILE_SIZE;
const p = CONSTANTS.PLAYER;

// 1. Exact Analytical Kinematics
const t_peak = Math.abs(p.JUMP_FORCE) / p.GRAVITY;
const h_max_px = (p.JUMP_FORCE * p.JUMP_FORCE) / (2 * p.GRAVITY);
const h_max_tiles = h_max_px / T;
const t_hang = 2 * t_peak;
const d_max_px = p.SPEED_X * t_hang;
const d_max_tiles = d_max_px / T;

console.log('1. CÁLCULOS ANALÍTICOS:');
console.log(`- Velocidad Horizontal (vx): ${p.SPEED_X} px/s (${(p.SPEED_X / T).toFixed(2)} tiles/s)`);
console.log(`- Impulso de Salto (v0): ${p.JUMP_FORCE} px/s (${(p.JUMP_FORCE / T).toFixed(2)} tiles/s)`);
console.log(`- Gravedad (g): ${p.GRAVITY} px/s² (${(p.GRAVITY / T).toFixed(2)} tiles/s²)`);
console.log(`- Tiempo a la cúspide (t_peak): ${t_peak.toFixed(4)} s`);
console.log(`- Altura Máxima de Salto (H_max): ${h_max_px.toFixed(2)} px (${h_max_tiles.toFixed(3)} tiles)`);
console.log(`- Tiempo total de vuelo en llano (T_hang): ${t_hang.toFixed(4)} s`);
console.log(`- Distancia Horizontal Máxima en Llano (D_max): ${d_max_px.toFixed(2)} px (${d_max_tiles.toFixed(3)} tiles)\n`);

// 2. Numerical Frame-by-Frame Simulation (60 FPS, dt = 1/60s)
console.log('2. SIMULACIÓN NUMÉRICA PASO A PASO (60 FPS):');
const dt = 1 / 60;
let simY = 0;
let simVy = p.JUMP_FORCE;
let maxSimHeight = 0;
let simTime = 0;
let simX = 0;

while (simVy < 0 || simY < 0) {
  simVy += p.GRAVITY * dt;
  if (simVy > p.TERMINAL_VELOCITY) simVy = p.TERMINAL_VELOCITY;
  simY += simVy * dt;
  simX += p.SPEED_X * dt;
  simTime += dt;

  if (-simY > maxSimHeight) {
    maxSimHeight = -simY;
  }
}

console.log(`- Altura simulación: ${maxSimHeight.toFixed(2)} px (${(maxSimHeight / T).toFixed(3)} tiles)`);
console.log(`- Distancia simulación: ${simX.toFixed(2)} px (${(simX / T).toFixed(3)} tiles)`);
console.log(`- Tiempo total simulación: ${simTime.toFixed(4)} s\n`);

// 3. Validation assertions
console.log('3. VALIDACIÓN DE LÍMITES CRÍTICOS:');

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exit(1);
  }
}

assert(h_max_tiles > 2.0, `Salto supera holgadamente 2 tiles de altura (${h_max_tiles.toFixed(2)} > 2.0)`);
assert(h_max_tiles < 3.0, `Salto NO supera 3 tiles de altura sin apoyo (${h_max_tiles.toFixed(2)} < 3.0)`);
assert(d_max_tiles > 4.0, `Salto horizontal supera 4 tiles de distancia (${d_max_tiles.toFixed(2)} > 4.0)`);
assert(d_max_tiles < 5.0, `Salto horizontal NO supera 5 tiles de distancia sin ayuda (${d_max_tiles.toFixed(2)} < 5.0)`);

// 4. Level 1 Obstacles Solvability Check
console.log('\n4. VALIDACIÓN DE OBSTÁCULOS DEL NIVEL 1:');

const level1Obstacles = [
  { name: 'Abismo 1 (Inicio a Plataforma Media)', gapTiles: 2, heightDiffTiles: 0, requiredForm: 'any' },
  { name: 'Escalón a Plataforma Elevada', gapTiles: 1, heightDiffTiles: 2, requiredForm: 'any' },
  { name: 'Acceso a Nube Pastel', gapTiles: 1, heightDiffTiles: 1, requiredForm: 'pastel' },
  { name: 'Travesía sobre Magma Ardiente', gapTiles: 3, heightDiffTiles: 0, requiredForm: 'crimson' },
  { name: 'Salto hacia Plataforma de Meta', gapTiles: 2, heightDiffTiles: 0, requiredForm: 'any' },
];

for (const obs of level1Obstacles) {
  const gapPx = obs.gapTiles * T;
  const heightPx = obs.heightDiffTiles * T;
  const isHorizontallyReachable = gapPx <= d_max_px;
  const isVerticallyReachable = heightPx <= h_max_px;

  assert(
    isHorizontallyReachable && isVerticallyReachable,
    `${obs.name}: Gap ${obs.gapTiles}t (${gapPx}px <= ${d_max_px.toFixed(1)}px), Altura ${obs.heightDiffTiles}t (${heightPx}px <= ${h_max_px.toFixed(1)}px) [Forma requerida: ${obs.requiredForm.toUpperCase()}]`
  );
}

console.log('\n====================================================');
console.log('  TODOS LOS REQUISITOS FÍSICOS FUERON VALIDADOS OK  ');
console.log('====================================================');
