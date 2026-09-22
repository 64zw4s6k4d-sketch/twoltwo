/* 2L² / CUSTOMER INFORMATION — Reference-inspired, touch-friendly three-scene navigator.
   The WebP animations are the original sprites from the customer's supplied HTML.
   Scene 0: left-facing robot / information handling
   Scene 1: turning robot / information protection policy
   Scene 2: forward-facing robot / onboarding process.
   No claims about operational security practices are made while copy is pending. */
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const stage = $("#customer-stage");
  let sprite = $("#customer-character");
  const tags = $$(".customer-tag");
  const positions = [
    [[15,39],[84,35],[78,78]],
    [[17,75],[15,32],[83,40]],
    [[83,36],[79,78],[15,37]]
  ];
  const mobilePositions = [
    [[28,70],[72,70],[50,90]],
    [[50,90],[28,70],[72,70]],
    [[72,70],[50,90],[28,70]]
  ];
  const media = window.matchMedia("(max-width: 600px)");
  const config = [
    {key:"security",stamp:"SECURITY",no:"01 / 03",asset:"./assets/customer-robot-security.webp",href:"./security.html"},
    {key:"policy",stamp:"POLICY",no:"02 / 03",asset:"./assets/customer-robot-policy.webp",href:"./privacy.html"},
    {key:"process",stamp:"PROCESS",no:"03 / 03",asset:"./assets/customer-robot-process.webp",href:"./onboarding.html"}
  ];
  const copy = {
    ja:{
      title:"お客様向け情報",subtitle:"大切な情報と、よりよい導入のために。",
      hint:"左右にスワイプして項目を切り替えられます",
      home:"ホームに戻る",homeAria:"2L² — ホームに戻る",
      more:"この項目を見る",pending:"詳しい内容は現在準備中です。正式な記載内容を確認後、各ページに掲載します。",
      topics:[
        {title:"情報の安全管理・取り扱い",desc:"情報の管理方法や取り扱いについて、ご案内する項目です。詳細は次のページでご案内します。",alt:"左を向くロボットのアニメーション"},
        {title:"情報保護方針",desc:"2L²の情報保護に関する方針をご案内する項目です。正式な本文は確認後に掲載します。",alt:"横を向くロボットのアニメーション"},
        {title:"導入までの流れ",desc:"お問い合わせから導入までの流れをご案内する項目です。詳細は次のページでご案内します。",alt:"前方を向くロボットのアニメーション"}
      ]
    },
    en:{
      title:"Customer Information",subtitle:"For responsible information handling and a clear path to implementation.",
      hint:"Swipe left or right to explore the three topics",
      home:"Back to home",homeAria:"2L² — Back to home",
      more:"Explore this topic",pending:"Detailed content is being prepared and will be published after review.",
      topics:[
        {title:"Information Security & Handling",desc:"Learn more about how information is handled. The detailed content is being prepared.",alt:"Animated robot facing left"},
        {title:"Information Protection Policy",desc:"Find information about the company's approach to information protection. The full policy is pending review.",alt:"Animated robot turning sideways"},
        {title:"Our Implementation Process",desc:"Learn about the steps from your initial enquiry to implementation. Details will be added to the linked page.",alt:"Animated robot facing forward"}
      ]
    },
    th:{
      title:"ข้อมูลสำหรับลูกค้า",subtitle:"ข้อมูลสำหรับการจัดการข้อมูลและการเริ่มต้นใช้งาน",
      hint:"ปัดซ้ายหรือขวาเพื่อเปลี่ยนหัวข้อ",
      home:"กลับไปหน้าแรก",homeAria:"2L² — กลับไปหน้าแรก",
      more:"ดูรายละเอียดหัวข้อนี้",pending:"รายละเอียดอยู่ระหว่างการจัดเตรียมและจะเผยแพร่หลังตรวจสอบ",
      topics:[
        {title:"การรักษาความปลอดภัยและการจัดการข้อมูล",desc:"ข้อมูลเกี่ยวกับการจัดการข้อมูล โดยรายละเอียดกำลังอยู่ระหว่างการจัดเตรียม",alt:"ภาพเคลื่อนไหวหุ่นยนต์หันไปทางซ้าย"},
        {title:"นโยบายคุ้มครองข้อมูล",desc:"ข้อมูลเกี่ยวกับแนวทางการคุ้มครองข้อมูล โดยเนื้อหาฉบับเต็มอยู่ระหว่างการตรวจสอบ",alt:"ภาพเคลื่อนไหวหุ่นยนต์หันด้านข้าง"},
        {title:"ขั้นตอนการนำไปใช้งาน",desc:"ขั้นตอนตั้งแต่เริ่มติดต่อจนถึงการนำไปใช้งาน โดยจะเพิ่มรายละเอียดในหน้าที่เกี่ยวข้อง",alt:"ภาพเคลื่อนไหวหุ่นยนต์หันไปข้างหน้า"}
      ]
    }
  };
  let index=0,language="ja",start=null,suppressClick=false;
  function place(){
    const positionsForScreen=media.matches?mobilePositions:positions;
    tags.forEach((tag,i)=>{
      const p=positionsForScreen[index][i];
      tag.style.setProperty("--x",p[0]+"%");
      tag.style.setProperty("--y",p[1]+"%");
    });
  }
  function renderScene(restartSprite=true){
    const selection=config[index],current=copy[language];
    stage.dataset.active=String(index);
    tags.forEach((tag,i)=>{
      tag.classList.toggle("active",i===index);
      tag.setAttribute("aria-pressed",String(i===index));
      tag.querySelector(".customer-tag-title").textContent=current.topics[i].title;
    });
    place();
    $("#customer-counter").textContent=selection.no+"  —  "+selection.stamp;
    $("#customer-subsection").textContent=selection.no+" / "+selection.stamp;
    $("#customer-topic-title").textContent=current.topics[index].title;
    $("#customer-topic-description").textContent=current.topics[index].desc;
    const link=$("#customer-details-link");
    link.href=selection.href+(language==="ja"?"":"?lang="+language);
    link.querySelector(".customer-link-word").textContent=current.more;
    $$(".customer-pip").forEach((pip,i)=>{
      pip.classList.toggle("active",i===index);
      pip.setAttribute("aria-pressed",String(i===index));
    });
    if(restartSprite){
      // Replace the image node to play the selected original animated WebP from its first frame.
      const fresh=document.createElement("img");
      fresh.className="customer-character";fresh.id="customer-character";
      fresh.alt=current.topics[index].alt;fresh.draggable=false;
      fresh.src=selection.asset;sprite.replaceWith(fresh);sprite=fresh;
    }else{
      $("#customer-character").alt=current.topics[index].alt;
    }
  }
  function go(next,restart=true){
    index=(next+config.length)%config.length;
    renderScene(restart);
  }
  function setLanguage(next){
    if(!copy[next])return;
    language=next;
    const current=copy[language];
    document.documentElement.lang=language;
    document.title=current.title+" | 2L²";
    $("#customer-page-title").textContent=current.title;
    $("#customer-subtitle").textContent=current.subtitle;
    $("#customer-swipe-hint").textContent=current.hint;
    $("#customer-content-note").textContent=current.pending;
    $("#customer-back-text").textContent=current.home;
    $("#customer-header-logo").setAttribute("aria-label",current.homeAria);
    $$(".customer-language button[data-lang]").forEach(b=>{
      const active=b.dataset.lang===language;
      b.setAttribute("aria-pressed",String(active));
      b.classList.toggle("active",active);
    });
    renderScene(false);
  }
  tags.forEach((tag,i)=>tag.addEventListener("click",()=>{
    if(suppressClick)return;
    go(i);
  }));
  $$(".customer-pip").forEach((pip,i)=>pip.addEventListener("click",()=>go(i)));
  $("#customer-next").addEventListener("click",()=>go(index+1));
  $("#customer-prev").addEventListener("click",()=>go(index-1));
  $$(".customer-language button[data-lang]").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.lang)));
  stage.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse"&&e.button!==0)return;
    start={x:e.clientX,y:e.clientY,id:e.pointerId};suppressClick=false;
  });
  stage.addEventListener("pointerup",e=>{
    if(!start||start.id!==e.pointerId)return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;
    if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2){
      go(index+(dx>0?1:-1));
      suppressClick=true;
      setTimeout(()=>suppressClick=false,80);
    }
  });
  stage.addEventListener("pointercancel",()=>{start=null;});
  stage.addEventListener("keydown",e=>{
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
      e.preventDefault();go(index+(e.key==="ArrowRight"?1:-1));
    }
  });
  stage.addEventListener("wheel",e=>{
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY)*1.6&&Math.abs(e.deltaX)>28){
      e.preventDefault();go(index+(e.deltaX<0?1:-1));
    }
  },{passive:false});
  media.addEventListener?.("change",place);
  const requested=new URLSearchParams(location.search).get("lang");
  setLanguage(copy[requested]?requested:"ja");
  go(0);
})();