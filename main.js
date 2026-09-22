/* 2L² / ONE WORLD — scroll-driven scene, navigation, and cursor glow. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const chapters = $$('.chapter[data-chapter]');
  const frameNodes = $$('.space-frame');
  const header = $('#site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labels = {ja:['ホーム','設計思想','事業内容','技術紹介','開発・検証','会社概要','お問い合わせ'],en:['HOME','APPROACH','SERVICES','TECHNOLOGY','DEVELOPMENT','COMPANY','CONTACT'],th:['หน้าแรก','แนวทาง','บริการ','เทคโนโลยี','การพัฒนา','บริษัท','ติดต่อเรา']};
  let currentLang = 'ja';
  const chapterNumber = (index) => String(index).padStart(2,'0');
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
  const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
  let activeIndex=0, lastWidth=window.innerWidth,snapTimer=null,snapDisabled=false;
  function updateNavigation(){
    const chapter=chapters[activeIndex], id=chapter?.id||'home';
    $$('.desktop-nav a').forEach(a=>{const selected=a.dataset.nav===id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    $('#rail-label').textContent=`${chapterNumber(activeIndex)} — ${labels[currentLang][activeIndex]}`;
    $('#rail-fill').style.width=`${Math.round(activeIndex/Math.max(1,chapters.length-1)*100)}%`;
  }
  function detectChapter(){
    const mid=window.scrollY+window.innerHeight*.53;
    let index=0;
    for(let i=0;i<chapters.length;i++){if(chapters[i].offsetTop<=mid)index=i;}
    if(index!==activeIndex){activeIndex=index;updateNavigation();}
  }
  function onScroll(){
    const total=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const progress=clamp(window.scrollY/total,0,1);
    document.documentElement.style.setProperty('--progress',progress.toFixed(5));
    $('#progress').style.transform=`scaleX(${progress})`;
    // Scroll-driven scene variables (CSS-only, no libraries)
    const vh=Math.max(window.innerHeight,1);
    const approachStart=chapters[1]?.offsetTop||vh;
    const servicesStart=chapters[2]?.offsetTop||vh*2;
    const futureStart=(chapters[5]?.offsetTop||vh*5)-vh*.5;
    const futureEnd=(chapters[6]?.offsetTop||vh*6)+vh*.55;
    const ease=t=>t*t*(3-2*t);
    const gate=ease(clamp((window.scrollY-vh*.12)/Math.max(approachStart-vh*.12,1),0,1));
    const doorVisible=clamp((approachStart+vh*.29-window.scrollY)/(vh*.56),0,1);
    const approach=ease(clamp((window.scrollY-(approachStart-vh*.62))/(vh*.98),0,1));
    const stackExit=clamp((servicesStart-window.scrollY)/(vh*.45),0,1);
    const stackVisible=approach*stackExit;
    const future=ease(clamp((window.scrollY-futureStart)/Math.max(futureEnd-futureStart,1),0,1));
    const set=(name,value)=>document.documentElement.style.setProperty(name,value);
    const rm=reducedMotion.matches;
    set('--portal-open',rm?'0':gate.toFixed(4));
    set('--gpu-door-opacity',rm?'1':doorVisible.toFixed(4));
    set('--door-angle-left',rm?'0deg':(-74*gate).toFixed(2)+'deg');
    set('--door-angle-right',rm?'0deg':(74*gate).toFixed(2)+'deg');
    set('--gpu-door-y',rm?'0px':Math.round(-gate*vh*.05)+'px');
    set('--gpu-door-depth',rm?'0px':Math.round(-160+gate*220)+'px');
    set('--gpu-anchor-opacity',rm?'.36':(.66*Math.max(doorVisible,stackVisible)).toFixed(4));
    set('--gpu-frame-depth',rm?'0px':Math.round(-900+gate*930+approach*140)+'px');
    set('--gpu-stack-opacity',rm?'0':stackVisible.toFixed(4));
    set('--gpu-stack-y',rm?'0px':Math.round((1-approach)*vh*.045+(1-stackExit)*vh*.07)+'px');
    set('--gpu-stack-depth',rm?'0px':Math.round(-1150+approach*1300-(1-stackExit)*1100)+'px');
    set('--future-light',rm?'0':future.toFixed(4));
    set('--future-glow',Math.round(13+future*88)+'px');
    set('--future-alpha',(.045+future*.56).toFixed(4));
    set('--future-border-alpha',(.44+future*.53).toFixed(4));
    set('--future-core-alpha',(.015+future*.14).toFixed(4));
    if(!rm){
      const pace=window.scrollY/Math.max(680,window.innerHeight*.92);
      const phase=pace*740;
      set('--scene-x',`${Math.sin(pace*.58)*Math.min(window.innerWidth*.06,72)}px`);
      set('--scene-turn',`${Math.sin(pace*.44)*3.9}deg`);
      set('--scene-pitch',`${Math.sin(pace*.33)*1.8}deg`);
      frameNodes.forEach((frame,i)=>{
        const depth=((phase+i*690)%5520)-4320;
        const frontFade=clamp((1100-depth)/650,0,1);
        const farFade=clamp((depth+4270)/650,0,1);
        const opacity=frontFade*farFade*(i%3===0?.74:.48);
        frame.style.setProperty('--depth',`${depth.toFixed(1)}px`);
        frame.style.setProperty('--frame-opacity',opacity.toFixed(3));
        frame.style.setProperty('--frame-blur',`${clamp((depth-550)/380,0,4)}px`);
      });
    }
    detectChapter();
    header.classList.toggle('scrolled',window.scrollY>30);
    // Gentle snap — after scrolling stops, settle to the nearest chapter center
    clearTimeout(snapTimer);
    if(!snapDisabled&&!reducedMotion.matches){
      snapTimer=setTimeout(()=>{
        const vh=window.innerHeight;
        let bestTarget=null,bestDist=Infinity;
        chapters.forEach(ch=>{
          const isHero=ch.classList.contains('hero');
          const target=isHero?0:ch.offsetTop+ch.offsetHeight/2-vh/2;
          const dist=Math.abs(window.scrollY-target);
          if(dist<bestDist){bestDist=dist;bestTarget=target;}
        });
        if(bestTarget!==null&&bestDist>8&&bestDist<120){
          window.scrollTo({top:Math.max(0,bestTarget),behavior:'smooth'});
        }
      },200);
    }
  }
  // Cursor glow — elegant golden glow that follows the pointer
  if(window.matchMedia('(hover:hover)').matches){
    const glow=document.createElement('div');
    glow.className='cursor-glow';
    document.body.appendChild(glow);
    let mx=window.innerWidth/2,my=window.innerHeight/2,gx=mx,gy=my;
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
    document.querySelectorAll('a,button,.service-line,.architecture-row,.ledger-row').forEach(el=>{
      el.addEventListener('mouseenter',()=>glow.classList.add('hover'));
      el.addEventListener('mouseleave',()=>glow.classList.remove('hover'));
    });
    (function animate(){
      gx+=(mx-gx)*.18;
      gy+=(my-gy)*.18;
      glow.style.transform=`translate(${gx}px,${gy}px) translate(-50%,-50%)`;
      requestAnimationFrame(animate);
    })();
  }
  window.addEventListener('hashchange',()=>{snapDisabled=true;setTimeout(()=>snapDisabled=false,1500);});
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{if(window.innerWidth!==lastWidth){lastWidth=window.innerWidth;closeMenu();}onScroll();},{passive:true});
  reducedMotion.addEventListener?.('change',onScroll);
  applyLanguage('ja');onScroll();
})();
