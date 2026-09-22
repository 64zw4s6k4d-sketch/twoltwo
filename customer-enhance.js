/* 2L² / Customer Information — GSAP entrance and hover animations. */
(() => {
  'use strict';
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Entrance animations
  gsap.from('.customer-top', { y: -30, opacity: 0, duration: 0.8, ease: 'power3.out' });
  gsap.from('.customer-intro > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
  gsap.from('.customer-card', { y: 60, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.4 });
  gsap.from('.card-icon', { scale: 0.5, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.4)', delay: 0.6 });
  gsap.from('.customer-footnote', { opacity: 0, duration: 0.8, delay: 0.8 });

  // Hover animations for card icons
  document.querySelectorAll('.customer-card').forEach(card => {
    const icon = card.querySelector('.card-icon');
    if (!icon) return;
    card.addEventListener('mouseenter', () => {
      gsap.to(icon, { rotation: 6, scale: 1.08, duration: 0.5, ease: 'power3.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(icon, { rotation: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
    });
  });
})();
