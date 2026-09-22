(() => {
  "use strict";
  const COPY = {
    ja: {
      pageTitle:"お客様向け情報 | 2L²", kicker:"CUSTOMER INFORMATION / 2L²", title:"お客様向け情報",
      subtitle:"必要な情報を、わかりやすく。", hint:"右にスワイプして次へ　→　ドラッグ・タップでも操作できます",
      choose:"CHOOSE A TOPIC", chooseText:"周りにある3つの項目を選択するか、右方向へスワイプすると、表示内容とレイアウトが連動して変化します。",
      open:"この項目を見る",
      nav:{home:"ホーム",services:"事業内容",technology:"技術紹介",projects:"開発・検証",company:"会社概要",contact:"お問い合わせ",customer:"お客様向け情報"},
      scenes:[
        {label:"情報保護方針",stamp:"POLICY",en:"01 / INFORMATION PROTECTION POLICY",text:"2L²における情報保護に関する基本的な考え方をご案内する項目です。",href:"./privacy.html"},
        {label:"情報の安全管理・取り扱い",stamp:"SECURITY",en:"02 / INFORMATION SECURITY",text:"情報の安全管理や取り扱いに関する内容をご案内する項目です。",href:"./security.html"},
        {label:"導入までの流れ",stamp:"PROCESS",en:"03 / IMPLEMENTATION PROCESS",text:"ご相談から要件整理・検証・導入までの流れをご案内する項目です。",href:"./onboarding.html"}
      ]
    },
    en: {
      pageTitle:"Customer Information | 2L²", kicker:"CUSTOMER INFORMATION / 2L²", title:"Customer Information",
      subtitle:"Clear information for every step.", hint:"Swipe right for the next topic → You can also drag or tap",
      choose:"CHOOSE A TOPIC", chooseText:"Select one of the three topics around the center, or swipe right to change the active topic and layout.",
      open:"Open this topic",
      nav:{home:"Home",services:"Services",technology:"Technology",projects:"Development",company:"Company",contact:"Contact",customer:"Customer Information"},
      scenes:[
        {label:"Information Protection Policy",stamp:"POLICY",en:"01 / INFORMATION PROTECTION POLICY",text:"An overview of 2L²'s basic approach to information protection.",href:"./privacy.html?lang=en"},
        {label:"Information Security & Handling",stamp:"SECURITY",en:"02 / INFORMATION SECURITY",text:"Information about security management and the handling of information.",href:"./security.html?lang=en"},
        {label:"Our Implementation Process",stamp:"PROCESS",en:"03 / IMPLEMENTATION PROCESS",text:"An overview of the path from consultation and requirements through validation and implementation.",href:"./onboarding.html?lang=en"}
      ]
    },
    th: {
      pageTitle:"ข้อมูลสำหรับลูกค้า | 2L²", kicker:"CUSTOMER INFORMATION / 2L²", title:"ข้อมูลสำหรับลูกค้า",
      subtitle:"ข้อมูลที่จำเป็นในรูปแบบที่เข้าใจง่าย", hint:"ปัดไปทางขวาเพื่อดูหัวข้อถัดไป → สามารถลากหรือแตะได้",
      choose:"CHOOSE A TOPIC", chooseText:"เลือกหนึ่งในสามหัวข้อรอบจุดศูนย์กลาง หรือปัดไปทางขวาเพื่อเปลี่ยนหัวข้อและเลย์เอาต์",
      open:"เปิดหัวข้อนี้",
      nav:{home:"หน้าแรก",services:"บริการ",technology:"เทคโนโลยี",projects:"การพัฒนา",company:"บริษัท",contact:"ติดต่อเรา",customer:"ข้อมูลสำหรับลูกค้า"},
      scenes:[
        {label:"นโยบายคุ้มครองข้อมูล",stamp:"POLICY",en:"01 / INFORMATION PROTECTION POLICY",text:"ภาพรวมแนวทางพื้นฐานของ 2L² ในการคุ้มครองข้อมูล",href:"./privacy.html?lang=th"},
        {label:"การรักษาความปลอดภัยและการจัดการข้อมูล",stamp:"SECURITY",en:"02 / INFORMATION SECURITY",text:"ข้อมูลเกี่ยวกับการรักษาความปลอดภัยและการจัดการข้อมูล",href:"./security.html?lang=th"},
        {label:"ขั้นตอนการนำไปใช้งาน",stamp:"PROCESS",en:"03 / IMPLEMENTATION PROCESS",text:"ภาพรวมขั้นตอนตั้งแต่การปรึกษา การกำหนดความต้องการ การทดสอบ ไปจนถึงการนำไปใช้งาน",href:"./onboarding.html?lang=th"}
      ]
    }
  };

  const stage=document.getElementById("customer-stage");
  const nodes=Array.from(document.querySelectorAll(".customer-node"));
  const pips=Array.from(document.querySelectorAll(".customer-pip"));
  const positions=[
    [[16,38],[84,35],[78,78]],
    [[18,76],[16,32],[83,40]],
    [[83,36],[79,78],[16,37]]
  ];
  const mobilePositions=[
    [[29,70],[72,70],[50,90]],
    [[50,90],[29,70],[72,70]],
    [[72,70],[50,90],[29,70]]
  ];
  const mobile=window.matchMedia("(max-width:600px)");
  let lang="ja",index=0,pointerStart=null,suppressClick=false;

  const q=(s)=>document.querySelector(s);
  const qa=(s)=>Array.from(document.querySelectorAll(s));

  function scene(){return COPY[lang].scenes[index]}
  function place(){
    const layout=(mobile.matches?mobilePositions:positions)[index];
    nodes.forEach((node,i)=>{
      node.style.setProperty("--x",layout[i][0]+"%");
      node.style.setProperty("--y",layout[i][1]+"%");
    });
  }
  function render(){
    const copy=COPY[lang],active=scene();
    document.documentElement.lang=lang;document.title=copy.pageTitle;
    q("#customer-kicker").textContent=copy.kicker;
    q("#customer-title").textContent=copy.title;
    q("#customer-subtitle").textContent=copy.subtitle;
    q("#customer-hint-text").textContent=copy.hint;
    q("#customer-choose").textContent=copy.choose;
    q("#customer-choose-text").textContent=copy.chooseText;
    q("#customer-open-text").textContent=copy.open;
    qa("[data-nav-key]").forEach(a=>{a.textContent=copy.nav[a.dataset.navKey]||a.textContent});
    COPY[lang].scenes.forEach((item,i)=>{
      const n=nodes[i];n.querySelector("small").textContent=String(i+1).padStart(2,"0")+" / "+item.stamp;
      n.querySelector("strong").textContent=item.label;
    });
    stage.dataset.active=String(index);
    nodes.forEach((n,i)=>{const activeNode=i===index;n.classList.toggle("active",activeNode);n.setAttribute("aria-pressed",String(activeNode))});
    pips.forEach((p,i)=>p.classList.toggle("active",i===index));
    q("#customer-counter").textContent=String(index+1).padStart(2,"0")+" / 03  —  "+active.stamp;
    q("#customer-section-en").textContent=active.en;
    q("#customer-section-title").textContent=active.label;
    q("#customer-section-description").textContent=active.text;
    q("#customer-detail-link").href=active.href;
    qa(".customer-language button").forEach(b=>{const a=b.dataset.lang===lang;b.classList.toggle("active",a);b.setAttribute("aria-pressed",String(a))});
    place();
  }
  function go(to){index=(to+3)%3;render()}

  nodes.forEach((node,i)=>node.addEventListener("click",e=>{if(suppressClick){e.preventDefault();return}go(i)}));
  q("#customer-next").addEventListener("click",()=>go(index+1));
  q("#customer-prev").addEventListener("click",()=>go(index-1));
  qa(".customer-language button").forEach(button=>button.addEventListener("click",()=>{lang=button.dataset.lang;render()}));

  stage.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;pointerStart={x:e.clientX,y:e.clientY,id:e.pointerId};suppressClick=false});
  stage.addEventListener("pointerup",e=>{
    if(!pointerStart||pointerStart.id!==e.pointerId)return;
    const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;pointerStart=null;
    if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2){go(index+(dx>0?1:-1));suppressClick=true;setTimeout(()=>suppressClick=false,80)}
  });
  stage.addEventListener("pointercancel",()=>{pointerStart=null});
  stage.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();go(index+(e.key==="ArrowRight"?1:-1))}});
  stage.addEventListener("wheel",e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)*1.6&&Math.abs(e.deltaX)>28){e.preventDefault();go(index+(e.deltaX<0?1:-1))}},{passive:false});
  mobile.addEventListener?.("change",place);

  const initial=new URLSearchParams(location.search).get("lang");
  if(COPY[initial])lang=initial;
  render();
})();