/* 2L² / ONE WORLD — GSAP ScrollTrigger animations + Lenis smooth scroll. */
(() => {
  'use strict';
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Hero entrance
  gsap.timeline({ delay: 0.3 })
    .from('.hero .eyebrow', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' })
    .from('.hero h1', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out' }, '-=0.6')
    .from('.hero-lead', { y: 40, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
    .from('.hero-actions .action', { y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }, '-=0.5')
    .from('.hero-index', { opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.3');

  // Section reveals
  gsap.utils.toArray('.chapter:not(.hero)').forEach(ch => {
    const c = ch.querySelector('.chapter-content');
    if (!c) return;
    gsap.from(c, {
      y: 80, opacity: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: ch, start: 'top 75%', toggleActions: 'play none none reverse' }
    });
  });

  // Section topline fine-lines
  gsap.utils.toArray('.section-topline .fine-line').forEach(line => {
    gsap.from(line, {
      scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: line, start: 'top 85%' }
    });
  });

  // Service lines stagger
  gsap.from('.service-line', {
    x: 60, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.service-lines', start: 'top 80%' }
  });

  // Architecture rows stagger
  gsap.from('.architecture-row', {
    y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.tech-architecture', start: 'top 75%' }
  });

  // Ledger rows stagger
  gsap.from('.ledger-row', {
    x: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.project-ledger', start: 'top 80%' }
  });

  // Company details stagger
  gsap.from('.company-details dl > div', {
    x: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.company-details', start: 'top 75%' }
  });

  // Contact body stagger
  gsap.from('.contact-body > *', {
    y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-body', start: 'top 75%' }
  });

  // Hero parallax
  gsap.to('.hero-content', {
    yPercent: -15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });

  // Philosophy parallax
  gsap.to('.philosophy-content', {
    yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.philosophy', start: 'top top', end: 'bottom top', scrub: 1 }
  });
})();
