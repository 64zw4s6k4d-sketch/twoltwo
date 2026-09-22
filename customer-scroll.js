/* Customer information index: immediately accessible topics, no scroll animation.
   The page's three direct links always remain functional without JavaScript. */
(() => {
  "use strict";
  const COPY={
    ja:{
      title:"お客様向け情報",subtitle:"ご覧になりたい項目をお選びください。",
      footnote:"各項目の詳しい内容は現在準備中です。",home:"ホームへ ↗",cta:"詳しく見る",
      nav:{home:"ホーム",services:"事業内容",technology:"技術紹介",projects:"開発・検証",company:"会社概要",contact:"お問い合わせ",customer:"お客様向け情報"},
      topics:[
        {title:"情報保護方針",description:"情報保護に関する方針",href:"./privacy.html"},
        {title:"情報の安全管理・取り扱い",description:"情報の安全管理と取り扱い",href:"./security.html"},
        {title:"導入までの流れ",description:"ご相談から導入まで",href:"./onboarding.html"}
      ]
    },
    en:{
      title:"Customer Information",subtitle:"Select the information you need.",
      footnote:"Detailed content for each topic is currently being prepared.",home:"Home ↗",cta:"View details",
      nav:{home:"Home",services:"Services",technology:"Technology",projects:"Development",company:"Company",contact:"Contact",customer:"Customer Information"},
      topics:[
        {title:"Information Protection Policy",description:"Our approach to information protection",href:"./privacy.html?lang=en"},
        {title:"Information Security & Handling",description:"Security management and handling of information",href:"./security.html?lang=en"},
        {title:"Our Implementation Process",description:"From consultation to implementation",href:"./onboarding.html?lang=en"}
      ]
    },
    th:{
      title:"ข้อมูลสำหรับลูกค้า",subtitle:"เลือกข้อมูลที่ต้องการอ่าน",
      footnote:"เนื้อหารายละเอียดของแต่ละหัวข้ออยู่ระหว่างการจัดเตรียม",home:"หน้าแรก ↗",cta:"ดูรายละเอียด",
      nav:{home:"หน้าแรก",services:"บริการ",technology:"เทคโนโลยี",projects:"การพัฒนา",company:"บริษัท",contact:"ติดต่อเรา",customer:"ข้อมูลสำหรับลูกค้า"},
      topics:[
        {title:"นโยบายคุ้มครองข้อมูล",description:"แนวทางการคุ้มครองข้อมูล",href:"./privacy.html?lang=th"},
        {title:"การรักษาความปลอดภัยและการจัดการข้อมูล",description:"การรักษาความปลอดภัยและการจัดการข้อมูล",href:"./security.html?lang=th"},
        {title:"ขั้นตอนการนำไปใช้งาน",description:"จากการปรึกษาไปจนถึงการนำไปใช้งาน",href:"./onboarding.html?lang=th"}
      ]
    }
  };
  const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
  function setLanguage(lang){
    const copy=COPY[lang];
    if(!copy)return;
    document.documentElement.lang=lang;
    document.title=copy.title+" | 2L²";
    $("#customer-title").textContent=copy.title;
    $("#customer-subtitle").textContent=copy.subtitle;
    $("#customer-footnote").textContent=copy.footnote;
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