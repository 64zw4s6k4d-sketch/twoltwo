/* 2L² contact form — no external endpoint; prepares a draft in the visitor's mail app. */
(() => {
  'use strict';
  const form=document.querySelector('#contact-form');
  if(!form)return;
  const fields={
    company:form.querySelector('#contact-company'),
    name:form.querySelector('#contact-name'),
    email:form.querySelector('#contact-email'),
    phone:form.querySelector('#contact-phone'),
    category:form.querySelector('#contact-category'),
    message:form.querySelector('#contact-message')
  };
  const reopen=form.querySelector('#contact-mailto-open');
  const status=form.querySelector('#contact-form-status');
  const count=form.querySelector('#contact-message-count');
  const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function language(){return window.SITE_COPY?.[document.documentElement.lang] ? document.documentElement.lang : 'ja';}
  function translated(key){return window.SITE_COPY?.[language()]?.contact?.[key]||'';}
  function showStatus(key){
    status.dataset.i18n='contact.'+key;
    status.textContent=translated(key);
    status.hidden=false;
  }
  function removeDraft(){
    reopen.hidden=true;
    reopen.removeAttribute('href');
    status.hidden=true;
    status.textContent='';
    delete status.dataset.i18n;
  }
  function refreshCount(){count.textContent=String(Array.from(fields.message.value).length);}
  refreshCount();

  for(const field of Object.values(fields)){
    field.addEventListener('input',()=>{
      field.setCustomValidity('');
      removeDraft();
      if(field===fields.message)refreshCount();
    });
    field.addEventListener('change',()=>{field.setCustomValidity('');removeDraft();});
  }

  form.addEventListener('submit',(event)=>{
    event.preventDefault();
    const trimmed={};
    for(const [name,field] of Object.entries(fields)){
      trimmed[name]=field.value.trim();
      if(field.tagName!=='SELECT')field.value=trimmed[name];
      field.setCustomValidity('');
    }
    refreshCount();

    // HTML's required check accepts whitespace-only names/messages. Reject them.
    for(const field of [fields.name,fields.message]){
      if(!field.value.trim())field.setCustomValidity(translated('statusInvalid'));
    }
    if(fields.email.value && !emailPattern.test(fields.email.value)){
      fields.email.setCustomValidity(translated('statusInvalid'));
    }
    if(!form.reportValidity()){
      showStatus('statusInvalid');
      return;
    }

    const receiver=(window.SITE_CONFIG?.contactEmail||'').trim();
    if(!emailPattern.test(receiver)){
      showStatus('statusError');
      return;
    }

    const type=fields.category.selectedOptions[0]?.textContent?.trim()||trimmed.category;
    const inJapanese=language()==='ja';
    const subject=(inJapanese?'【2L²】お問い合わせ':'[2L²] Inquiry')+' / '+type;
    const lines=[
      '2L² / CONTACT',
      '',
      (inJapanese?'お問い合わせ種別':'Inquiry type')+': '+type,
      (inJapanese?'会社・団体名':'Company')+': '+(trimmed.company||'—'),
      (inJapanese?'お名前':'Name')+': '+trimmed.name,
      (inJapanese?'メールアドレス':'Email')+': '+trimmed.email,
      (inJapanese?'電話番号':'Phone')+': '+(trimmed.phone||'—'),
      '',
      inJapanese?'【お問い合わせ内容】':'【Message】',
      trimmed.message
    ];
    const draft='mailto:'+receiver+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
    reopen.href=draft;
    reopen.hidden=false;
    showStatus('statusCompose');
    // Opening a mail app is not equivalent to sending the message.
    reopen.click();
  });
})();
