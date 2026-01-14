import React, { useEffect, useRef } from 'react';
import styles from './index.module.less';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface MousePosition {
  x: number;
  y: number;
  isMoving: boolean;
}

interface InteractiveBackgroundProps {
  particleCount?: number;
  particleSize?: number;
  particleColor?: string;
  connectionDistance?: number;
  mouseInteractionRadius?: number;
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({
  particleCount = 100,
  particleSize = 2,
  particleColor = 'rgba(0, 195, 255, 0.6)',
  connectionDistance = 120,
  mouseInteractionRadius = 150
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0, isMoving: false });
  const mouseTimeoutRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticle = (x: number, y: number): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.4;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 100 + Math.random() * 100,
        size: particleSize * (0.5 + Math.random()),
        color: particleColor
      };
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }
    };

    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        isMoving: true
      };

      clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        mouseRef.current.isMoving = false;
      }, 100);

      if (Math.random() > 0.7) {
        const newParticle = createParticle(e.clientX, e.clientY);
        newParticle.life = 1;
        newParticle.maxLife = 50 + Math.random() * 50;
        particlesRef.current.push(newParticle);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      mouseRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        isMoving: true
      };

      clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        mouseRef.current.isMoving = false;
      }, 100);

      if (Math.random() > 0.7) {
        const newParticle = createParticle(touch.clientX, touch.clientY);
        newParticle.life = 1;
        newParticle.maxLife = 50 + Math.random() * 50;
        particlesRef.current.push(newParticle);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const drawParticle = (particle: Particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const drawConnection = (p1: Particle, p2: Particle, distance: number) => {
      const opacity = (1 - distance / connectionDistance) * 0.3;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(100, 150, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.life -= 1 / particle.maxLife;

        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawParticle(particle);

        for (let j = i + 1; j < particles.length; j++) {
          const otherParticle = particles[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            drawConnection(particle, otherParticle, distance);
          }
        }

        if (mouseRef.current.isMoving) {
          const dx = particle.x - mouseRef.current.x;
          const dy = particle.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseInteractionRadius) {
            const force = (mouseInteractionRadius - distance) / mouseInteractionRadius;
            const angle = Math.atan2(dy, dx);
            particle.vx += Math.cos(angle) * force * 0.2;
            particle.vy += Math.sin(angle) * force * 0.2;
          }
        }
      }

      if (particles.length < particleCount) {
        particles.push(createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, particleSize, particleColor, connectionDistance, mouseInteractionRadius]);

  return <canvas ref={canvasRef} className={styles.interactiveBackground} />;
};

export default InteractiveBackground;
