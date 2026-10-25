/* 2L² / ONE WORLD — scroll-driven scene, navigation, and cursor glow. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const chapters = $$('.chapter[data-chapter]');
  const frameNodes = $$('.space-frame');
  const header = $('#site-header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labels = {ja:['ホーム','設計思想','事業内容','2L²の強み','導入事例・検証結果','会社概要','お問い合わせ'],en:['HOME','APPROACH','SERVICES','STRENGTHS','CASES & RESULTS','COMPANY','CONTACT'],th:['หน้าแรก','แนวทาง','บริการ','จุดแข็งของ 2L²','กรณีศึกษาและผลการทดสอบ','บริษัท','ติดต่อเรา']};
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
    document.querySelectorAll('[data-i18n-placeholder]').forEach(node=>{
      const value=getCopy(node.dataset.i18nPlaceholder);
      if(typeof value==='string')node.setAttribute('placeholder',value);
    });
    const formOpen=$('#contact-form-open');
    if(formOpen)formOpen.href='./contact-form.html?lang='+encodeURIComponent(lang);
    document.querySelectorAll('.language button').forEach(button=>{const selected=button.dataset.lang===lang;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
    document.title = (lang==='ja'?'2L²｜ローカルAI':lang==='th'?'2L² | โลคัล AI':'2L² | Local AI');
    updateNavigation();
  }
  $$('.language button').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.lang)));
  // Deep links to any inline demonstration open that panel; external pages
  // and ordinary navigation links are unaffected.
  function revealLinkedService() {
    const id=decodeURIComponent(window.location.hash.slice(1));
    if(!id)return;
    const target=document.getElementById(id);
    const details=target?.matches('details')?target:target?.closest('details');
    if(!details || !details.querySelector(':scope > summary'))return;
    details.open=true;
    const heading=details.querySelector(':scope > summary');
    // Correct the initial fragment scroll after expanding a previously closed panel.
    window.requestAnimationFrame(()=>heading.scrollIntoView({block:'start',behavior:'auto'}));
  }
  window.addEventListener('hashchange',revealLinkedService);
  revealLinkedService();
  // Clicking a strengths entry must not invoke the browser's default hash
  // jump before the collapsed panel has been opened and laid out.
  $('.architecture-row-link').forEach(link=>{
    link.addEventListener('click',event=>{
      const ref=link.getAttribute('href');
      if(!ref?.startsWith('#'))return;
      const proof=document.getElementById(ref.slice(1));
      if(!proof?.matches('details'))return;
      event.preventDefault();
      proof.open=true;
      // Preserve native back-button navigation while avoiding a second
      // viewport jump from the fragment's default action.
      if(window.location.hash!==ref)window.history.pushState(null,'',ref);
      window.requestAnimationFrame(()=>{
        proof.querySelector(':scope > summary')?.scrollIntoView({
          block:'start',behavior:'instant'
        });
      });
    });
  });
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
  // Apply the same read-and-collapse rule to every inline <details> panel.
  // Ordinary links to customer.html, onboarding.html, etc. are not affected.
  const autoCollapsePanels=$$('details').filter(panel=>panel.querySelector(':scope > summary') && panel.dataset.autoCollapse!=='false');
  let previousScrollY=window.scrollY;
  let adjustingCollapse=false;
  let collapseUnlock=null;
  const readInlinePanels=new WeakSet();
  autoCollapsePanels.forEach(panel=>{
    panel.addEventListener('toggle',()=>{
      // Closing or reopening starts a fresh reading session.
      if(!panel.open)readInlinePanels.delete(panel);
    });
  });

  function expandedBody(panel){
    return panel.querySelector(':scope > .service-detail-panel')
      || Array.from(panel.children).find(el=>el.tagName!=='SUMMARY');
  }

  function followingSection(panel){
    // Adjacent accordion rows hand off to the next row. If this is the last
    // row, hand off to the heading of the next page section instead.
    const nextPanel=panel.nextElementSibling?.matches('details')?panel.nextElementSibling:null;
    if(nextPanel)return {element:nextPanel.querySelector(':scope > summary'),open:nextPanel};
    const chapter=panel.closest('.chapter');
    const nextChapter=chapter?.nextElementSibling;
    return {element:nextChapter?.querySelector('.section-topline, h2, h1')||null,open:null};
  }

  function closeFinishedPanel(panel){
    if(adjustingCollapse||!panel.open)return;
    adjustingCollapse=true;
    clearTimeout(snapTimer);
    if(collapseUnlock)clearTimeout(collapseUnlock);
    snapDisabled=true;
    const next=followingSection(panel);
    // Keep the next accordion closed: visitors open it only by clicking.
    // Preserve the existing automatic scroll alignment to its heading.
    panel.open=false;

    // All geometry is measured AFTER collapsing the long section. Place the
    // next heading near the upper quarter of the viewport in one operation:
    // no delayed closing, no giant animated scroll or visible layout jump.
    if(next.element){
      const headerBottom=header?.getBoundingClientRect().bottom||82;
      const desiredTop=Math.max(headerBottom+18,Math.min(window.innerHeight*.22,190));
      const move=next.element.getBoundingClientRect().top-desiredTop;
      if(Math.abs(move)>1){
        window.scrollTo({top:Math.max(0,window.scrollY+move),behavior:'instant'});
      }
    }
    previousScrollY=window.scrollY;
    adjustingCollapse=false;
    collapseUnlock=window.setTimeout(()=>{snapDisabled=false;collapseUnlock=null;},650);
  }

  function collapseReadPanelsOnScroll(){
    const currentY=window.scrollY;
    const scrollingDown=currentY>previousScrollY+0.5;
    previousScrollY=currentY;
    if(!scrollingDown||adjustingCollapse)return;
    const quarter=window.innerHeight*.25;
    for(const panel of autoCollapsePanels){
      if(!panel.open)continue;
      const content=expandedBody(panel);
      if(!content)continue;
      const rect=content.getBoundingClientRect();
      // A panel opened via a deep link must be visibly read before it can
      // auto-collapse. Jumping to a distant anchor is not reading the content.
      if(rect.top<window.innerHeight*.82 && rect.bottom>quarter){
        readInlinePanels.add(panel);
      }
      // Close only AFTER the entire expanded content (including the last
      // slide and its notes) has moved above the 25%-from-top guide.
      if(readInlinePanels.has(panel) && rect.bottom<=quarter){
        closeFinishedPanel(panel);
        return;
      }
    }
  }
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
    collapseReadPanelsOnScroll();
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
    // Fade the intact front chip away as the visitor scrolls; no door opening.
    const chipFade=ease(clamp((window.scrollY-vh*.12)/(vh*.95),0,1));
    const doorVisible=1-chipFade;
    const approach=ease(clamp((window.scrollY-(approachStart-vh*.62))/(vh*.98),0,1));
    const stackExit=clamp((servicesStart-window.scrollY)/(vh*.45),0,1);
    const stackVisible=approach*stackExit;
    const future=ease(clamp((window.scrollY-futureStart)/Math.max(futureEnd-futureStart,1),0,1));
    const set=(name,value)=>document.documentElement.style.setProperty(name,value);
    const rm=reducedMotion.matches;
    // Keep both halves joined into one stationary chip. Only opacity changes.
    set('--portal-open','0');
    set('--gpu-door-opacity',rm?(window.scrollY<vh*.75?'1':'0'):doorVisible.toFixed(4));
    set('--door-angle-left','0deg');
    set('--door-angle-right','0deg');
    set('--gpu-door-y','0px');
    set('--gpu-door-depth','-160px');
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
        // The Local LLM illustrated walkthrough is intentionally long.
        // Do not snap while the visitor is reading within that chapter.
        const servicesChapter=$('#services');
        if(servicesChapter && servicesChapter.offsetHeight > vh*1.8){
          const position=window.scrollY+vh*.5;
          const start=servicesChapter.offsetTop;
          if(position>=start && position<=start+servicesChapter.offsetHeight)return;
        }
        let bestTarget=null,bestDist=Infinity;
        chapters.forEach(ch=>{
          let target;
          if(ch.classList.contains('hero')){target=0;}
          else if(ch.id==='philosophy'){target=ch.offsetTop+vh*.29;}
          else{target=ch.offsetTop+ch.offsetHeight/2-vh/2;}
          const dist=Math.abs(window.scrollY-target);
          if(dist<bestDist){bestDist=dist;bestTarget=target;}
        });
        if(bestTarget!==null&&bestDist>8&&bestDist<120){
          window.scrollTo({top:Math.max(0,bestTarget),behavior:'smooth'});
        }
      },200);
    }
  }
  // Cursor glow — golden ring that glows while the pointer moves
  if(window.matchMedia('(hover:hover)').matches){
    const glow=document.createElement('div');
    glow.className='cursor-glow';
    document.body.appendChild(glow);
    let mx=window.innerWidth/2,my=window.innerHeight/2,gx=mx,gy=my,moveTimer=null;
    document.addEventListener('mousemove',e=>{
      mx=e.clientX;my=e.clientY;
      glow.classList.add('active');
      clearTimeout(moveTimer);
      moveTimer=setTimeout(()=>glow.classList.remove('active'),400);
    });
    document.querySelectorAll('a,button,.service-line,.architecture-row,.ledger-row').forEach(el=>{
      el.addEventListener('mouseenter',()=>glow.classList.add('hover'));
      el.addEventListener('mouseleave',()=>glow.classList.remove('hover'));
    });
    (function animate(){
      gx+=(mx-gx)*.2;
      gy+=(my-gy)*.2;
      glow.style.transform=`translate(${gx}px,${gy}px) translate(-50%,-50%)`;
      requestAnimationFrame(animate);
    })();
  }
  window.addEventListener('hashchange',()=>{snapDisabled=true;setTimeout(()=>snapDisabled=false,1500);});
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{if(window.innerWidth!==lastWidth){lastWidth=window.innerWidth;closeMenu();}onScroll();},{passive:true});
  reducedMotion.addEventListener?.('change',onScroll);
  const requestedLang=new URLSearchParams(window.location.search).get('lang');
  applyLanguage(['ja','en','th'].includes(requestedLang)?requestedLang:'ja');onScroll();
})();
