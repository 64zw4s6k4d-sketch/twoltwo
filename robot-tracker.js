/* 2L² / Customer Information — Robot cursor tracking.
   The robot's eyes, head, body, and floating cube follow the cursor. */
(() => {
  'use strict';
  const robot = document.querySelector('.robot-character');
  if (!robot) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rect = null;
  let visible = true;

  function updateRect() { rect = robot.getBoundingClientRect(); }
  updateRect();
  window.addEventListener('resize', updateRect);
  window.addEventListener('scroll', updateRect, { passive: true });

  function onMove(clientX, clientY) {
    if (!rect) updateRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.35;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.45;
    targetX = Math.max(-1, Math.min(1, dx / maxDist));
    targetY = Math.max(-1, Math.min(1, dy / maxDist));
  }

  window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    root.style.setProperty('--robot-eye-x', (currentX * 5).toFixed(2) + 'px');
    root.style.setProperty('--robot-eye-y', (currentY * 5).toFixed(2) + 'px');
    root.style.setProperty('--robot-head-rot', (currentX * 12).toFixed(2) + 'deg');
    root.style.setProperty('--robot-body-tilt', (currentX * 4).toFixed(2) + 'deg');
    root.style.setProperty('--robot-cube-x', (currentX * 12).toFixed(2) + 'px');
    root.style.setProperty('--robot-cube-y', (currentY * 8).toFixed(2) + 'px');
  }
  loop();
})();
