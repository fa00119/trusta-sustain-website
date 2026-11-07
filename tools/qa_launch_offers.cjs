const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const server=spawn("python3",["-m","http.server","8790","--bind","127.0.0.1"],{stdio:"ignore"});
const sleep=t=>new Promise(r=>setTimeout(r,t));
(async()=>{let browser;try{
 await sleep(1200);browser=await chromium.launch({headless:true});
 for(const width of [390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:850}});const errors=[];page.on("pageerror",e=>errors.push(e.message));
  for(const pathname of ["/","/products.html","/contact.html","/launch-offers.html","/partners.html","/evidence-mini-scan.html","/trust-center.html"]){
   const res=await page.goto("http://127.0.0.1:8790"+pathname,{waitUntil:"load"});assert.equal(res.status(),200,pathname);
   const metrics=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));assert.ok(metrics.sw<=width+2,pathname+" horizontal overflow "+JSON.stringify(metrics));
   assert.deepEqual(errors,[],pathname+" no JS errors");
   if(pathname==="/launch-offers.html"){
     for(const t of ["Evidence Triage","Scenario & Data Review","Focused Infrastructure Diagnostic","$1,500","$3,500","$6,500","written scope"]){assert.ok((await page.locator("body").innerText()).includes(t),t)}
     assert.equal(await page.locator('a[href^="mailto:growth@trusta-sustain.com"]').count()>=3,true);
   }
   if(pathname==="/partners.html"){
     const body=await page.locator("body").innerText();assert.ok(body.includes("10–15%")&&body.includes("net cash actually collected"));assert.ok(body.includes("written agreement")&&body.includes("No government procurement kickbacks"));
   }
   if(pathname==="/evidence-mini-scan.html"){ const body=await page.locator("body").innerText();for(const term of ["$499","one claim","three references","quotation only"]){assert.ok(body.toLowerCase().includes(term.toLowerCase()),term);}assert.equal(await page.locator('a[href^="mailto:growth@trusta-sustain.com"]').count()>=2,true);}
   if(pathname==="/trust-center.html"){const body=await page.locator("body").innerText();for(const term of ["Trust Center","synthetic","SOC 2","customer","security"]){assert.ok(body.toLowerCase().includes(term.toLowerCase()),term)}}
   if(pathname==="/"){assert.equal(await page.locator('a[href="/launch-offers.html"]').count()>=1,true);assert.equal(await page.locator('a[href="/partners.html"]').count()>=1,true);}
  }
  console.log("PASS GTM quote-only pages and links "+width+"px");
  await page.close();
 }
}finally{if(browser)await browser.close();server.kill("SIGTERM");}})().catch(e=>{console.error(e);process.exit(1)});
