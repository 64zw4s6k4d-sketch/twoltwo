/* Presentation logic — editable text lives in content.js, layout and motion live here. */
(() => {
  'use strict';
  const root = document.documentElement;
  const page = document.body.dataset.page || 'home';
  const links = ['home','services','technology','projects','company','contact'];
  const destinations = ['#top','#services','#technology','#projects','#company','#contact'];
  const detailPages = ['index','services','technology','projects','company','contact'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lang = 'ja';
  try { const saved = localStorage.getItem('2l2-lang'); if(window.SITE_COPY[saved]) lang=saved; } catch(_){ }
  const $ = (q, s=document) => s.querySelector(q);
  const $$ = (q, s=document) => Array.from(s.querySelectorAll(q));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lines = value => escapeHtml(value).replace(/\n/g, '<br>');
  const t = () => window.SITE_COPY[lang];
  const loc = (href) => page === 'home' ? href : `./index.html${href}`;
  const button = (text,href,variant='solid') => `<a class="btn btn--${variant}" href="${href}"><span>${escapeHtml(text)}</span><span class="btn-arrow" aria-hidden="true">↗</span></a>`;
  const arrow = `<span class="link-arrow" aria-hidden="true">↗</span>`;
  function shell(){
    $('#nav').innerHTML=t().nav.map((label,i)=>`<a class="nav-link ${page===links[i]?'active':''}" href="${loc(destinations[i])}">${escapeHtml(label)}</a>`).join('');
    $('#mobile-nav').innerHTML=t().nav.map((label,i)=>`<a href="${loc(destinations[i])}">${escapeHtml(label)}<span aria-hidden="true">↗</span></a>`).join('');
    $$('.language button').forEach(b=>{b.classList.toggle('is-active',b.dataset.lang===lang); b.setAttribute('aria-pressed',String(b.dataset.lang===lang));});
    $('#footer').innerHTML=`<div class="footer-top"><a class="footer-logo" href="./index.html"><img src="./assets/brand-logo.png" alt="2L²" width="27" height="28"><span>2L²</span></a><nav aria-label="Footer">${t().nav.map((label,i)=>`<a href="${loc(destinations[i])}">${escapeHtml(label)}</a>`).join('')}</nav></div><div class="footer-bottom"><small>© ${new Date().getFullYear()} 2L²</small><small>${escapeHtml(t().footer)}</small></div>`;
  }
  function visual(kind){
    return `<div class="visual visual--${kind}" aria-hidden="true"><div class="visual-aura"></div><div class="visual-orbit"></div><img class="visual-img" src="./assets/${kind==='chip'?'hero-chip':kind==='stack'?'compute-stack':'light-portal'}.webp" alt="" loading="${kind==='chip'?'eager':'lazy'}" ${kind==='chip'?'fetchpriority="high"':''}><div class="visual-floor"></div></div>`;
  }
  function canvas(){return `<div class="journey-ambient" aria-hidden="true"><span class="ambient-left"></span><span class="ambient-right"></span></div><svg class="golden-thread" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1200 4200"><defs><linearGradient id="lineGold" x1="0" x2="1"><stop stop-color="#bd8545" stop-opacity="0"/><stop offset=".25" stop-color="#d8b574" stop-opacity=".3"/><stop offset=".6" stop-color="#f6dda1" stop-opacity=".68"/><stop offset="1" stop-color="#ab7c3b" stop-opacity=".04"/></linearGradient></defs><path d="M 1185 90 C 450 185 1280 570 580 825 S 65 1265 900 1400 S 1200 1765 470 1930 S 130 2290 860 2560 S 1190 2900 550 3090 S 20 3530 820 3690 S 1320 4080 60 4200" stroke="url(#lineGold)" fill="none" stroke-width="1.35" vector-effect="non-scaling-stroke"/><path id="thread-progress" d="M 1185 90 C 450 185 1280 570 580 825 S 65 1265 900 1400 S 1200 1765 470 1930 S 130 2290 860 2560 S 1190 2900 550 3090 S 20 3530 820 3690 S 1320 4080 60 4200" fill="none" stroke="#e7c88d" stroke-width="1.7" stroke-linecap="round" vector-effect="non-scaling-stroke" pathLength="1000" stroke-dasharray="95 905" stroke-dashoffset="95"/></svg>`;}
  function servicesCards(){return `<div class="service-grid">${t().services.cards.map((c,i)=>`<a class="service-card reveal" style="--delay:${i*80}ms" href="./services.html#focus-${i+1}"><span class="card-number">${c.n} <span aria-hidden="true" class="card-diagonal">↗</span></span><span class="service-symbol service-symbol--${i+1}" aria-hidden="true">${i===0?'<i></i><i></i><i></i>':i===1?'<i></i><i></i>':'<i></i><i></i><i></i>'}</span><strong>${escapeHtml(c.label)}</strong><span class="service-desc">${escapeHtml(c.desc)}</span><span class="card-link" aria-hidden="true">↗</span></a>`).join('')}</div>`;}
  function home(){
    const c=t();
    $('#main').innerHTML=`<div class="site-story" id="top">${canvas()}
      <section class="hero wrap" aria-label="2L²"><div class="hero-content"><p class="eyebrow hero-kicker reveal">${escapeHtml(c.hero.kicker)}</p><h1 class="hero-title reveal">${lines(c.hero.title)}</h1><p class="lead reveal">${lines(c.hero.body)}</p><div class="hero-actions reveal">${button(c.hero.primary,'#contact')}${button(c.hero.secondary,'#services','outline')}</div><a class="scroll-note" href="#services"><span>${escapeHtml(c.hero.scroll)}</span><span class="scroll-bar"></span></a></div>${visual('chip')}</section>
      <section class="story-section services-section" id="services"><div class="wrap section-layout"><div class="section-intro reveal"><p class="eyebrow">${escapeHtml(c.services.eyebrow)}</p><h2>${lines(c.services.title)}</h2><p class="section-copy">${escapeHtml(c.services.body)}</p><a class="text-link" href="./services.html">${escapeHtml(c.services.action)}${arrow}</a></div>${servicesCards()}</div></section>
      <section class="story-section technology-section" id="technology"><div class="wrap section-layout"><div class="section-intro reveal"><p class="eyebrow">${escapeHtml(c.technology.eyebrow)}</p><h2>${lines(c.technology.title)}</h2><p class="section-copy">${escapeHtml(c.technology.body)}</p><a class="text-link" href="./technology.html">${escapeHtml(c.technology.action)}${arrow}</a></div><div class="tech-scene">${visual('stack')}<div class="tech-labels">${c.technology.layers.map((it,i)=>`<div class="tech-label reveal" style="--delay:${i*80}ms"><span class="tech-dot"></span><div><span class="tech-en">${escapeHtml(it[0])}</span><span>${escapeHtml(it[1])}</span></div></div>`).join('')}</div></div></div></section>
      <section class="story-section projects-section" id="projects"><div class="wrap section-layout"><div class="section-intro reveal"><p class="eyebrow">${escapeHtml(c.projects.eyebrow)}</p><h2>${lines(c.projects.title)}</h2><p class="section-copy">${escapeHtml(c.projects.body)}</p><a class="text-link" href="./projects.html">${escapeHtml(c.projects.action)}${arrow}</a></div><div class="process-grid">${c.projects.items.map((it,i)=>`<a class="process-card reveal" style="--delay:${i*75}ms" href="./projects.html#step-${i+1}"><span class="card-number">${escapeHtml(it[0])}</span><span class="process-figure" aria-hidden="true">${['⌕','□','⌘','▤'][i]}</span><strong>${escapeHtml(it[1])}</strong><span class="service-desc">${escapeHtml(it[2])}</span></a>`).join('')}</div></div></section>
      <section class="story-section company-section" id="company"><div class="wrap company-layout"><div class="section-intro reveal"><p class="eyebrow">${escapeHtml(c.company.eyebrow)}</p><h2>${lines(c.company.title)}</h2><p class="section-copy">${escapeHtml(c.company.body)}</p><a class="text-link" href="./company.html">${escapeHtml(c.company.action)}${arrow}</a></div><div class="company-mark" aria-hidden="true"><span>2L<sup>2</sup></span><span class="mark-grid"></span></div></div></section>
      <section class="story-section contact-section" id="contact"><div class="wrap contact-layout"><div class="section-intro reveal"><p class="eyebrow">${escapeHtml(c.contact.eyebrow)}</p><h2>${lines(c.contact.title)}</h2><p class="section-copy">${escapeHtml(c.contact.body)}</p><div class="contact-action" id="contact-action">${contactButton()}</div></div><div class="portal-scene">${visual('portal')}<span class="portal-caption" aria-hidden="true">2L²</span></div></div></section>
    </div>`;
  }
  function contactButton(){const email=(window.SITE_CONFIG.contactEmail||'').trim();return email ? button(t().contact.emailLabel,`mailto:${email.replace(/[^a-zA-Z0-9@._+\-]/g,'')}`) : `<span class="contact-pending"><span class="pending-dot" aria-hidden="true"></span>${escapeHtml(t().contact.pending)}</span>`;}
  function detail(){
    const c=t(); const key=page==='projects'?'projects':page;
    const data=c[key];if(!data){home();return;}
    const visualKey=page==='technology'?'stack':page==='contact'?'portal':'chip';
    let content='';
    if(page==='services')content=c.services.cards.map((card,i)=>`<article id="focus-${i+1}" class="detail-item reveal"><span class="eyebrow">${card.n}</span><h2>${escapeHtml(card.label)}</h2><p>${escapeHtml(card.desc)}</p></article>`).join('');
    if(page==='technology')content=c.technology.layers.map((it,i)=>`<article class="detail-item reveal"><span class="eyebrow">0${i+1} / ${escapeHtml(it[0])}</span><h2>${escapeHtml(it[1])}</h2></article>`).join('');
    if(page==='projects')content=c.projects.items.map((it,i)=>`<article id="step-${i+1}" class="detail-item reveal"><span class="eyebrow">${escapeHtml(it[0])}</span><h2>${escapeHtml(it[1])}</h2><p>${escapeHtml(it[2])}</p></article>`).join('');
    if(page==='company')content=`<article class="detail-item reveal"><span class="eyebrow">2L²</span><h2>${escapeHtml(c.company.name)}</h2><p>${escapeHtml(c.company.address)}</p></article>`;
    if(page==='contact')content=`<article class="detail-item reveal"><span class="eyebrow">CONTACT</span><h2>${escapeHtml(c.contact.action)}</h2><p>${escapeHtml(c.contact.body)}</p><div class="detail-action">${contactButton()}</div></article>`;
    $('#main').innerHTML=`<div class="site-story detail-story">${canvas()}<section class="detail-hero wrap"><div class="detail-hero-copy reveal"><p class="eyebrow">${escapeHtml(data.eyebrow)}</p><h1>${lines(data.title)}</h1><p class="lead">${escapeHtml(data.body)}</p><a href="./index.html#${page}" class="text-link">← ${escapeHtml(c.detail)}</a></div>${visual(visualKey)}</section><div class="wrap detail-list">${content}</div><div class="wrap detail-end"><a class="text-link" href="./index.html#contact">${escapeHtml(c.nav[5])}${arrow}</a><p>${escapeHtml(c.draft)}</p></div></div>`;
  }
  let observer;
  function activate(){
    root.classList.add('has-motion');
    if(observer)observer.disconnect();
    observer = new IntersectionObserver(entries=>{ for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}} },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    $$('.reveal').forEach(el=>observer.observe(el));
    if(reduced.matches)$$('.reveal').forEach(el=>el.classList.add('is-visible'));
    updateScroll();
  }
  function render(){root.lang=lang;shell(); page==='home'?home():detail();activate(); if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));}}
  $$('.language button').forEach(btn=>btn.addEventListener('click',()=>{if(lang===btn.dataset.lang)return;lang=btn.dataset.lang;try{localStorage.setItem('2l2-lang',lang)}catch(_){}render();}));
  const menu=$('#menu-button');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('#mobile-nav').classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open)});
  $('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');$('#mobile-nav').classList.remove('is-open');document.body.classList.remove('menu-open')}});
  let waiting=false;
  function updateScroll(){waiting=false;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const p=Math.max(0,Math.min(1,scrollY/max));root.style.setProperty('--scroll-progress',p);const h=$('#header');if(h)h.classList.toggle('scrolled',scrollY>28);const hero=$('.hero'),tech=$('.technology-section');if(!reduced.matches){if(hero){const hp=Math.max(0,Math.min(1,(scrollY-hero.offsetTop)/(hero.offsetHeight||1)));root.style.setProperty('--hero-progress',hp);}if(tech){const tr=(innerHeight-tech.getBoundingClientRect().top)/(innerHeight+tech.offsetHeight);root.style.setProperty('--tech-progress',Math.max(0,Math.min(1,tr)));}}}
  addEventListener('scroll',()=>{if(!waiting){waiting=true;requestAnimationFrame(updateScroll)}},{passive:true});addEventListener('resize',updateScroll,{passive:true});
  render();
})();
