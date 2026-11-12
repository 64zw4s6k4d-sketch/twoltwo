/* 2L² / ONE WORLD — Three.js starfield background.
   Simple star field in deep space, layered behind the CSS scene. */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06090f, 0.0008);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 6000);
  camera.position.set(0, 0, 1200);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // Star texture
  const tex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  // Star field
  const COUNT = 3000;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 300 + Math.random() * 2200;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(p) * Math.cos(t);
    pos[i*3+1] = r * Math.sin(p) * Math.sin(t);
    pos[i*3+2] = r * Math.cos(p);
    // Vary star colors: mostly warm gold, some white
    const I = 0.4 + Math.random() * 0.6;
    if (Math.random() < 0.7) {
      col[i*3]   = 0.85 * I;
      col[i*3+1] = 0.75 * I;
      col[i*3+2] = 0.5 * I;
    } else {
      col[i*3]   = 0.9 * I;
      col[i*3+1] = 0.9 * I;
      col[i*3+2] = 0.85 * I;
    }
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pMat = new THREE.PointsMaterial({
    size: 3, map: tex, vertexColors: true, transparent: true,
    opacity: 0.7, blending: THREE.AdditiveBlending,
    sizeAttenuation: true, depthWrite: false
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Interaction
  let mx = 0, my = 0, tx = 0, ty = 0, scroll = 0;
  addEventListener('mousemove', e => {
    mx = (e.clientX/innerWidth - 0.5) * 2;
    my = (e.clientY/innerHeight - 0.5) * 2;
  }, { passive: true });
  addEventListener('scroll', () => {
    scroll = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  }, { passive: true });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // Loop
  const clock = new THREE.Clock();
  let vis = true;
  document.addEventListener('visibilitychange', () => { vis = !document.hidden; });

  function loop() {
    requestAnimationFrame(loop);
    if (!vis) return;
    const t = clock.getElapsedTime();
    tx += (mx - tx) * 0.04;
    ty += (my - ty) * 0.04;
    camera.position.x = tx * 80;
    camera.position.y = -ty * 50;
    camera.position.z = 1200 - scroll * 400;
    camera.lookAt(0, 0, 0);
    particles.rotation.y = t * 0.012;
    particles.rotation.x = t * 0.006;
    renderer.render(scene, camera);
  }
  loop();
})();
