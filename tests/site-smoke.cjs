/* 2L² production site browser smoke suite.
   Matches the approved standalone Strengths, Cases and Schedule pages.
   Run from the static site root with node tests/site-smoke.cjs.
*/
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.SITE_URL||'http://127.0.0.1:8765/';
const artifacts=path.resolve('test-artifacts');
fs.mkdirSync(artifacts,{recursive:true});
const results=[],problems=[];
async function caseTest(name,fn){
  try{await fn();results.push({name,status:'passed'});console.log('PASS '+name)}
  catch(e){const problem=String(e&&e.stack||e);results.push({name,status:'failed',error:problem});problems.push(name+': '+problem);console.error('FAIL '+name+': '+problem)}
}
function monitor(page){
  const errors=[];
  page.on('pageerror',e=>errors.push('JavaScript: '+e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
  return ()=>assert.deepEqual(errors,[],errors.join('\n'));
}
async function inspect(page,name){
  const result=await page.evaluate(()=>({
    inner:innerWidth,
    doc:document.documentElement.scrollWidth,
    body:document.body.scrollWidth,
    clipped:[...document.querySelectorAll('h1,h2,h3')].filter(n=>n.getClientRects().length&&n.scrollWidth>n.clientWidth+5).map(n=>n.textContent.trim().slice(0,80))
  }));
  assert(Math.max(result.doc,result.body)<=result.inner+6,name+' horizontal overflow '+JSON.stringify(result));
  assert.equal(result.clipped.length,0,name+' clipped headings '+JSON.stringify(result.clipped));
}
async function screenshot(page,name){await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:false})}
async function loaded(page,url){const r=await page.goto(base+url,{waitUntil:'load'});assert(r&&r.ok(),url+' failed HTTP request');}
async function topPage(browser,label,width,height,mobile){
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(8000);const verify=monitor(page);
  try{
    await caseTest(label+' homepage and logo',async()=>{
      await loaded(page,'index.html');
      assert.match(await page.locator('#home h1').innerText(),/機密データを社外に出さず/);
      assert.equal(await page.locator('.space-frame').count(),8);
      assert(await page.locator('#site-header .brand img').evaluate(img=>img.complete&&img.naturalWidth>0));
      assert(await page.locator('.hero-actions .action-solid').isVisible());
      await inspect(page,label+' homepage');await screenshot(page,label+'-home');
    });
    await caseTest(label+' translation controls',async()=>{
      for(const code of ['en','th','ja']){
        await page.locator('#site-header .language button[data-lang="'+code+'"]').click();
        assert.equal(await page.locator('html').getAttribute('lang'),code);
        assert((await page.locator('#home h1').innerText()).trim().length>10);
      }
    });
    if(mobile){
      await caseTest(label+' responsive menu',async()=>{
        await loaded(page,'index.html');
        const toggle=page.locator('#menu-toggle');
        assert(await toggle.isVisible());
        await toggle.click({timeout:7000});
        assert.equal(await toggle.getAttribute('aria-expanded'),'true');
        await page.locator('#mobile-nav a[href="#company"]').click();
        assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      });
    }
    await caseTest(label+' expandable software explanations',async()=>{
      await loaded(page,'index.html');
      for(const id of ['service-item-local-llm-details','service-item-virtual-test-details']){
        const detail=page.locator('#'+id);
        assert.equal(await detail.count(),1);
        await detail.locator('summary').click();
        assert(await detail.evaluate(el=>el.open),id+' did not open');
        const section=detail.locator('.service-detail-panel');
        assert(await section.isVisible());
        await screenshot(page,label+'-'+id.replace('service-item-',''));
        await detail.locator('summary').click();
        assert(!(await detail.evaluate(el=>el.open)),id+' did not close');
      }
      await inspect(page,label+' services');
    });
    await caseTest(label+' dedicated links',async()=>{
      await loaded(page,'index.html');
      assert.equal(await page.locator('#strengths-page-link').count(),1);
      assert.equal(await page.locator('#cases-page-link').count(),1);
      assert.match(await page.locator('#strengths-page-link').getAttribute('href'),/strengths.html/);
      assert.match(await page.locator('#cases-page-link').getAttribute('href'),/cases.html/);
    });
    await caseTest(label+' strengths, RAG and scheduled processing',async()=>{
      await loaded(page,'strengths.html?lang=ja');
      assert.equal(await page.locator('.architecture-row').count(),5);
      for(const id of ['access-control-details','rag-results-details','scheduled-execution-details']){
        const link=page.locator('.architecture-row-link[href="#'+id+'"]');
        assert.equal(await link.count(),1);
        await link.click();
        const detail=page.locator('#'+id);
        assert(await detail.evaluate(el=>el.open),id+' did not open');
      }
      assert.equal(await page.locator('#scheduled-execution-details .schedule-preview-field').count(),4);
      assert.equal(await page.locator('#scheduled-execution-details .schedule-ui-card').count(),1);
      assert.equal(await page.locator('#scheduled-execution-details .schedule-ui-saved-card').count(),1);
      const logo=page.locator('#scheduled-execution-details .schedule-ui-brand img');
      assert(await logo.evaluate(img=>img.complete&&img.naturalWidth>0),'2L² logo failed to load');
      assert.match(await page.locator('#scheduled-execution-details').innerText(),/AI実行システムへの接続が必要/);
      await inspect(page,label+' strengths');await screenshot(page,label+'-strengths');
    });
    await caseTest(label+' onboarding link and selected language',async()=>{
      await loaded(page,'strengths.html?lang=ja');
      const link=page.locator('.architecture-row-onboarding');
      assert.match(await link.getAttribute('href'),/onboarding.html/);
      await page.locator('.info-header .language button[data-lang="en"]').click();
      assert.match(await link.getAttribute('href'),/lang=en/);
      await page.locator('.info-header .language button[data-lang="ja"]').click();
      await link.click();
      await page.waitForURL('**/onboarding.html?lang=ja');
      assert.match(await page.locator('main').innerText(),/導入までの流れ/);
    });
    await caseTest(label+' CTD case details',async()=>{
      await loaded(page,'cases.html?lang=ja');
      assert.equal(await page.locator('.ledger-row').count(),3);
      assert.match(await page.locator('#case-list strong').innerText(),/未公開CTD/);
      const toggle=page.locator('#case-ctd-toggle'),detail=page.locator('#case-ctd');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      await toggle.click();
      assert(await detail.isVisible(),'CTD case detail did not open');
      assert.equal(await detail.locator('.case-study-section').count(),4);
      assert.match(await detail.innerText(),/医学博士による実用性評価/);
      await inspect(page,label+' cases');await screenshot(page,label+'-cases');
      await page.locator('#case-ctd-close').click();
      assert(!(await detail.isVisible()),'CTD detail did not close');
    });
    await caseTest(label+' contact page and legal pages',async()=>{
      await loaded(page,'contact-form.html?lang=ja');
      assert(await page.locator('#contact-name').isVisible());
      assert(await page.locator('#contact-email').isVisible());
      assert(await page.locator('#contact-message').isVisible());
      for(const pageName of ['customer.html','privacy.html','security.html','onboarding.html']){
        await loaded(page,pageName);
        assert((await page.locator('body').innerText()).trim().length>80,pageName+' is empty');
      }
      await inspect(page,label+' subpage');
    });
    await caseTest(label+' no runtime or asset errors',async()=>verify());
  }finally{await context.close()}
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [label,width,height,mobile] of [
    ['desktop-1440',1440,900,false],
    ['tablet-820',820,1180,false],
    ['mobile-390',390,844,true],
    ['mobile-320',320,740,true]
  ])await topPage(browser,label,width,height,mobile);
  await caseTest('Direct linked technical panels',async()=>{
    const page=await browser.newPage();
    try{
      for(const id of ['access-control-details','rag-results-details','scheduled-execution-details']){
        await loaded(page,'strengths.html?lang=ja#'+id);
        assert(await page.locator('#'+id).evaluate(el=>el.open),id+' direct link did not expand');
      }
      await loaded(page,'cases.html?lang=ja#case-ctd');
      assert(await page.locator('#case-ctd').isVisible(),'CTD deep link did not expand');
    }finally{await page.close()}
  });
 }finally{await browser.close()}
 fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify({results,problems},null,2));
 console.log('SMOKE SUMMARY '+results.filter(r=>r.status==='passed').length+'/'+results.length+' passed');
 if(problems.length){console.error(problems.join('\n\n'));process.exitCode=1}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
