/* Customer information index: immediately accessible topics, no scroll animation.
   The page's three direct links always remain functional without JavaScript. */
(() => {
  "use strict";
  const COPY={
    ja:{
      title:"お客様向け情報",subtitle:"ご覧になりたい項目をお選びください。",
      footnote:"情報保護に関する方針と導入までの流れをご案内します。",home:"ホームへ ↗",cta:"詳しく見る",
      nav:{home:"ホーム",services:"事業内容",technology:"2L²の強み",projects:"導入事例・検証結果",company:"会社概要",contact:"お問い合わせ",customer:"お客様向け情報"},
      topics:[
        {title:"情報保護方針",description:"情報保護に関する方針",href:"./information-protection.html"},
        {title:"情報の安全管理・取り扱い",description:"情報の安全管理と取り扱い",href:"./information-security.html"},
        {title:"導入までの流れ",description:"ご相談から導入まで",href:"./onboarding.html"}
      ]
    },
    en:{
      title:"Customer Information",subtitle:"Select the information you need.",
      footnote:"Explore our information policies and implementation process.",home:"Home ↗",cta:"View details",
      nav:{home:"Home",services:"Services",technology:"Our Strengths",projects:"Cases & Results",company:"Company",contact:"Contact",customer:"Customer Information"},
      topics:[
        {title:"Information Protection Policy",description:"Our approach to information protection",href:"./information-protection.html?lang=en"},
        {title:"Information Security & Handling",description:"Security management and handling of information",href:"./information-security.html?lang=en"},
        {title:"Our Implementation Process",description:"From consultation to implementation",href:"./onboarding.html?lang=en"}
      ]
    },
    th:{
      title:"ข้อมูลสำหรับลูกค้า",subtitle:"เลือกข้อมูลที่ต้องการอ่าน",
      footnote:"ดูนโยบายข้อมูลและขั้นตอนการนำระบบไปใช้งาน",home:"หน้าแรก ↗",cta:"ดูรายละเอียด",
      nav:{home:"หน้าแรก",services:"บริการ",technology:"จุดแข็งของ 2L²",projects:"กรณีศึกษาและผลการทดสอบ",company:"บริษัท",contact:"ติดต่อเรา",customer:"ข้อมูลสำหรับลูกค้า"},
      topics:[
        {title:"นโยบายคุ้มครองข้อมูล",description:"แนวทางการคุ้มครองข้อมูล",href:"./information-protection.html?lang=en"},
        {title:"การรักษาความปลอดภัยและการจัดการข้อมูล",description:"การรักษาความปลอดภัยและการจัดการข้อมูล",href:"./information-security.html?lang=en"},
        {title:"ขั้นตอนการนำไปใช้งาน",description:"จากการปรึกษาไปจนถึงการนำไปใช้งาน",href:"./onboarding.html?lang=th"}
      ]
    }
  };
  const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
  function setLanguage(lang){
    const copy=COPY[lang];
    if(!copy)return;
    document.documentElement.lang=lang;
    window.dispatchEvent(new CustomEvent("customer-language-change",{detail:{lang}}));
    document.title=copy.title+" | 2L²";
    $("#customer-title").textContent=copy.title;
    $("#customer-subtitle").textContent=copy.subtitle;
    $("#customer-footnote").textContent=copy.footnote;
    const titles={
      ja:['情報保護方針','情報の安全管理・取扱','個人情報保護方針'],
      en:['Information Protection Policy','Information Security and Data Handling','Privacy Policy'],
      th:['นโยบายคุ้มครองข้อมูล','การรักษาความปลอดภัยและการจัดการข้อมูล','นโยบายความเป็นส่วนตัว']
    };
    $(".customer-policy-footer a").forEach((link,i)=>{
      link.textContent=titles[lang][i];
      const file=link.dataset.policyFile;
      link.href='./'+file+'?lang='+(lang==='th'?'en':lang);
    });
    $("#customer-home-mobile").textContent=copy.home;
    $$("[data-nav-key]").forEach(link=>link.textContent=copy.nav[link.dataset.navKey]);
    const cards=$$(".customer-card");
    cards.forEach((card,i)=>{
      const topic=copy.topics[i];
      card.href=topic.href;
      card.setAttribute("aria-label",topic.title);
      card.querySelector(".customer-card-title").textContent=topic.title;
      card.querySelector(".customer-card-description").textContent=topic.description;
      // textContent on the element would remove the arrow; update only the leading text node.
      const cta=card.querySelector(".customer-card-cta");
      const label=cta.firstChild;
      if(label && label.nodeType===Node.TEXT_NODE)label.textContent=copy.cta+" ";
    });
    $$(".customer-language button").forEach(button=>{
      const selected=button.dataset.lang===lang;
      button.classList.toggle("active",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
  }
  $$(".customer-language button").forEach(button=>{
    button.addEventListener("click",()=>setLanguage(button.dataset.lang));
  });
  const initial=new URLSearchParams(window.location.search).get("lang");
  setLanguage(COPY[initial]?initial:"ja");
})();