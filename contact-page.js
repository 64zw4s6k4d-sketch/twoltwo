/* 2L² Contact Form — lightweight standalone-page i18n and navigation. */
(() => {
  'use strict';
  const langs=['ja','en','th'];
  const buttons=Array.from(document.querySelectorAll('.language button[data-lang]'));
  const backLinks=Array.from(document.querySelectorAll('.contact-form-back,.contact-page .brand,.contact-page .site-footer a[href^="./index.html"]'));
  const query=new URLSearchParams(window.location.search);
  const initial=query.get('lang');
  function languageCopy(path,lang){
    return path.split('.').reduce((value,key)=>value && value[key],window.SITE_COPY?.[lang]);
  }
  function setLang(lang){
    if(!langs.includes(lang))return;
    document.documentElement.lang=lang;
    for(const element of document.querySelectorAll('[data-i18n]')){
      const translation=languageCopy(element.dataset.i18n,lang);
      if(typeof translation!=='string')continue;
      if(element.dataset.html==='true')element.innerHTML=translation;
      else element.textContent=translation;
    }
    for(const element of document.querySelectorAll('[data-i18n-placeholder]')){
      const translation=languageCopy(element.dataset.i18nPlaceholder,lang);
      if(typeof translation==='string')element.placeholder=translation;
    }
    for(const button of buttons){
      const active=button.dataset.lang===lang;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    }
    for(const link of backLinks){
      link.href='./index.html?lang='+encodeURIComponent(lang)+'#contact';
    }
    document.title=(lang==='ja'?'お問い合わせフォーム':lang==='en'?'Contact Form':'แบบฟอร์มติดต่อ')+' | 2L²';
    const receiver=(window.SITE_CONFIG?.contactEmail||'').trim();
    const link=document.querySelector('#email-link');
    const warning=document.querySelector('#contact-unavailable');
    const address=document.querySelector('.contact-email-address');
    const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiver);
    if(link){
      link.hidden=!valid;
      if(valid)link.href='mailto:'+receiver+'?subject='+encodeURIComponent('2L² '+languageCopy('contact.prelude',lang));
    }
    if(address){address.textContent=valid?receiver:'';address.hidden=!valid;}
    if(warning)warning.hidden=valid;
  }
  buttons.forEach(button=>button.addEventListener('click',()=>setLang(button.dataset.lang)));
  setLang(langs.includes(initial)?initial:'ja');
})();
