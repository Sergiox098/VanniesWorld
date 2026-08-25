/**
 * Vannie's World - Particle System
 * Kawaii sparkles, dust puffs, and transformation bursts.
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawn(x, y, vx, vy, color, life = 0.5, size = 3, shape = 'circle') {
    this.particles.push({
      x,
      y,
      vx,
      vy,
      color,
      maxLife: life,
      life,
      size,
      shape
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const currentSize = Math.max(1, p.size * progress);
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          ctx.lineTo(Math.cos(angle) * currentSize, Math.sin(angle) * currentSize);
          const innerAngle = angle + Math.PI / 5;
          ctx.lineTo(Math.cos(innerAngle) * (currentSize * 0.5), Math.sin(innerAngle) * (currentSize * 0.5));
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
  }
}
