/**
 * 粒子爆炸效果配置选项
 */
export interface ParticleBurstOptions {
  particleCount?: number;
  particleSize?: number;
  particleColor?: string;
  minVelocity?: number;
  maxVelocity?: number;
  duration?: number;
}

/**
 * 创建粒子爆炸效果
 * 在指定元素位置生成圆形粒子，并向四周扩散消失
 * @param event 鼠标事件，用于获取触发元素的位置
 * @param options 粒子效果配置选项
 */
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
        opacity: 1
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
