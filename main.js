/* 2L² / ONE WORLD — scroll progress, navigation, and language switching. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const chapters = $$('.chapter[data-chapter]');
  const header = $('#site-header');
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
  let activeIndex=0, lastWidth=window.innerWidth;
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
    detectChapter();
    header.classList.toggle('scrolled',window.scrollY>30);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{if(window.innerWidth!==lastWidth){lastWidth=window.innerWidth;closeMenu();}onScroll();},{passive:true});
  applyLanguage('ja');onScroll();
})();
