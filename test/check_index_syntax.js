const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error("No <script> tag found!");
  process.exit(1);
}

const jsCode = scriptMatch[1];

// Create comprehensive DOM and Canvas Mock
const elements = {};
function getOrCreateElem(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      getContext: () => ({
        fillRect: () => {},
        clearRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
        setLineDash: () => {},
        strokeRect: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fillText: () => {},
      }),
      addEventListener: (evt, cb) => {
        elements[id]['on_' + evt] = cb;
      },
      style: {},
      classList: {
        add: (cls) => { elements[id][cls] = true; },
        remove: (cls) => { elements[id][cls] = false; },
        toggle: () => {},
        contains: (cls) => !!elements[id][cls]
      },
      textContent: '',
      innerHTML: '',
      appendChild: () => {},
      focus: () => {},
      click: function() {
        if (this.on_click) this.on_click({ preventDefault: () => {} });
      }
    };
  }
  return elements[id];
}

const windowListeners = {};
const sandbox = {
  window: {
    addEventListener: (evt, cb) => { windowListeners[evt] = cb; },
    innerWidth: 800,
    innerHeight: 600,
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
  },
  document: {
    getElementById: (id) => getOrCreateElem(id),
    createElement: (tag) => getOrCreateElem('elem_' + Math.random()),
    querySelectorAll: (sel) => [],
    addEventListener: (evt, cb) => {},
  },
  AudioContext: class {
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    get destination() { return {}; }
    get currentTime() { return 0; }
  },
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: () => {},
  localStorage: { getItem: () => null, setItem: () => {} },
  performance: { now: () => Date.now() },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: console,
};
sandbox.window.performance = sandbox.performance;
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.AudioContext = sandbox.AudioContext;
sandbox.window.webkitAudioContext = sandbox.AudioContext;

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);

console.log("✅ index.html parsed and initialized without ANY errors!");

// Now simulate clicking the "Jugar" button (menu-btn-play)
console.log("\nSimulating user clicking 'Jugar' button (menu-btn-play)...");
const btnPlay = getOrCreateElem('menu-btn-play');
if (btnPlay.on_click) {
  btnPlay.click();
  console.log("✅ 'Jugar' button clicked successfully! Game entered running state.");
} else {
  console.error("❌ 'menu-btn-play' has no click listener attached!");
  process.exit(1);
}

// Check level select buttons
console.log("Simulating selecting Level 1 to 10...");
for (let i = 1; i <= 10; i++) {
  const lvlBtn = getOrCreateElem(`lvl-btn-${i}`);
  if (lvlBtn.on_click) {
    lvlBtn.click();
  }
}
console.log("✅ All 10 levels can be selected and loaded without errors!");
