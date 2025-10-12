const canvas = document.getElementById('track');
const ctx = canvas.getContext('2d');

const speedReadout = document.getElementById('speed-readout');
const lapReadout = document.getElementById('lap-readout');
const bestLapReadout = document.getElementById('best-lap-readout');
const lastLapReadout = document.getElementById('last-lap-readout');

const selectionOverlay = document.getElementById('selection-overlay');
const finishOverlay = document.getElementById('finish-overlay');
const finishSummary = document.getElementById('finish-summary');
const restartButton = document.getElementById('restart-button');
const startButton = document.getElementById('start-button');
const driverGrid = document.getElementById('driver-grid');
const carGrid = document.getElementById('car-grid');

const drivers = [
  {
    id: 'vega',
    name: 'Aiko Vega',
    tagline: 'Precision tactician',
    perks: ['Late braker', 'Telemetry savant'],
    modifiers: { handling: 1.05, acceleration: 0.95, braking: 1.1 },
  },
  {
    id: 'khan',
    name: 'Zayd Khan',
    tagline: 'Aggressive overtaker',
    perks: ['ERS burst', 'Fearless'],
    modifiers: { handling: 0.95, acceleration: 1.08, braking: 0.98 },
  },
  {
    id: 'ivana',
    name: 'Ivana Sol',
    tagline: 'Tyre whisperer',
    perks: ['Stamina boost', 'Smooth inputs'],
    modifiers: { handling: 1.02, acceleration: 1.02, braking: 1.05 },
  },
  {
    id: 'kai',
    name: 'Kai Matsuda',
    tagline: 'Qualifying prodigy',
    perks: ['Launch control', 'Perfect lines'],
    modifiers: { handling: 1.08, acceleration: 1.0, braking: 1.0 },
  },
];

const cars = [
  {
    id: 'nova-01',
    name: 'Nova 01E',
    team: 'Helios Quantum',
    color: '#ff2dfb',
    stats: { speed: 0.95, acceleration: 1.1, handling: 0.98 },
  },
  {
    id: 'ion-v',
    name: 'ION V',
    team: 'Pulse Dynamics',
    color: '#4cf8ff',
    stats: { speed: 1.05, acceleration: 0.98, handling: 1.02 },
  },
  {
    id: 'delta-halo',
    name: 'Delta Halo',
    team: 'ArcLight Motors',
    color: '#f9ff6c',
    stats: { speed: 1.02, acceleration: 1.02, handling: 1.04 },
  },
  {
    id: 'onyx-x',
    name: 'Onyx X',
    team: 'Aether Corsair',
    color: '#6c6bff',
    stats: { speed: 1.08, acceleration: 0.95, handling: 0.96 },
  },
];

let selectedDriver = null;
let selectedCar = null;

const keys = { forward: false, back: false, left: false, right: false };

const raceConfig = {
  totalLaps: 3,
  baseAcceleration: 0.12,
  baseMaxSpeed: 6,
  baseHandling: 0.06,
  brakingFactor: 0.25,
};

const track = {
  cx: canvas.width / 2,
  cy: canvas.height / 2,
  outerRadius: Math.min(canvas.width, canvas.height) * 0.38,
  innerRadius: Math.min(canvas.width, canvas.height) * 0.22,
  startAngle: -Math.PI / 2,
};

let outerPath;
let innerPath;
let ambientGlow = 0;

const state = {
  running: false,
  countdown: 0,
  lapsCompleted: 0,
  lapTimes: [],
  lapStart: 0,
  lastAngle: null,
  bestLap: null,
  lastLap: null,
  lastFrame: null,
};

const car = {
  x: track.cx,
  y: track.cy - track.outerRadius + 30,
  angle: 0,
  speed: 0,
  color: '#fff',
  acceleration: raceConfig.baseAcceleration,
  handling: raceConfig.baseHandling,
  maxSpeed: raceConfig.baseMaxSpeed,
};

function createCard(item, type) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  card.innerHTML = `
    <span class="title">${item.name}</span>
    <span class="subtitle">${type === 'driver' ? item.tagline : item.team}</span>
    <div class="badges">
      ${(type === 'driver' ? item.perks : Object.keys(item.stats)).map(
        (perk) => `<span class="badge">${perk}</span>`
      ).join('')}
    </div>
    ${type === 'car' ? renderCarStats(item.stats) : renderDriverStats(item.modifiers)}
  `;

  card.addEventListener('click', () => {
    if (type === 'driver') {
      selectedDriver = item;
      [...driverGrid.children].forEach((child) => child.classList.remove('selected'));
      card.classList.add('selected');
    } else {
      selectedCar = item;
      [...carGrid.children].forEach((child) => child.classList.remove('selected'));
      card.classList.add('selected');
    }
    validateSelections();
  });

  return card;
}

function renderDriverStats(modifiers) {
  const stats = [
    { label: 'Handling', value: modifiers.handling },
    { label: 'Acceleration', value: modifiers.acceleration },
    { label: 'Braking', value: modifiers.braking },
  ];

  return `
    <div class="stats">
      ${stats
        .map(
          (stat) => `
          <div class="stat">
            <span>${stat.label}</span>
            <div class="progress"><span style="width: ${(stat.value * 90).toFixed(0)}%"></span></div>
          </div>
        `
        )
        .join('')}
    </div>
  `;
}

function renderCarStats(stats) {
  const statList = [
    { label: 'Top speed', value: stats.speed },
    { label: 'Acceleration', value: stats.acceleration },
    { label: 'Aero balance', value: stats.handling },
  ];

  return `
    <div class="stats">
      ${statList
        .map(
          (stat) => `
          <div class="stat">
            <span>${stat.label}</span>
            <div class="progress"><span style="width: ${(stat.value * 90).toFixed(0)}%"></span></div>
          </div>
        `
        )
        .join('')}
    </div>
  `;
}

function validateSelections() {
  startButton.disabled = !(selectedCar && selectedDriver);
}

function populateSelections() {
  drivers.forEach((driver) => driverGrid.appendChild(createCard(driver, 'driver')));
  cars.forEach((car) => carGrid.appendChild(createCard(car, 'car')));
}

function buildTrack() {
  outerPath = new Path2D();
  outerPath.arc(track.cx, track.cy, track.outerRadius, 0, Math.PI * 2);

  innerPath = new Path2D();
  innerPath.arc(track.cx, track.cy, track.innerRadius, 0, Math.PI * 2);
}

function resetCar() {
  car.x = track.cx;
  car.y = track.cy - track.outerRadius + 30;
  car.angle = Math.PI / 2;
  car.speed = 0;
  keys.forward = false;
  keys.back = false;
  keys.left = false;
  keys.right = false;
  state.lastAngle = null;
  state.lapsCompleted = 0;
  state.lapTimes = [];
  state.bestLap = null;
  state.lastLap = null;
  state.lapStart = performance.now();
  state.lastFrame = null;
  state.running = false;
  ambientGlow = 0;
}

function applySelections() {
  const driverMods = selectedDriver?.modifiers ?? { handling: 1, acceleration: 1, braking: 1 };
  const carStats = selectedCar?.stats ?? { speed: 1, acceleration: 1, handling: 1 };

  car.color = selectedCar?.color ?? '#fff';
  car.acceleration = raceConfig.baseAcceleration * carStats.acceleration * driverMods.acceleration;
  car.maxSpeed = raceConfig.baseMaxSpeed * carStats.speed;
  car.handling = raceConfig.baseHandling * carStats.handling * driverMods.handling;
  car.braking = raceConfig.brakingFactor * driverMods.braking;
}

function startRace() {
  applySelections();
  selectionOverlay.hidden = true;
  resetCar();
  state.countdown = 3;
  countdownTick();
}

function countdownTick() {
  if (state.countdown <= 0) {
    state.lapStart = performance.now();
    state.lastFrame = null;
    state.running = true;
    requestAnimationFrame(loop);
    return;
  }

  drawScene();
  drawCountdown(state.countdown);
  setTimeout(() => {
    state.countdown -= 1;
    countdownTick();
  }, 800);
}

function handleKey(e, pressed) {
  if (!state.running) return;
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      keys.forward = pressed;
      break;
    case 'ArrowDown':
    case 'KeyS':
      keys.back = pressed;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = pressed;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = pressed;
      break;
    case 'Space':
      keys.back = pressed;
      break;
    default:
      break;
  }
}

document.addEventListener('keydown', (e) => handleKey(e, true));
document.addEventListener('keyup', (e) => handleKey(e, false));

function update(delta) {
  const dt = delta / 16.6667;

  if (keys.forward) {
    car.speed += car.acceleration * dt;
  }
  if (keys.back) {
    car.speed -= car.braking * dt;
  }

  const maxSpeed = car.maxSpeed;
  if (car.speed > maxSpeed) car.speed = maxSpeed;
  if (car.speed < -maxSpeed * 0.4) car.speed = -maxSpeed * 0.4;

  if (!keys.forward && !keys.back) {
    car.speed *= 0.985;
  }

  if (Math.abs(car.speed) > 0.02) {
    const turnFactor = car.handling * dt * Math.sign(car.speed);
    if (keys.left) car.angle -= turnFactor;
    if (keys.right) car.angle += turnFactor;
  }

  car.x += Math.cos(car.angle) * car.speed * dt * 4;
  car.y += Math.sin(car.angle) * car.speed * dt * 4;

  enforceTrack();
  updateLap(delta);
}

function enforceTrack() {
  if (!outerPath || !innerPath) return;
  if (!ctx.isPointInPath(outerPath, car.x, car.y) || ctx.isPointInPath(innerPath, car.x, car.y)) {
    car.speed *= 0.6;
    const dx = track.cx - car.x;
    const dy = track.cy - car.y;
    const len = Math.hypot(dx, dy) || 1;
    car.x += (dx / len) * 4;
    car.y += (dy / len) * 4;
  }
}

function updateLap(delta) {
  const dx = car.x - track.cx;
  const dy = car.y - track.cy;
  const angle = Math.atan2(dy, dx);

  if (state.lastAngle === null) {
    state.lastAngle = angle;
    return;
  }

  const passedStart = state.lastAngle < track.startAngle && angle >= track.startAngle;
  const wrappedAround = state.lastAngle > 2.8 && angle < -2.8;

  if (passedStart || wrappedAround) {
    const now = performance.now();
    const lapTime = now - state.lapStart;
    state.lapStart = now;
    state.lapTimes.push(lapTime);
    state.lastLap = lapTime;
    if (!state.bestLap || lapTime < state.bestLap) {
      state.bestLap = lapTime;
    }
    state.lapsCompleted += 1;

    if (state.lapsCompleted >= raceConfig.totalLaps) {
      finishRace();
    }
  }

  state.lastAngle = angle;
}

function finishRace() {
  state.running = false;
  keys.forward = false;
  keys.back = false;
  keys.left = false;
  keys.right = false;
  finishOverlay.hidden = false;
  const best = state.bestLap ? (state.bestLap / 1000).toFixed(2) : '--';
  const last = state.lastLap ? (state.lastLap / 1000).toFixed(2) : '--';
  const combo = `${selectedDriver?.name ?? 'Driver'} & ${selectedCar?.name ?? 'Chassis'}`;
  finishSummary.textContent = `${combo} • Best lap: ${best}s — Last lap: ${last}s`;
}

function loop(timestamp) {
  if (!state.running) return;
  if (!state.lastFrame) state.lastFrame = timestamp;
  const delta = timestamp - state.lastFrame;
  state.lastFrame = timestamp;

  update(delta);
  drawScene();
  requestAnimationFrame(loop);
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();
  drawCar();
  drawUI();
}

function drawTrack() {
  const gradient = ctx.createRadialGradient(track.cx, track.cy, track.innerRadius - 40, track.cx, track.cy, track.outerRadius + 60);
  gradient.addColorStop(0, 'rgba(12, 24, 54, 0.2)');
  gradient.addColorStop(1, 'rgba(3, 12, 32, 0.9)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(track.cx, track.cy, track.outerRadius + 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = 'rgba(76, 248, 255, 0.35)';
  ctx.shadowBlur = 24 + Math.sin(ambientGlow) * 8;

  ctx.fillStyle = '#111626';
  ctx.beginPath();
  ctx.arc(track.cx, track.cy, track.outerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(track.cx, track.cy, track.innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(76, 248, 255, 0.38)';
  ctx.setLineDash([30, 18]);
  ctx.beginPath();
  ctx.arc(track.cx, track.cy, (track.outerRadius + track.innerRadius) / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(track.cx, track.cy, track.outerRadius - 8, track.startAngle - 0.04, track.startAngle + 0.04);
  ctx.stroke();

  ambientGlow += 0.04;
}

function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  const bodyLength = 54;
  const bodyWidth = 22;

  const gradient = ctx.createLinearGradient(-bodyLength / 2, 0, bodyLength / 2, 0);
  gradient.addColorStop(0, '#0b0d22');
  gradient.addColorStop(1, car.color);

  ctx.fillStyle = gradient;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-bodyLength / 2, -bodyWidth / 2);
  ctx.lineTo(bodyLength / 2, -bodyWidth / 2);
  ctx.quadraticCurveTo(bodyLength / 2 + 10, 0, bodyLength / 2, bodyWidth / 2);
  ctx.lineTo(-bodyLength / 2, bodyWidth / 2);
  ctx.quadraticCurveTo(-bodyLength / 2 - 12, 0, -bodyLength / 2, -bodyWidth / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(-bodyLength / 4, -bodyWidth / 4, bodyLength / 6, bodyWidth / 2);

  ctx.fillStyle = 'rgba(76,248,255,0.35)';
  ctx.fillRect(bodyLength / 6, -bodyWidth / 4, bodyLength / 3.4, bodyWidth / 2);

  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.beginPath();
  ctx.ellipse(-bodyLength / 3.2, 0, bodyWidth / 1.7, bodyWidth / 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0a0a12';
  ctx.beginPath();
  ctx.ellipse(-bodyLength / 2.1, 0, bodyWidth / 2.4, bodyWidth / 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1c1c2f';
  ctx.fillRect(-bodyLength / 2.4, -bodyWidth / 2, bodyLength / 40, bodyWidth);

  ctx.restore();
}

function drawUI() {
  const speed = Math.max(0, car.speed) * 36; // convert to km/h (approx)
  speedReadout.textContent = `${speed.toFixed(0)} km/h`;
  lapReadout.textContent = `${Math.min(state.lapsCompleted + 1, raceConfig.totalLaps)} / ${raceConfig.totalLaps}`;
  bestLapReadout.textContent = state.bestLap ? `${(state.bestLap / 1000).toFixed(2)} s` : '--';
  lastLapReadout.textContent = state.lastLap ? `${(state.lastLap / 1000).toFixed(2)} s` : '--';
}

function drawCountdown(number) {
  ctx.save();
  ctx.fillStyle = 'rgba(12, 22, 52, 0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4cf8ff';
  ctx.font = '120px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(76, 248, 255, 0.8)';
  ctx.shadowBlur = 32;
  ctx.fillText(number, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function restartRace() {
  finishOverlay.hidden = true;
  selectionOverlay.hidden = false;
  state.running = false;
  state.lastFrame = null;
}

startButton.addEventListener('click', startRace);
restartButton.addEventListener('click', restartRace);

function resizeCanvas() {
  const ratio = 16 / 9;
  const availableWidth = window.innerWidth - 80;
  const availableHeight = window.innerHeight - 80;
  let width = availableWidth;
  let height = width / ratio;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * ratio;
  }
  canvas.width = Math.max(960, Math.round(width));
  canvas.height = Math.max(540, Math.round(height));
  track.cx = canvas.width / 2;
  track.cy = canvas.height / 2;
  track.outerRadius = Math.min(canvas.width, canvas.height) * 0.38;
  track.innerRadius = Math.min(canvas.width, canvas.height) * 0.22;
  buildTrack();
  if (!state.running) {
    car.x = track.cx;
    car.y = track.cy - track.outerRadius + 30;
  }
  drawScene();
}

window.addEventListener('resize', resizeCanvas);

populateSelections();
buildTrack();
resizeCanvas();
drawScene();
