/* 2L² — original scroll-responsive spatial camera.
   Homepage background only. No added imagery, hardware art, or page navigation changes. */
(() => {
  'use strict';
  if (!document.body.classList.contains('classic-home')) return;
  const scene = document.getElementById('scene-3d');
  if (!scene) return;
  const frames = Array.from(scene.querySelectorAll('.space-frame'));
  if (!frames.length) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let targetY = window.scrollY;
  let smoothY = targetY;
  let scheduled = false;

  function render() {
    scheduled = false;
    if (reducedMotion.matches) {
      scene.style.removeProperty('--scene-x');
      scene.style.removeProperty('--scene-turn');
      scene.style.removeProperty('--scene-pitch');
      frames.forEach(frame => {
        frame.style.removeProperty('--frame-depth');
        frame.style.removeProperty('--frame-alpha');
        frame.style.removeProperty('--frame-blur');
      });
      return;
    }

    // Derived from the original homepage's scroll camera. The architecture
    // stays in one fixed 3D world instead of restarting at each section.
    const pace = smoothY / Math.max(680, window.innerHeight * 0.92);
    const phase = pace * 740;
    scene.style.setProperty('--scene-x',
      `${Math.sin(pace * 0.58) * Math.min(window.innerWidth * 0.06, 72)}px`);
    scene.style.setProperty('--scene-turn', `${Math.sin(pace * 0.44) * 3.9}deg`);
    scene.style.setProperty('--scene-pitch', `${Math.sin(pace * 0.33) * 1.8}deg`);

    frames.forEach((frame, index) => {
      const depth = ((phase + index * 690) % 5520) - 4320;
      const frontFade = clamp((1100 - depth) / 650, 0, 1);
      const farFade = clamp((depth + 4270) / 650, 0, 1);
      const opacity = frontFade * farFade * (index % 3 === 0 ? 0.74 : 0.48);
      frame.style.setProperty('--frame-depth', `${depth.toFixed(1)}px`);
      frame.style.setProperty('--frame-alpha', opacity.toFixed(3));
      frame.style.setProperty('--frame-blur',
        `${clamp((depth - 550) / 380, 0, 4)}px`);
    });

    if (Math.abs(targetY - smoothY) > 0.18) {
      smoothY += (targetY - smoothY) * 0.105;
      queueRender();
    } else {
      smoothY = targetY;
    }
  }
  function queueRender() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(render);
    }
  }
  function updateTarget() {
    targetY = window.scrollY;
    if (reducedMotion.matches) smoothY = targetY;
    queueRender();
  }
  window.addEventListener('scroll', updateTarget, {passive: true});
  window.addEventListener('resize', updateTarget, {passive: true});
  reducedMotion.addEventListener?.('change', updateTarget);
  updateTarget();
})();
