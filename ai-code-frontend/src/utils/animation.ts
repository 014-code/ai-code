export interface ParticleBurstOptions {
  particleCount?: number;
  particleSize?: number;
  particleColor?: string;
  minVelocity?: number;
  maxVelocity?: number;
  duration?: number;
}

export const createParticleBurst = (
  event: React.MouseEvent,
  options: ParticleBurstOptions = {}
) => {
  const {
    particleCount = 12,
    particleSize = 6,
    particleColor = 'rgba(255, 255, 255, 0.9)',
    minVelocity = 60,
    maxVelocity = 100,
    duration = 600
  } = options;

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const particles: HTMLElement[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: ${particleSize}px;
      height: ${particleSize}px;
      background: ${particleColor};
      border-radius: 50%;
      pointer-events: none;
      left: ${centerX}px;
      top: ${centerY}px;
      z-index: 9999;
    `;

    document.body.appendChild(particle);
    particles.push(particle);

    const angle = (i / particleCount) * Math.PI * 2;
    const velocity = minVelocity + Math.random() * (maxVelocity - minVelocity);
    const endX = centerX + Math.cos(angle) * velocity;
    const endY = centerY + Math.sin(angle) * velocity;

    particle.animate([
      {
        transform: 'translate(-50%, -50%) scale(1)',
        opacity:1
      },
      {
        transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`,
        opacity: 0
      }
    ], {
      duration,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => {
      particle.remove();
    };
  }
};

export const animationUtils = {
  createParticle: (canvas: HTMLCanvasElement, x: number, y: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const particle = {
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life:1,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      size: Math.random() * 3 + 1
    };

    return particle;
  },

  updateParticle: (particle: any) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 0.01;
    particle.size *= 0.99;
  },

  drawParticle: (ctx: CanvasRenderingContext2D, particle: any) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life;
    ctx.fill();
    ctx.globalAlpha = 1;
  },

  createWave: (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const wave = {
      amplitude: 50,
      frequency: 0.02,
      phase: 0,
      speed: 0.05,
      color: 'rgba(255, 255, 255, 0.3)'
    };

    return wave;
  },

  drawWave: (ctx: CanvasRenderingContext2D, wave: any, canvas: HTMLCanvasElement) => {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = wave.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    wave.phase += wave.speed;
  }
};
