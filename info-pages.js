/* Separate information pages: same translations as the homepage, simple navigation. */
(() => {
 'use strict';
 const names={
 ja:{back:'ホームへ戻る',process:'導入までの流れ',inquiry:'お問い合わせ',strengthsAction:'2L²の強みを詳しく見る',casesAction:'導入事例・検証結果を詳しく見る'},
 en:{back:'Back to homepage',process:'Implementation process',inquiry:'Contact us',strengthsAction:'Explore our strengths',casesAction:'View cases and validation'},
 th:{back:'กลับไปหน้าแรก',process:'ขั้นตอนการนำไปใช้',inquiry:'ติดต่อเรา',strengthsAction:'ดูจุดแข็งของ 2L²',casesAction:'ดูกรณีศึกษาและผลการทดสอบ'}
 };
 const btns=Array.from(document.querySelectorAll('.language button[data-lang]'));
 const selected=new URLSearchParams(location.search).get('lang');
 const ctdPanel=document.getElementById('case-ctd');
 const ctdTrigger=document.getElementById('case-ctd-toggle');
 const ctdClose=document.getElementById('case-ctd-close');
 function syncCaseButton(lang=document.documentElement.lang){
   if(!ctdPanel||!ctdTrigger)return;
   const open=!ctdPanel.hidden;
   ctdTrigger.setAttribute('aria-expanded',String(open));
   const label=ctdTrigger.querySelector('[data-i18n]');
   if(label){
     label.dataset.i18n=open?'projects.caseClose':'projects.caseOpen';
     const translated=translate(label.dataset.i18n,lang);
     if(typeof translated==='string')label.textContent=translated;
   }
   const marker=ctdTrigger.querySelector('.case-detail-trigger-icon');
   if(marker)marker.textContent=open?'−':'＋';
 }
 function toggleCase(open,{updateHash=false,scroll=true}={}){
   if(!ctdPanel||!ctdTrigger)return;
   ctdPanel.hidden=!open;
   syncCaseButton();
   if(updateHash)window.history.pushState(null,'',open?'#case-ctd':'#case-list');
   if(scroll){
     const target=open?ctdPanel:document.getElementById('case-list');
     requestAnimationFrame(()=>target?.scrollIntoView({
       block:'start',behavior:'smooth'
     }));
   }
 }
 ctdTrigger?.addEventListener('click',()=>toggleCase(ctdPanel.hidden,{updateHash:true}));
 ctdClose?.addEventListener('click',()=>toggleCase(false,{updateHash:true}));

 function translate(path,lang){return path.split('.').reduce((x,key)=>x?.[key],window.SITE_COPY?.[lang]);}
 function setLang(lang){
   if(!names[lang])return;
   document.documentElement.lang=lang;
   for(const node of document.querySelectorAll('[data-i18n]')){
     const translation=translate(node.dataset.i18n,lang);
     if(typeof translation!=='string')continue;
     if(node.dataset.html==='true')node.innerHTML=translation;
     else node.textContent=translation;
   }
   for(const node of document.querySelectorAll('[data-site-i18n]')){
     const key=node.dataset.siteI18n;
     if(names[lang][key])node.textContent=names[lang][key];
   }
   btns.forEach(button=>{const active=button.dataset.lang===lang;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
   for(const node of document.querySelectorAll('.info-nav a,.info-footer a,a[data-language-link]')){
     const url=new URL(node.getAttribute('href'),location.href);
     url.searchParams.set('lang',lang);
     node.href=url.pathname.split('/').at(-1)+url.search+url.hash;
   }
   syncCaseButton(lang);
   const type=document.body.dataset.informationPage;
   const title=type==='philosophy'?translate('philosophyPage.label',lang):(type==='cases'?translate('nav.projects',lang):translate('nav.technology',lang));
   document.title=title+' | 2L²';
 }
 btns.forEach(node=>node.addEventListener('click',()=>setLang(node.dataset.lang)));
 const init=names[selected]?selected:'ja';
 setLang(init);
 function reveal(){
   const id=decodeURIComponent(location.hash.slice(1));
   if(ctdPanel && id==='case-ctd'){
     toggleCase(true,{scroll:false});
     requestAnimationFrame(()=>ctdPanel.scrollIntoView({block:'start',behavior:'instant'}));
     return;
   }
   if(ctdPanel && id==='case-list'){
     toggleCase(false,{scroll:false});
   }
   const el=document.getElementById(id);
   if(!el)return;
   const panel=el.matches('details')?el:el.closest('details');
   if(panel)panel.open=true;
   requestAnimationFrame(()=>{(panel?.querySelector('summary')||el).scrollIntoView({block:'start',behavior:'instant'})});
 }
 document.querySelectorAll('.architecture-row-link').forEach(link=>{
   link.addEventListener('click',event=>{
     const href=link.getAttribute('href');
     if(!href?.startsWith('#'))return;
     const target=document.querySelector(href);
     if(!target?.matches('details'))return;
     event.preventDefault();
     target.open=true;
     if(location.hash!==href)history.pushState(null,'',href);
     requestAnimationFrame(()=>target.querySelector('summary')?.scrollIntoView({block:'start',behavior:'instant'}));
   });
 });
 window.addEventListener('hashchange',reveal);
 window.addEventListener('popstate',reveal);
 reveal();
 // The details can be closed after being read, but never from the jump that opens them.
 const panels=[...document.querySelectorAll('details.technology-proof')];
 const seen=new WeakSet();let lastScroll=scrollY;
 window.addEventListener('scroll',()=>{
   const now=scrollY;const down=now>lastScroll+0.5;lastScroll=now;if(!down)return;
   for(const p of panels){if(!p.open)continue;
     const rect=p.querySelector('.technology-proof-body')?.getBoundingClientRect();
     if(!rect)continue;
     if(rect.top<innerHeight*.78&&rect.bottom>innerHeight*.25)seen.add(p);
     if(seen.has(p)&&rect.bottom<=innerHeight*.25){p.open=false;break}
   }
 },{passive:true});
})();