/**
 * Route-based kinematic path validator
 */

function validateRoute(lvlName, routeName, waypoints, hMax = 2.6, dMax = 4.0) {
  for (let i = 0; i < waypoints.length - 1; i++) {
    const w1 = waypoints[i];
    const w2 = waypoints[i + 1];
    const dy = w1.y - w2.y; // Step up if positive
    const dx = Math.abs(w2.x - w1.x);

    if (dy > hMax) {
      console.error(`[${lvlName}] Route "${routeName}" FAIL: Step up from (${w1.x}, ${w1.y}) to (${w2.x}, ${w2.y}) is ${dy.toFixed(1)} tiles (> ${hMax} max)`);
      return false;
    }
    if (dx > dMax && dy <= 0) {
      console.error(`[${lvlName}] Route "${routeName}" FAIL: Gap between (${w1.x}, ${w1.y}) and (${w2.x}, ${w2.y}) is ${dx.toFixed(1)} tiles (> ${dMax} max)`);
      return false;
    }
  }
  console.log(`[${lvlName}] Route "${routeName}": ✅ 100% VALID`);
  return true;
}

// Test Level 1:
validateRoute('Level 1', 'Main', [
  { x: 4, y: 10 }, { x: 9, y: 9 }, { x: 17, y: 8 }, { x: 26, y: 7 }
]);

// Test Level 2:
validateRoute('Level 2', 'Main', [
  { x: 3, y: 10 }, { x: 8, y: 9 }, { x: 14, y: 9 }, { x: 20, y: 9 }, { x: 27, y: 8 }
]);

// Test Level 3:
validateRoute('Level 3', 'Main', [
  { x: 3, y: 10 }, { x: 8, y: 10 }, { x: 16, y: 10 }, { x: 24, y: 10 }
]);

// Test Level 4:
validateRoute('Level 4', 'Main', [
  { x: 3, y: 12 }, { x: 7, y: 10 }, { x: 11, y: 8 }, { x: 15, y: 6 }, { x: 19, y: 4 }, { x: 23, y: 8 }, { x: 28, y: 12 }
]);

// Test Level 5:
validateRoute('Level 5', 'Upper Cloud', [
  { x: 3, y: 8 }, { x: 7, y: 6 }, { x: 12, y: 6 }, { x: 17, y: 8 }, { x: 24, y: 8 }
]);
validateRoute('Level 5', 'Lower Magma', [
  { x: 3, y: 8 }, { x: 7, y: 10 }, { x: 12, y: 10 }, { x: 17, y: 8 }, { x: 24, y: 8 }
]);

// Test Level 6:
validateRoute('Level 6', 'Main', [
  { x: 3, y: 10 }, { x: 7, y: 8 }, { x: 12, y: 8 }, { x: 17, y: 8 }, { x: 22, y: 8 }, { x: 27, y: 7 }
]);

// Test Level 7:
validateRoute('Level 7', 'Main', [
  { x: 3, y: 9 }, { x: 6, y: 8 }, { x: 11, y: 8 }, { x: 16, y: 8 }, { x: 21, y: 8 }, { x: 25, y: 9 }
]);

// Test Level 8:
validateRoute('Level 8', 'Upper Route', [
  { x: 3, y: 7 }, { x: 7, y: 5 }, { x: 13, y: 5 }, { x: 19, y: 5 }, { x: 25, y: 7 }
]);
validateRoute('Level 8', 'Lower Route', [
  { x: 3, y: 7 }, { x: 7, y: 9 }, { x: 13, y: 9 }, { x: 19, y: 9 }, { x: 25, y: 7 }
]);

// Test Level 9:
validateRoute('Level 9', 'Ascent', [
  { x: 3, y: 14 }, { x: 7, y: 12 }, { x: 12, y: 10 }, { x: 7, y: 8 }, { x: 12, y: 6 }, { x: 7, y: 4 }, { x: 11, y: 2 }
]);

// Test Level 10:
validateRoute('Level 10', 'Grand Finale', [
  { x: 3, y: 9 }, { x: 7, y: 8 }, { x: 12, y: 8 }, { x: 17, y: 7 }, { x: 22, y: 6 }, { x: 26, y: 6 }, { x: 31, y: 6 }
]);
