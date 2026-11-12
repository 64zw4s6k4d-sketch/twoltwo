/* 2L² draft legal pages: readable JA/EN, no external calls or form submissions. */
(()=>{'use strict';
 const langs={ja:{home:'ホームへ戻る',protection:'情報保護方針',security:'情報の安全管理・取扱',privacy:'個人情報保護方針'},en:{home:'Back to homepage',protection:'Information Protection Policy',security:'Information Security and Data Handling',privacy:'Privacy Policy'}};
 const selected=new URLSearchParams(location.search).get('lang');
 const panels=[...document.querySelectorAll('[data-policy-lang]')];
 const controls=[...document.querySelectorAll('.language button[data-lang]')];
 const id=document.body.dataset.policyDocument;
 function setLanguage(lang){
  if(!langs[lang])return;
  document.documentElement.lang=lang;
  for(const panel of panels)panel.hidden=panel.dataset.policyLang!==lang;
  for(const button of controls){
   const active=button.dataset.lang===lang;
   button.setAttribute('aria-pressed',String(active));
   button.classList.toggle('active',active);
  }
  document.title=langs[lang][id]+' | 2L²';
  for(const el of document.querySelectorAll('[data-legal-i18n]'))el.textContent=langs[lang][el.dataset.legalI18n]||langs[lang].home;
  const old=decodeURIComponent(location.hash.slice(1));
  const match=old.match(/^policy-(?:protection|security|privacy)-(?:ja|en)-section-(\d+)$/);
  if(match)history.replaceState(null,'','#policy-'+id+'-'+lang+'-section-'+match[1]);
 }
 for(const button of controls)button.addEventListener('click',()=>setLanguage(button.dataset.lang));
 setLanguage(langs[selected]?selected:'ja');
})();