/* 2L² / ONE WORLD: scroll is a camera traveling through ONE scene, not independent slides. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const chapters = $$('.chapter[data-chapter]');
  const frameNodes = $$('.space-frame');
  const scene = $('#scene-3d');
  const header = $('#site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labels = {ja:['ホーム','事業内容','技術紹介','開発・検証','会社概要','お問い合わせ'],en:['HOME','SERVICES','TECHNOLOGY','DEVELOPMENT','COMPANY','CONTACT'],th:['หน้าแรก','บริการ','เทคโนโลยี','การพัฒนา','บริษัท','ติดต่อเรา']};
  let currentLang = 'ja';
  function getCopy(path, lang=currentLang){return path.split('.').reduce((value,part)=>value && value[part], window.SITE_COPY[lang]);}
  function applyLanguage(lang){
    if(!window.SITE_COPY[lang]) return;
    currentLang=lang;document.documentElement.lang=lang;
    $$('[data-i18n]').forEach(node=>{
      const value=getCopy(node.dataset.i18n);if(typeof value!=='string')return;
      if(node.dataset.html==='true'){
        // Only static, authored translation strings are used here; do not paste user-generated HTML.
        node.innerHTML=value;
      }else node.textContent=value;
    });
    $$('.language button').forEach(button=>{const selected=button.dataset.lang===lang;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
    document.title = (lang==='ja'?'2L²｜ローカルAI':lang==='th'?'2L² | โลคัล AI':'2L² | Local AI');
    updateNavigation();
  }
  $$('.language button').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.lang)));
  const menuToggle=$('#menu-toggle'),mobileNav=$('#mobile-nav');
  const closeMenu=()=>{mobileNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open menu');};
  menuToggle.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');});
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  const configuredEmail=(window.SITE_CONFIG?.contactEmail||'').trim();
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail)){
    const link=$('#email-link');link.href=`mailto:${configuredEmail}?subject=${encodeURIComponent('2L² お問い合わせ')}`;link.hidden=false;$('#contact-unavailable').hidden=true;
  }
  $('#year').textContent=String(new Date().getFullYear());
  const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
  let target=0, smooth=0, ticking=false, activeIndex=0, lastWidth=window.innerWidth;
  function updateNavigation(){
    const chapter=chapters[activeIndex], id=chapter?.id||'home';
    $$('.desktop-nav a').forEach(a=>{const selected=a.dataset.nav===id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    $('#rail-label').textContent=`${String(activeIndex+1).padStart(2,'0')} — ${labels[currentLang][activeIndex]}`;
    $('#rail-fill').style.width=`${Math.round((activeIndex+1)/chapters.length*100)}%`;
  }
  function detectChapter(){
    const mid=window.scrollY+window.innerHeight*.53;
    let index=0;
    for(let i=0;i<chapters.length;i++){if(chapters[i].offsetTop<=mid)index=i;}
    if(index!==activeIndex){activeIndex=index;updateNavigation();}
  }
  // Camera journey: each frame approaches, passes and is replaced by the next; there is
  // no per-section background reset, so the environment feels continuous.
  function draw(){
    ticking=false;
    const total=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const progress=clamp(smooth/total,0,1);
    document.documentElement.style.setProperty('--progress',progress.toFixed(5));
    $('#progress').style.transform=`scaleX(${progress})`;
    if(!reducedMotion.matches){
      const pace=smooth/Math.max(680,window.innerHeight*.92);
      const phase=pace*740;
      document.documentElement.style.setProperty('--scene-x',`${Math.sin(pace*.58)*Math.min(window.innerWidth*.06,72)}px`);
      document.documentElement.style.setProperty('--scene-turn',`${Math.sin(pace*.44)*3.9}deg`);
      document.documentElement.style.setProperty('--scene-pitch',`${Math.sin(pace*.33)*1.8}deg`);
      frameNodes.forEach((frame,i)=>{
        const depth=((phase + i*690)%5520)-4320;
        const frontFade=clamp((1100-depth)/650,0,1);
        const farFade=clamp((depth+4270)/650,0,1);
        const opacity=frontFade*farFade*(i%3===0?.74:.48);
        frame.style.setProperty('--depth',`${depth.toFixed(1)}px`);
        frame.style.setProperty('--frame-opacity',opacity.toFixed(3));
        frame.style.setProperty('--frame-blur',`${clamp((depth-550)/380,0,4)}px`);
      });
    }
    if(Math.abs(target-smooth)>.18){smooth+=(target-smooth)*.105;requestAnimationFrame(draw);ticking=true;}else smooth=target;
  }
  function schedule(){if(!ticking){ticking=true;requestAnimationFrame(draw);}}
  function onScroll(){target=window.scrollY;if(reducedMotion.matches){smooth=target;}schedule();detectChapter();header.classList.toggle('scrolled',window.scrollY>30);}
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.target.classList.toggle('is-visible',e.isIntersecting));},{rootMargin:'-7% 0px -10% 0px',threshold:.07});
  $$('.chapter:not(.hero)').forEach(section=>observer.observe(section));
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{if(window.innerWidth!==lastWidth){lastWidth=window.innerWidth;closeMenu();}onScroll();},{passive:true});
  reducedMotion.addEventListener?.('change',onScroll);
  applyLanguage('ja');onScroll();
})();
