/* 2L² static-site end-to-end smoke/regression suite.
 * Run: npm install --no-save playwright && npx playwright install chromium
 *      python3 -m http.server 8765 &
 *      node tests/site-smoke.cjs
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8765/';
const shots=path.resolve('test-artifacts');
fs.mkdirSync(shots,{recursive:true});
const problems=[];
const results=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function check(value,message){if(!value)throw new Error(message);}
async function runCase(name,fn){
  try{await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
  catch(err){results.push({name,status:'failed',error:String(err.stack||err)});problems.push(name+': '+String(err.stack||err));console.error('FAIL '+name+': '+err.stack)}
}
function observe(page,label){
  const errors=[];
  page.on('pageerror',err=>errors.push('JavaScript: '+err.message));
  page.on('response',resp=>{
    if(resp.url().startsWith(base)&&resp.status()>=400)errors.push('HTTP '+resp.status()+' '+resp.url())
  });
  page.on('console',msg=>{if(msg.type()==='error')errors.push('Console: '+msg.text())});
  return {errors,verify(){check(errors.length===0,label+' browser errors: '+JSON.stringify(errors))}};
}
async function viewportChecks(page,label){
  const issues=await page.evaluate(()=>{
    const doc=document.documentElement;
    const max=Math.max(doc.scrollWidth,document.body.scrollWidth);
    const titles=Array.from(document.querySelectorAll('.chapter h1,.chapter h2,.llm-story h4,.virtual-showcase-title'))
      .filter(el=>el.getClientRects().length)
      .map(el=>({text:(el.textContent||'').trim().slice(0,70),width:Math.round(el.getBoundingClientRect().width),scroll:el.scrollWidth}));
    const overflowers=Array.from(document.querySelectorAll('body *')).map(el=>{
      const r=el.getBoundingClientRect();
      return {node:el.tagName.toLowerCase(),cls:String(el.className?.baseVal??el.className??'').slice(0,80),right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width)};
    }).filter(x=>x.right>window.innerWidth+10||x.left<-10).slice(0,22);
    const controls=['.language button[data-lang="en"]','#menu-toggle'].map(sel=>{
      const el=document.querySelector(sel);if(!el)return {sel,missing:true};
      const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2,at=document.elementFromPoint(x,y);
      return {sel,rect:{x:r.x,y:r.y,w:r.width,h:r.height},topAtPoint:at?.outerHTML?.slice(0,130)};
    });
    return {inner:window.innerWidth,scroll:max,overflow:max-window.innerWidth,headlines:titles.filter(t=>t.scroll>t.width+4),overflowers,controls};
  });
  check(issues.overflow<=5,label+' horizontal page overflow '+JSON.stringify(issues));
  // Titles can wrap to two or three lines, but their own scrollable width should not clip.
  check(issues.headlines.length===0,label+' clipped headings: '+JSON.stringify(issues.headlines));
}
async function homepage(browser,label,width,height,mobile=false){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(9000);
 const observed=observe(page,label);
 try{
  await runCase(label+' homepage loads',async()=>{
   await page.goto(base+'index.html',{waitUntil:'load'});
   await page.locator('#site-header').waitFor();
   check(await page.locator('#home h1').textContent().then(s=>s.includes('どこにでも')), 'JP top message absent');
   await viewportChecks(page,label+' initial');
   await page.screenshot({path:path.join(shots,label+'-home.png')});
  });
  await runCase(label+' 3-language navigation',async()=>{
   if(mobile){
     const headerDebug=await page.evaluate(()=>{
       const els=['.language button[data-lang="en"]','#menu-toggle'].map(sel=>{
         const el=document.querySelector(sel);const r=el.getBoundingClientRect();
         const x=r.x+r.width/2,y=r.y+r.height/2;
         const top=document.elementFromPoint(x,y);
         const header=getComputedStyle(document.querySelector('#site-header'));
         const self=getComputedStyle(el);
         return {sel,rect:{x:r.x,y:r.y,w:r.width,h:r.height},inViewport:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,top:top?.outerHTML?.slice(0,180),pointer:self.pointerEvents,headerPointer:header.pointerEvents,headerZ:header.zIndex};
       });
       return {innerWidth,scrollWidth:document.documentElement.scrollWidth,els};
     });
     console.log('MOBILE HIT TEST '+label+' '+JSON.stringify(headerDebug));
   }
   for(const [code,expected] of [['en','Our Strengths'],['th','จุดแข็งของ 2L²'],['ja','2L²の強み']]){
     await page.locator('.language button[data-lang="'+code+'"]').click();
     check(await page.locator('html').getAttribute('lang')===code,'language '+code+' did not activate');
     const all=await page.locator('.desktop-nav a[data-nav="technology"]').textContent();
     check(all.includes(expected),'label incorrect for '+code+': '+all);
   }
  });
  await runCase(label+' contact email works',async()=>{
   const email=page.locator('#email-link');
   check(await email.isVisible(),'Contact email link must be visible');
   const href=await email.getAttribute('href');
   check(href?.startsWith('mailto:namisatorio@twoltwo.com?'), 'Unexpected contact destination '+href);
   check(!(await page.locator('#contact-unavailable').isVisible()), 'Unconfigured-contact warning is still displayed');
  });
  await runCase(label+' Local LLM inline expand and auto-collapse',async()=>{
   const local=page.locator('#service-item-local-llm-details');
   await local.locator('summary').click();
   check(await local.evaluate(el=>el.open),'Local LLM did not open');
   check(await local.locator('.llm-story').count()===3,'Expected 3 Local LLM diagrams');
   await page.locator('.llm-story-agents').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(shots,label+'-local-last.png')});
   // Move along the last diagram in small increments as a real user would.
   let closed=false;
   for(let i=0;i<60;i++){
     const state=await page.evaluate(()=>{
       const node=document.querySelector('#service-item-local-llm-details');
       const last=node?.querySelector('.llm-story-agents');
       const rect=last?.getBoundingClientRect();
       return {open:!!node?.open,bottom:rect?.bottom,threshold:innerHeight*.25};
     });
     if(!state.open){closed=true;break;}
     await page.evaluate(()=>window.scrollBy(0,Math.max(55,innerHeight*.20)));
     await sleep(28);
   }
   check(closed || !(await local.evaluate(el=>el.open)), 'Local LLM did not collapse after final slide');
   const virtual=page.locator('#service-item-virtual-test-details');
   check(await virtual.evaluate(el=>el.open),'Virtual lab must automatically expand after Local LLM');
   await page.waitForTimeout(120);
   const handoff=await page.evaluate(()=>{
     const rect=document.querySelector('#service-item-virtual-test-details summary').getBoundingClientRect();
     const header=document.querySelector('#site-header').getBoundingClientRect();
     return {top:rect.top,headerBottom:header.bottom,viewport:innerHeight};
   });
   check(handoff.top>=handoff.headerBottom-12 && handoff.top<handoff.viewport*.44,
     'Local-to-virtual handoff did not settle on next title: '+JSON.stringify(handoff));
   // Opening a panel again by hand must still work.
   await local.locator('summary').click();check(await local.evaluate(el=>el.open),'Local LLM cannot be reopened');
   await local.locator('summary').click();check(!(await local.evaluate(el=>el.open)),'Local LLM cannot be closed manually');
  });
  await runCase(label+' Virtual Test Environment auto-handoff to strengths',async()=>{
   const virtual=page.locator('#service-item-virtual-test-details');
   if(!(await virtual.evaluate(el=>el.open)))await virtual.locator('summary').click();
   check(await virtual.evaluate(el=>el.open),'Virtual Test Environment did not open');
   check(await virtual.locator('.virtual-scenario').count()===7,'Expected 7 business scenes');
   check(await virtual.locator('.virtual-cycle-label').count()===4,'Expected practice/failure/improve/retry cycle');
   await virtual.locator('.virtual-lab').scrollIntoViewIfNeeded();
   await viewportChecks(page,label+' virtual expanded');
   await page.screenshot({path:path.join(shots,label+'-virtual.png')});
   // The virtual showcase includes a takeaway/disclosure after the central
   // graphic. Do not close until that entire demonstration has been viewed.
   let autoClosed=false;
   for(let i=0;i<65;i++){
     if(!(await virtual.evaluate(el=>el.open))){autoClosed=true;break;}
     await page.evaluate(()=>window.scrollBy(0,Math.max(55,innerHeight*.20)));
     await sleep(30);
   }
   check(autoClosed || !(await virtual.evaluate(el=>el.open)),
      'Virtual Test Environment did not auto-close after its final content');
   await page.waitForTimeout(120);
   const strengthPosition=await page.evaluate(()=>{
     const rect=document.querySelector('#technology .section-topline').getBoundingClientRect();
     const header=document.querySelector('#site-header').getBoundingClientRect();
     return {top:rect.top,headerBottom:header.bottom,viewport:innerHeight};
   });
   check(strengthPosition.top>=strengthPosition.headerBottom-14 && strengthPosition.top<strengthPosition.viewport*.45,
      'Virtual-to-strengths handoff did not settle correctly: '+JSON.stringify(strengthPosition));
   // A reader can always reopen the virtual explanation manually.
   await virtual.locator('summary').click();
   check(await virtual.evaluate(el=>el.open),'Virtual panel cannot be reopened');
   await virtual.locator('summary').click();
   check(!(await virtual.evaluate(el=>el.open)),'Virtual panel cannot be closed manually');
  });
  if(mobile){
   await runCase(label+' responsive menu',async()=>{
    const button=page.locator('#menu-toggle');
    await button.click();
    check(await button.getAttribute('aria-expanded')==='true','menu did not open');
    await page.locator('#mobile-nav a[href="#company"]').click();
    check(await button.getAttribute('aria-expanded')==='false','menu not closed after navigation');
   });
  }
  await runCase(label+' customer page robot sequence',async()=>{
   await page.goto(base+'customer.html',{waitUntil:'load'});
   const robot=page.locator('#robot-interact'),mood=page.locator('.robot-section');
   await robot.waitFor();
   await robot.click();check(await mood.getAttribute('data-mood')==='shy','first tap should blush');
   await robot.click();check(await mood.getAttribute('data-mood')==='angry','second tap should be angry');
   await robot.click();check(await mood.getAttribute('data-mood')==='unimpressed','third tap should be unimpressed');
   await robot.click();check(await mood.getAttribute('data-mood')==='unimpressed','fourth tap should remain unimpressed');
   await page.screenshot({path:path.join(shots,label+'-robot.png')});
   await sleep(7800);
   check(await mood.getAttribute('data-mood')==='neutral','robot did not reset after 7.6s');
  });
  await runCase(label+' customer page language switch',async()=>{
   await page.goto(base+'customer.html',{waitUntil:'load'});
   for(const code of ['en','th','ja']){
     await page.locator('.customer-language button[data-lang="'+code+'"]').click();
     check(await page.locator('html').getAttribute('lang')===code,'Customer language did not switch to '+code);
   }
  });
  await runCase(label+' linked subpages',async()=>{
   for(const uri of ['onboarding.html','privacy.html','security.html']){
     const response=await page.goto(base+uri,{waitUntil:'load'});
     check(response?.ok(),uri+' did not load');
     check((await page.locator('body').innerText()).length>60,uri+' appears blank');
     for(const code of ['en','th','ja']){
       await page.locator('.language button[data-lang="'+code+'"]').click();
       check(await page.locator('html').getAttribute('lang')===code,uri+' language did not switch to '+code);
     }
   }
  });
  await runCase(label+' no browser exceptions / asset errors',async()=>observed.verify());
 }finally{await context.close();}
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
   await homepage(browser,'desktop-1440',1440,900,false);
   await homepage(browser,'tablet-820',820,1000,false);
   await homepage(browser,'mobile-390',390,844,true);
   await homepage(browser,'mobile-320',320,700,true);
   for(const [name,w,h,mobile] of [['desktop',1440,900,false],['mobile',390,844,true]]){
    await runCase(name+' close only after expanded content passes viewport quarter',async()=>{
      const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'});
      const page=await ctx.newPage();
      try{
        await page.goto(base+'index.html',{waitUntil:'load'});
        for(const id of ['service-item-local-llm-details','service-item-virtual-test-details']){
          const panel=page.locator('#'+id);
          if(!(await panel.evaluate(el=>el.open)))await panel.locator('summary').click();
          const content=panel.locator('.service-detail-panel');
          // Stop a little before the 25% line. The section should remain open.
          await content.evaluate(el=>{
            const desired=innerHeight*.25+35;
            const bottom=el.getBoundingClientRect().bottom;
            window.scrollTo({top:window.scrollY+bottom-desired,behavior:'instant'});
          });
          await sleep(90);
          check(await panel.evaluate(el=>el.open),id+' closed before the last content was read');
          await page.evaluate(()=>window.scrollBy({top:-18,behavior:'instant'}));
          await sleep(60);
          check(await panel.evaluate(el=>el.open),id+' closed while scrolling upward');
          // Scroll past the quarter guide: closing must happen promptly.
          await page.evaluate(()=>window.scrollBy({top:85,behavior:'instant'}));
          await page.waitForFunction(identifier=>!document.getElementById(identifier).open,id,{timeout:1900});
          check(!(await panel.evaluate(el=>el.open)),id+' remained open past the quarter');
        }
      }finally{await ctx.close()}
    });
   }
   for(const [name,w,h,mobile] of [['desktop',1440,900,false],['mobile',390,844,true]]){
    await runCase(name+' smooth scroll handoffs with animations enabled',async()=>{
      const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:mobile,isMobile:mobile,reducedMotion:'no-preference'});
      const page=await ctx.newPage();
      const errs=observe(page,name+' motion');
      try{
        await page.goto(base+'index.html',{waitUntil:'load'});
        const local=page.locator('#service-item-local-llm-details');
        await local.locator('summary').click();
        await page.locator('.llm-story-agents').scrollIntoViewIfNeeded();
        let started=false;
        for(let i=0;i<90;i++){
          if(!(await local.evaluate(el=>el.open))){started=true;break;}
          await page.evaluate(()=>window.scrollBy({top:Math.max(70,innerHeight*.17),behavior:'instant'}));
          await sleep(30);
        }
        check(started,'Local panel failed to hand off with smooth motion');
        await sleep(220);
        const afterLocal=await page.evaluate(()=>{
          const el=document.querySelector('#service-item-virtual-test-details');
          return {opened:el.open, top:el.querySelector('summary').getBoundingClientRect().top,header:document.querySelector('#site-header').getBoundingClientRect().bottom};
        });
        check(afterLocal.opened && afterLocal.top>=afterLocal.header-12 && afterLocal.top<h*.42,
          'Local-to-virtual smooth handoff position incorrect: '+JSON.stringify(afterLocal));
        const virtual=page.locator('#service-item-virtual-test-details');
        await page.locator('.virtual-showcase').scrollIntoViewIfNeeded();
        let finished=false;
        for(let i=0;i<90;i++){
          if(!(await virtual.evaluate(el=>el.open))){finished=true;break;}
          await page.evaluate(()=>window.scrollBy({top:Math.max(70,innerHeight*.17),behavior:'instant'}));
          await sleep(30);
        }
        check(finished,'Virtual panel failed to hand off smoothly to strengths');
        await sleep(220);
        const afterVirtual=await page.evaluate(()=>{
          const el=document.querySelector('#technology .section-topline');
          return {top:el.getBoundingClientRect().top,header:document.querySelector('#site-header').getBoundingClientRect().bottom};
        });
        check(afterVirtual.top>=afterVirtual.header-12 && afterVirtual.top<h*.42,
          'Virtual-to-strengths smooth handoff position incorrect: '+JSON.stringify(afterVirtual));
        errs.verify();
      }finally{await ctx.close()}
    });
   }
   await runCase('Deep links open appropriate service panel',async()=>{
    const context=await browser.newContext({viewport:{width:1366,height:800},reducedMotion:'reduce'});
    const page=await context.newPage();const obs=observe(page,'deep-link');
    try{
     await page.goto(base+'index.html#local-llm-details',{waitUntil:'load'});
     await sleep(150);
     check(await page.locator('#service-item-local-llm-details').evaluate(el=>el.open),'Local hash target is closed');
     await page.goto(base+'index.html#virtual-test-details',{waitUntil:'load'});
     await sleep(150);
     check(await page.locator('#service-item-virtual-test-details').evaluate(el=>el.open),'Virtual hash target is closed');
     obs.verify();
    }finally{await context.close()}
   });
  }finally{await browser.close()}
  fs.writeFileSync(path.join(shots,'results.json'),JSON.stringify({results,problems},null,2));
  console.log('SMOKE SUMMARY: '+results.filter(x=>x.status==='passed').length+'/'+results.length+' passed');
  if(problems.length){console.error(problems.join('\n\n'));process.exitCode=1}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1});
