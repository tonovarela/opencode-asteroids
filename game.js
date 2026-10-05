'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── ShootingStar ──────────────────────────────────────────────────────────────
const STAR_POINTS = 250;
const STAR_TTL    = 5;     // segundos de vida
const STAR_SPEED  = 260;   // px/s

class ShootingStar {
  constructor() {
    // Spawnar desde un borde aleatorio hacia el lado opuesto
    const side = randInt(0, 3); // 0=top 1=right 2=bottom 3=left
    if (side === 0) {
      this.x = rand(0, W); this.y = -20;
      this.angle = rand(Math.PI * 0.1, Math.PI * 0.9);
    } else if (side === 1) {
      this.x = W + 20; this.y = rand(0, H);
      this.angle = rand(Math.PI * 0.6, Math.PI * 1.4);
    } else if (side === 2) {
      this.x = rand(0, W); this.y = H + 20;
      this.angle = rand(Math.PI * 1.1, Math.PI * 1.9);
    } else {
      this.x = -20; this.y = rand(0, H);
      this.angle = rand(-Math.PI * 0.4, Math.PI * 0.4);
    }

    const speed = STAR_SPEED + rand(-40, 60);
    this.vx = Math.cos(this.angle) * speed;
    this.vy = Math.sin(this.angle) * speed;

    this.ttl     = STAR_TTL;
    this.maxTtl  = STAR_TTL;
    this.rot     = rand(0, Math.PI * 2);
    this.rotSpeed = rand(1.5, 3.5) * (Math.random() < 0.5 ? 1 : -1);
    this.radius  = 18;
    this.dead    = false;
    this.trailTimer = 0;
  }

  _starPath(r) {
    const pts  = 5;
    const inner = r * 0.42;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : inner;
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else         ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  }

  update(dt) {
    this.x   += this.vx * dt;
    this.y   += this.vy * dt;
    this.rot += this.rotSpeed * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;

    // Emitir estela de partículas doradas
    this.trailTimer += dt;
    if (this.trailTimer > 0.03) {
      this.trailTimer = 0;
      particles.push(new GoldParticle(this.x, this.y, -this.vx, -this.vy));
    }
  }

  draw() {
    const lifeFrac = this.ttl / this.maxTtl;
    // Parpadeo cuando queda menos del 30% de vida
    if (lifeFrac < 0.3 && Math.floor(this.ttl * 10) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    // Halo exterior suave
    const glowAlpha = lifeFrac * 0.35;
    ctx.strokeStyle = `rgba(255, 220, 0, ${glowAlpha.toFixed(2)})`;
    ctx.lineWidth   = 6;
    this._starPath(this.radius + 4);
    ctx.stroke();

    // Estrella principal
    ctx.strokeStyle = `rgba(255, 215, 0, ${Math.min(lifeFrac * 2, 1).toFixed(2)})`;
    ctx.lineWidth   = 1.8;
    ctx.lineJoin    = 'round';
    this._starPath(this.radius);
    ctx.stroke();

    // Relleno tenue dorado
    ctx.fillStyle = `rgba(255, 215, 0, ${(lifeFrac * 0.15).toFixed(2)})`;
    this._starPath(this.radius);
    ctx.fill();

    ctx.restore();
  }
}

// ── GoldParticle (estela de estrellas fugaces) ────────────────────────────────
class GoldParticle {
  constructor(x, y, dvx, dvy) {
    this.x  = x + rand(-4, 4);
    this.y  = y + rand(-4, 4);
    const spread = rand(10, 40);
    const a = Math.atan2(dvy, dvx) + rand(-0.5, 0.5);
    this.vx   = Math.cos(a) * spread;
    this.vy   = Math.sin(a) * spread;
    this.life = rand(0.2, 0.55);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255, 200, 0, ${alpha.toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.07, this.y - this.vy * 0.07);
    ctx.stroke();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedUpTimer  = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedUpTimer  > 0) this.speedUpTimer  -= dt;

    const ROT_BASE   = 3.5;    // rad/s
    const THRUST_BASE = 260;   // px/s²
    const DRAG   = 0.987;

    // Aplicar multiplicador de velocidad si está activo
    const speedMultiplier = this.speedUpTimer > 0 ? 2 : 1;
    const ROT = ROT_BASE * speedMultiplier;
    const THRUST = THRUST_BASE * speedMultiplier;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta clásica: triángulo con muesca trasera
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nariz
    ctx.lineTo(-12, -9);   // ala izquierda
    ctx.lineTo( -7,  0);   // muesca trasera
    ctx.lineTo(-12,  9);   // ala derecha
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── PowerUp (Velocidad) ───────────────────────────────────────────────────────
class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.dead = false;
    this.pulseTime = 0;
  }

  update(dt) {
    this.pulseTime += dt;
  }

  draw() {
    const pulse = Math.sin(this.pulseTime * 4) * 0.3 + 0.7; // Pulsación
    const radius = this.radius * pulse;
    
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'; // Verde brillante
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups, shootingStars;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function spawnPowerUp() {
  const SAFE_DIST = 130;
  let x, y;
  do {
    x = rand(0, W);
    y = rand(0, H);
  } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
  powerups.push(new PowerUp(x, y));
}

function spawnShootingStar() {
  shootingStars.push(new ShootingStar());
}

function initGame() {
  ship          = new Ship();
  bullets       = [];
  asteroids     = [];
  particles     = [];
  powerups      = [];
  shootingStars = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets       = [];
  particles     = [];
  powerups      = [];
  shootingStars = [];
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));
  shootingStars.forEach(s => s.update(dt));

  bullets       = bullets.filter(b => !b.dead);
  particles     = particles.filter(p => !p.dead);
  shootingStars = shootingStars.filter(s => !s.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Bala vs estrella fugaz
  for (const b of bullets) {
    for (const s of shootingStars) {
      if (!s.dead && !b.dead && dist(b, s) < s.radius) {
        b.dead = true;
        s.dead = true;
        score += STAR_POINTS;
        // Explosion dorada: partículas extra
        for (let i = 0; i < 18; i++) particles.push(new GoldParticle(s.x, s.y, 0, 0));
        explode(s.x, s.y, 10);
      }
    }
  }
  shootingStars = shootingStars.filter(s => !s.dead);
  bullets       = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
    // Nave vs estrella fugaz
    if (!ship.dead) {
      for (const s of shootingStars) {
        if (!s.dead && dist(ship, s) < ship.radius + s.radius * 0.8) {
          killShip();
          break;
        }
      }
    }
  }

  // Nave vs PowerUp
  for (const p of powerups) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      ship.speedUpTimer = 5;  // Activar velocidad por 5 segundos
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Spawn aleatorio de PowerUp
  if (Math.random() < 0.02) {  // ~2% chance cada frame
    if (powerups.length < 1) {  // Máximo 1 PowerUp en pantalla
      spawnPowerUp();
    }
  }

  // Spawn aleatorio de estrella fugaz (~0.4% por frame, máx 1 en pantalla)
  if (shootingStars.length === 0 && Math.random() < 0.004) {
    spawnShootingStar();
  }

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  // Mostrar timer de velocidad si está activo
  if (ship.speedUpTimer > 0) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`VELOCIDAD: ${ship.speedUpTimer.toFixed(1)}s`, W / 2, 50);
  }

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  shootingStars.forEach(s => s.draw());
  bullets.forEach(b => b.draw());
  powerups.forEach(p => p.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
