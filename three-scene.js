/* 2L² / ONE WORLD — Three.js atmospheric background.
   Gold particle dust and wireframe geometry in deep space,
   layered behind the existing CSS scene for added depth. */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06090f, 0.0005);

  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 1, 6000);
  camera.position.set(0, 0, 1200);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // Soft particle texture
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

  // Gold particle field
  const COUNT = 2000;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 300 + Math.random() * 2200;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(p) * Math.cos(t);
    pos[i*3+1] = r * Math.sin(p) * Math.sin(t);
    pos[i*3+2] = r * Math.cos(p);
    const I = 0.3 + Math.random() * 0.7;
    col[i*3]   = 0.79 * I;
    col[i*3+1] = 0.68 * I;
    col[i*3+2] = 0.47 * I;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pMat = new THREE.PointsMaterial({
    size: 4, map: tex, vertexColors: true, transparent: true,
    opacity: 0.6, blending: THREE.AdditiveBlending,
    sizeAttenuation: true, depthWrite: false
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Wireframe shapes
  const shapes = [];
  const defs = [
    { g: new THREE.IcosahedronGeometry(120, 1), p: [350, 200, -400], o: 0.12 },
    { g: new THREE.OctahedronGeometry(80, 0),   p: [-400, -180, -200], o: 0.15 },
    { g: new THREE.IcosahedronGeometry(60, 0),  p: [200, -320, 300],  o: 0.18 },
    { g: new THREE.TorusGeometry(100, 3, 8, 40),p: [-280, 280, 100],  o: 0.10 },
    { g: new THREE.OctahedronGeometry(140, 0),  p: [180, 380, -600],  o: 0.08 },
  ];
  defs.forEach(d => {
    const m = new THREE.Mesh(d.g, new THREE.MeshBasicMaterial({
      color: 0xc9ad78, wireframe: true, transparent: true, opacity: d.o
    }));
    m.position.set(...d.p);
    m.userData = {
      rx: (Math.random()-0.5)*0.004, ry: (Math.random()-0.5)*0.004,
      rz: (Math.random()-0.5)*0.003, baseY: d.p[1],
      fs: 0.3+Math.random()*0.4, fo: Math.random()*Math.PI*2
    };
    shapes.push(m);
    scene.add(m);
  });

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
    camera.position.x = tx * 100;
    camera.position.y = -ty * 60;
    camera.position.z = 1200 - scroll * 500;
    camera.lookAt(0, 0, 0);

    particles.rotation.y = t * 0.015;
    particles.rotation.x = t * 0.008;

    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.rotation.z += s.userData.rz;
      s.position.y = s.userData.baseY + Math.sin(t * s.userData.fs + s.userData.fo) * 25;
    });

    renderer.render(scene, camera);
  }
  loop();
})();
