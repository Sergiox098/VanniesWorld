/**
 * Mathematical Trajectory & Playability Analysis of all 10 Levels
 */

const T = 32;
const pw = 24;
const ph = 28;
const GRAVITY = 1200;
const JUMP_FORCE = -480;
const SPEED_X = 224;
const dt = 1 / 60;

console.log('=== KINEMATIC TRAJECTORY CONSTANTS ===');
const H_max = (JUMP_FORCE * JUMP_FORCE) / (2 * GRAVITY);
const t_peak = -JUMP_FORCE / GRAVITY;
const t_hang = 2 * t_peak;
const D_max = SPEED_X * t_hang;
console.log(`H_max (Peak Height)      = ${H_max.toFixed(2)} px (${(H_max/T).toFixed(2)} tiles)`);
console.log(`t_peak (Time to Apex)    = ${t_peak.toFixed(2)} s (${Math.round(t_peak * 60)} frames)`);
console.log(`t_hang (Total Hang Time) = ${t_hang.toFixed(2)} s (${Math.round(t_hang * 60)} frames)`);
console.log(`D_max (Max Jump Dist)    = ${D_max.toFixed(2)} px (${(D_max/T).toFixed(2)} tiles)`);
console.log('Safe Step-Up: <= 2 tiles (64 px) | Safe Flat Gap: <= 4 tiles (128 px)\n');
