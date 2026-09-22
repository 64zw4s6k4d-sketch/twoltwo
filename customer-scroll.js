/* 2L² / CUSTOMER — vertical scroll is the only navigation required.
   All three user-supplied animated robot sprites stay mounted: never swap src
   or restart a sprite during a scroll. Cross-fade and camera motion are continuous. */
(() => {
  "use strict";
  const $=selector=>document.querySelector(selector);
  const $$=selector=>Array.from(document.querySelectorAll(selector));
  const root=$("#customer-journey"),steps=$$(".customer-step"),points=$$(".customer-point");
  const prefersReduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const CONTENT={
    ja:{
      title:"お客様向け情報",subtitle:"大切な情報と、よりよい導入のために。",
      hint:"SCROLL TO DISCOVER",home:"ホームに戻る ↗",homeShort:"ホームへ ↗",link:"この項目を見る",
      nav:{home:"ホーム",services:"事業内容",technology:"技術紹介",projects:"開発・検証",company:"会社概要",contact:"お問い合わせ",customer:"お客様向け情報"},
      topics:[
        {title:"情報保護方針",description:"情報保護に関する基本的な方針をご案内する項目です。",note:"詳しい内容は現在準備中です。",href:"./privacy.html",short:"情報保護方針"},
        {title:"情報の安全管理・取り扱い",description:"情報の安全管理と取り扱いについてご案内する項目です。",note:"詳しい内容は現在準備中です。",href:"./security.html",short:"安全管理・取り扱い"},
        {title:"導入までの流れ",description:"お問い合わせから導入までの流れをご案内する項目です。",note:"詳しい内容は現在準備中です。",href:"./onboarding.html",short:"導入までの流れ"}
      ]
    },
    en:{
      title:"Customer Information",subtitle:"Useful information for your next step.",
      hint:"SCROLL TO DISCOVER",home:"Back to home ↗",homeShort:"Home ↗",link:"Explore this topic",
      nav:{home:"Home",services:"Services",technology:"Technology",projects:"Development",company:"Company",contact:"Contact",customer:"Customer Information"},
      topics:[
        {title:"Information Protection Policy",description:"Information about our approach to information protection.",note:"Detailed content is currently being prepared.",href:"./privacy.html?lang=en",short:"Protection policy"},
        {title:"Information Security & Handling",description:"Information about the management and handling of information.",note:"Detailed content is currently being prepared.",href:"./security.html?lang=en",short:"Security & handling"},
        {title:"Our Implementation Process",description:"Information about the process from initial enquiry through implementation.",note:"Detailed content is currently being prepared.",href:"./onboarding.html?lang=en",short:"Implementation"}
      ]
    },
    th:{
      title:"ข้อมูลสำหรับลูกค้า",subtitle:"ข้อมูลที่จำเป็นสำหรับขั้นตอนต่อไปของคุณ",
      hint:"เลื่อนลงเพื่อดูหัวข้อถัดไป",home:"กลับไปหน้าแรก ↗",homeShort:"หน้าแรก ↗",link:"ดูรายละเอียดหัวข้อนี้",
      nav:{home:"หน้าแรก",services:"บริการ",technology:"เทคโนโลยี",projects:"การพัฒนา",company:"บริษัท",contact:"ติดต่อเรา",customer:"ข้อมูลสำหรับลูกค้า"},
      topics:[
        {title:"นโยบายคุ้มครองข้อมูล",description:"ข้อมูลเกี่ยวกับแนวทางการคุ้มครองข้อมูล",note:"รายละเอียดอยู่ระหว่างการจัดเตรียม",href:"./privacy.html?lang=th",short:"นโยบายคุ้มครองข้อมูล"},
        {title:"การรักษาความปลอดภัยและการจัดการข้อมูล",description:"ข้อมูลเกี่ยวกับการรักษาความปลอดภัยและการจัดการข้อมูล",note:"รายละเอียดอยู่ระหว่างการจัดเตรียม",href:"./security.html?lang=th",short:"ความปลอดภัยของข้อมูล"},
        {title:"ขั้นตอนการนำไปใช้งาน",description:"ข้อมูลเกี่ยวกับขั้นตอนตั้งแต่การติดต่อเบื้องต้นจนถึงการนำไปใช้งาน",note:"รายละเอียดอยู่ระหว่างการจัดเตรียม",href:"./onboarding.html?lang=th",short:"ขั้นตอนการนำไปใช้งาน"}
      ]
    }
  };
  let language="ja",display=0,target=0,active=-1,raf=0,journeyTop=0,stepHeight=1;

  // Cache geometry outside the animation loop so the scene can move at 60 fps.
  function measure(){
    journeyTop=root.getBoundingClientRect().top+window.scrollY;
    stepHeight=Math.max(1,steps[0].getBoundingClientRect().height);
  }
  function setLanguage(next){
    if(!CONTENT[next])return;
    language=next;
    const copy=CONTENT[language];
    document.documentElement.lang=next;
    document.title=copy.title+" | 2L²";
    $("#customer-title").textContent=copy.title;
    $("#customer-subtitle").textContent=copy.subtitle;
    $("#customer-scroll-hint").textContent=copy.hint;
    $("#customer-footer-home").textContent=copy.home;
    $("#customer-home-mobile").textContent=copy.homeShort;
    $$("[data-nav-key]").forEach(a=>a.textContent=copy.nav[a.dataset.navKey]);
    steps.forEach((step,i)=>{
      const topic=copy.topics[i];
      step.querySelector("[data-step-title]").textContent=topic.title;
      step.querySelector("[data-step-description]").textContent=topic.description;
      step.querySelector("[data-step-note]").textContent=topic.note;
      step.querySelector("[data-step-cta]").textContent=copy.link;
      step.querySelector("[data-step-link]").href=topic.href;
    });
    points.forEach((point,i)=>{
      const topic=copy.topics[i];
      point.querySelector("span").textContent=String(i+1).padStart(2,"0")+" / "+topic.short;
      point.setAttribute("aria-label",topic.title+" — "+String(i+1)+"/3");
    });
    $$(".customer-language button").forEach(button=>{
      const selected=button.dataset.lang===language;
      button.classList.toggle("active",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
    refresh();
  }

  function refresh(){
    // Each full-height article advances by one chapter. Native vertical scrolling
    // stays free: no wheel interception, page locking, forced snap or hidden slides.
    target=clamp((window.scrollY-journeyTop)/stepHeight,0,2);
    if(prefersReduced.matches)display=target;
    if(!raf)raf=requestAnimationFrame(render);
  }
  function render(){
    raf=0;
    display+=(target-display)*(prefersReduced.matches?1:.115);
    if(Math.abs(target-display)<.0008)display=target;
    const p=display;
    const robot0=clamp(1-p,0,1);
    const robot1=clamp(1-Math.abs(p-1),0,1);
    const robot2=clamp(p-1,0,1);
    const future=clamp((p-1.35)/.65,0,1);
    root.style.setProperty("--travel",p.toFixed(4));
    root.style.setProperty("--robot0",robot0.toFixed(4));
    root.style.setProperty("--robot1",robot1.toFixed(4));
    root.style.setProperty("--robot2",robot2.toFixed(4));
    root.style.setProperty("--future",future.toFixed(4));
    root.style.setProperty("--orbturn",(-21+p*29).toFixed(2)+"deg");
    root.style.setProperty("--robotturn",(-8+p*7).toFixed(2)+"deg");
    root.style.setProperty("--robotshift",(p*9).toFixed(1)+"px");
    const nextActive=clamp(Math.round(p),0,2);
    if(active!==nextActive){
      active=nextActive;
      points.forEach((point,i)=>{
        point.classList.toggle("active",i===active);
        if(i===active)point.setAttribute("aria-current","step");
        else point.removeAttribute("aria-current");
      });
      $("#customer-stage-number").textContent=String(active+1).padStart(2,"0");
      $("#customer-progress").textContent=String(active+1).padStart(2,"0")+" — 03 / SCROLL";
    }
    if(!prefersReduced.matches){
      steps.forEach((step,i)=>{
        const proximity=clamp(1-Math.abs(p-i)*.6,0,1);
        // Keep text legible even while sections blend into one another.
        const copy=step.querySelector(".customer-step-copy");
        copy.style.setProperty("--step-opacity",(.74+.26*proximity).toFixed(3));
        copy.style.setProperty("--step-y",((1-proximity)*11).toFixed(1)+"px");
      });
    }
    if(Math.abs(target-display)>.001)raf=requestAnimationFrame(render);
  }

  const requested=new URLSearchParams(window.location.search).get("lang");
  measure();
  setLanguage(CONTENT[requested]?requested:"ja");
  window.addEventListener("scroll",refresh,{passive:true});
  window.addEventListener("resize",()=>{measure();refresh()},{passive:true});
  prefersReduced.addEventListener?.("change",refresh);
  // Watch future layout changes (e.g. font loads or translated text wrapping).
  if("ResizeObserver" in window){
    const observer=new ResizeObserver(()=>{measure();refresh()});
    observer.observe(steps[0]);
  }
  // The header language change does not reset scroll or restart animated WebPs.
  $$(".customer-language button").forEach(button=>button.addEventListener("click",()=>setLanguage(button.dataset.lang)));
  // Anchor links are optional shortcuts to the same native vertical sequence.
  refresh();
})();