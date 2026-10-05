# AGENTS.md – Asteroids

## Quick Start
- **No build, no dependencies.** Open `index.html` directly in a browser or via `npx serve .`
- **Single-file game logic** in `game.js` (~423 lines). Everything is vanilla ES6+, no imports.
- **Canvas size fixed** at 800×600 (hardcoded in `game.js:6` as `W` and `H`).

## Architecture
The game uses a single-file state machine:

| Entity | Responsibility |
|--------|-----------------|
| `Bullet` | Projectile physics, 1.1s TTL, wrapping |
| `Asteroid` | Size 1–3, polygon vertices, splitting into smaller pieces |
| `Ship` | Player position, rotation, thrust, respawn invincibility |
| `Particle` | Short-lived explosion traces (cosmetic) |
| `update(dt)` | Game loop: collision, spawning, state transitions |
| `draw()` | Canvas render: HUD, overlays, entities |

## Key Numbers & Quirks

**Asteroid breaking & scoring** (game.js:61–63):
- Size 3 (large) → 2× size 2; size 2 → 2× size 1; size 1 → dead
- Points: small=100, medium=50, large=20

**Ship mechanics** (game.js:143–145):
- Rotation speed: 3.5 rad/s
- Thrust acceleration: 260 px/s²
- Drag (friction): 0.987 per frame
- Invincibility timer: 3 seconds after respawn with flickering visual

**Collision detection** (game.js:327, 342):
- Bullet–asteroid: distance check only (`dist(b, a) < a.radius`)
- Ship–asteroid: radius sum with 0.82× scale factor (`ship.radius + a.radius * 0.82`)

**Safe spawn zone** (game.js:245):
- New asteroids spawn ≥130px away from ship center

**Level scaling** (game.js:273):
- Start: 4 asteroids; next level: 3 + level count

## Language & Style
- Spanish UI text (score label, level, controls in README)
- Game uses `'use strict'` mode
- Physics use pixel-based coordinates; wrapping via modulo: `wrap(v, max)`
- No console logging; debug by inspecting canvas directly or adding `console.log` in update loop

## Run & Test
- **Browser:** Open `index.html` or `npx serve .` → `http://localhost:3000`
- **No automated tests.** Game is correct if:
  - Asteroids split on hit and disappear when size 1
  - Score increments match size (100/50/20)
  - Ship wraps at edges and invincible flickers after death
  - Level advances when field is empty
  - Game over on 0 lives; restarts on Space

## Common Modifications
- **Canvas dimensions:** Change `W` and `H` in game.js:6, and `<canvas>` in index.html:23
- **Difficulty:** Adjust asteroid spawn count in `spawnAsteroids()`, or tweak `SPEEDS[size]`
- **Visual changes:** All drawing in `draw()` uses `ctx` (Canvas 2D API); colors are hardcoded `#fff` (white) on `#000` (black)
