const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const BASE='https://trusta-sustain.com';
const out='artifacts/live-release';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const [label,viewport] of [['desktop',{width:1365,height:850}],['mobile',{width:390,height:844}]]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce',ignoreHTTPSErrors:false});
   const page=await context.newPage();
   // External font/analytics services must not prevent proving first-party site behavior.
   await page.route('**/*', route => {if(route.request().isNavigationRequest())return route.continue();const u=route.request().url();return /googletagmanager|google-analytics|fonts\\.googleapis|fonts\\.gstatic/.test(u) ? route.abort() : route.continue();});
   for(const path of ['/', '/about.html','/contact.html','/trusta-platform.html']){
    const response=await page.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response.status(),200,label+' '+path+' status');
    const content=await page.locator('body').innerText();
    assert(!content.includes('Farhad Azarmi'),label+' '+path+' contains personal profile');
    const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    assert(overflow.scroll<=overflow.width+3,label+' '+path+' horizontal overflow '+JSON.stringify(overflow));
    try { await page.screenshot({path:out+'/'+label+(path==='/'?'-home':path.replace(/[^a-z]/gi,'-'))+'.png',fullPage:true,timeout:15000,animations:'disabled'}); } catch(err) { console.warn('Nonblocking screenshot failure',label,path,String(err).slice(0,140)); }
   }
   await page.goto(BASE+'/trusta-platform.html',{waitUntil:'domcontentloaded'});
   for(const term of ['ORBIT','PowerOS','CONFORM','UNVERIFIABLE','Request an Energy Value Assessment']){
     assert(await page.getByText(term,{exact:false}).count()>0,label+' missing '+term);
   }
   const contact=page.locator('a[href^="mailto:growth@trusta-sustain.com?"]').first();
   assert(await contact.count()>0,label+' no Growth CTA');
   const href=await contact.getAttribute('href');
   assert(href.includes('subject=')&&href.includes('body='),label+' missing inquiry template');
   await page.locator('a[href="#assessment"]').first().click();
   assert.equal(new URL(page.url()).hash,'#assessment',label+' assessment link');
   await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
   const menu=page.locator('button.menu');
   assert(await menu.isVisible(),label+' menu not visible');
   await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true',label+' menu open');
   await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false',label+' menu escape');
   await context.close();
  }
  console.log('LIVE BROWSER PASS - HTTPS domain, 4 routes, mobile/desktop overflow, privacy, products, assessment mailto and anchor, accessible menu toggle.');
  console.log('NOT A FULL WCAG OR EXTERNAL EMAIL-CLIENT TEST');
 }finally{await browser.close()}
})().catch(e=>{console.error('LIVE BROWSER FAIL',e);process.exitCode=1;});