/* 2L² navigation, accessible localization and service disclosure behavior. */
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
    const pageLinks={
      ja:{strengthsAction:'2L²の強みを詳しく見る',casesAction:'導入事例・検証結果を見る',viewPage:'別ページで詳細を見る'},
      en:{strengthsAction:'Explore our strengths',casesAction:'Explore cases and validation results',viewPage:'OPEN DEDICATED PAGE'},
      th:{strengthsAction:'ดูจุดแข็งของ 2L²',casesAction:'ดูกรณีศึกษาและผลการทดสอบ',viewPage:'เปิดหน้ารายละเอียด'}
    };
    document.querySelectorAll('[data-site-i18n]').forEach(el=>{const text=pageLinks[lang]?.[el.dataset.siteI18n];if(text)el.textContent=text});
    document.querySelectorAll('.hero-actions a[href*=".html"]').forEach(a=>{
      const path=a.getAttribute('href').split('?')[0];
      a.href=path+'?lang='+encodeURIComponent(lang);
    });
    document.querySelectorAll('a.info-entry[href*=".html"]').forEach(a=>{
       const base=a.getAttribute('href').split('?')[0];
       a.href=base+'?lang='+encodeURIComponent(lang);
    });
    document.querySelectorAll('.desktop-nav a[href*=".html"],#mobile-nav a[href*=".html"]').forEach(a=>{
       const base=a.getAttribute('href').split('?')[0];
       a.href=base+'?lang='+encodeURIComponent(lang);
    });
    const philosophyLink=$('#philosophy-page-link');
    if(philosophyLink)philosophyLink.href='./philosophy.html?lang='+encodeURIComponent(lang);
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
  document.querySelectorAll('.architecture-row-link').forEach(link=>{
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
      // Mobile browsers may apply scroll anchoring *after* a native details
      // element collapses. Confirm the heading alignment on the next frames,
      // preventing it from finishing behind the sticky navigation bar.
      const alignNextHeading=()=>{
        if(!next.element.isConnected)return;
        const headerBottom=header?.getBoundingClientRect().bottom||82;
        const desiredTop=Math.max(headerBottom+18,Math.min(window.innerHeight*.22,190));
        const move=next.element.getBoundingClientRect().top-desiredTop;
        if(Math.abs(move)>2){
          window.scrollTo({top:Math.max(0,window.scrollY+move),behavior:'instant'});
        }
      };
      alignNextHeading();
      window.requestAnimationFrame(()=>{
        alignNextHeading();
        window.requestAnimationFrame(alignNextHeading);
      });
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
  // Settle a chapter gently into a readable position once the visitor
  // finishes scrolling. Unlike CSS scroll-snap, this never captures long
  // diagrams, open accordions, hash navigation, or reduced-motion users.
  let snapInProgress=false;
  let snapRelease=null;
  function alignReadingPosition(){
    if(snapDisabled||adjustingCollapse||snapInProgress||reducedMotion.matches||document.hidden)return;
    if(document.querySelector('#mobile-nav.open'))return;
    if(window.getSelection()?.toString().trim())return;
    const focused=document.activeElement;
    if(focused?.matches?.('input,textarea,select,[contenteditable="true"]'))return;

    const viewportHeight=window.innerHeight;
    const scrollY=window.scrollY;
    const maxY=Math.max(0,document.documentElement.scrollHeight-viewportHeight);
    const center=scrollY+viewportHeight*0.5;
    let section=chapters[0];
    for(const chapter of chapters){
      if(chapter.offsetTop<=center)section=chapter;
    }
    if(!section||section.querySelector('details[open]'))return;
    const content=section.querySelector(':scope > .chapter-content')||section;
    const headerHeight=header?.getBoundingClientRect().height||82;
    const safeTop=Math.max(headerHeight+22,Math.min(viewportHeight*.22,185));
    const rect=content.getBoundingClientRect();
    let ideal;

    if(section.id==='home'){
      ideal=0;
    }else if(rect.height<=viewportHeight-headerHeight-55){
      // Compact content sits in the clear vertical area below the menu.
      const desiredTop=Math.max(headerHeight+22,(viewportHeight-rect.height+headerHeight)*.5);
      ideal=scrollY+rect.top-desiredTop;
    }else{
      // Long articles begin below the navigation rather than being centered
      // with their first paragraph partially offscreen.
      const heading=section.querySelector('.manifesto,.section-intro h2,.company-statement h2,.contact-landing h2,h2,h1');
      if(!heading)return;
      ideal=scrollY+heading.getBoundingClientRect().top-safeTop;
    }
    ideal=clamp(ideal,0,maxY);
    const delta=ideal-scrollY;
    if(Math.abs(delta)<10||Math.abs(delta)>Math.min(190,viewportHeight*.29))return;

    snapInProgress=true;
    if(snapRelease)clearTimeout(snapRelease);
    window.scrollTo({top:ideal,behavior:'smooth'});
    snapRelease=window.setTimeout(()=>{
      snapInProgress=false;
      snapRelease=null;
    },850);
  }
  function scheduleReadingAlignment(){
    clearTimeout(snapTimer);
    if(snapDisabled||adjustingCollapse||snapInProgress||reducedMotion.matches)return;
    snapTimer=window.setTimeout(alignReadingPosition,260);
  }

  function onScroll(){
    // Keep the existing read-to-collapse behavior on long service diagrams.
    collapseReadPanelsOnScroll();
    const height=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const progress=clamp(window.scrollY/height,0,1);
    const bar=$('#progress');
    if(bar)bar.style.transform=`scaleX(${progress})`;
    detectChapter();
    header.classList.toggle('scrolled',window.scrollY>30);
    scheduleReadingAlignment();
  }
  window.addEventListener('hashchange',()=>{snapDisabled=true;setTimeout(()=>snapDisabled=false,1500);});
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{if(window.innerWidth!==lastWidth){lastWidth=window.innerWidth;closeMenu();}onScroll();},{passive:true});
  reducedMotion.addEventListener?.('change',onScroll);
  const requestedLang=new URLSearchParams(window.location.search).get('lang');
  applyLanguage(['ja','en','th'].includes(requestedLang)?requestedLang:'ja');onScroll();
})();
