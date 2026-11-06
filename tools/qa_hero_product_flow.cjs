const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const server=spawn("python3",["-m","http.server","8788","--bind","127.0.0.1"],{stdio:"ignore"});
const sleep=t=>new Promise(r=>setTimeout(r,t));
(async()=>{
 let browser;
 try{
   await sleep(1500);
   browser=await chromium.launch({headless:true});
   for(const width of [390,768,1440]){
     const page=await browser.newPage({viewport:{width,height:844}});
     await page.goto("http://127.0.0.1:8788/",{waitUntil:"load"});
     const panel=page.locator(".flow-panel");
     assert.equal(await panel.count(),1,"flow panel exists");
     assert.equal(await page.locator(".earth-frame,.network-overlay").count(),0,"legacy empty visual removed");
     assert.equal(await page.locator(".flow-node").count(),3,"3 product nodes");
     for(const name of ["ORBIT","PowerOS","CONFORM"]){
       const node=page.locator(".flow-node").filter({has:page.locator(".flow-node-name", {hasText:name})});
       assert.equal(await node.count(),1,name);
       assert.equal(await node.isVisible(),true,name+" visible");
       assert.match(await node.getAttribute("href"),/^\/(orbit|poweros|conform)\.html$/);
     }
     const metrics=await page.evaluate(()=>{
       const rect=document.querySelector(".flow-panel").getBoundingClientRect();
       return {scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,panelWidth:rect.width,panelLeft:rect.left,panelRight:rect.right,stylesheet:!!Array.from(document.styleSheets).find(s=>s.href?.includes("hero-product-flow.css"))};
     });
     assert.equal(metrics.stylesheet,true);
     assert.ok(metrics.panelWidth>240&&metrics.panelLeft>=-1&&metrics.panelRight<=width+1,JSON.stringify(metrics));
     assert.ok(metrics.scrollWidth<=width+2,"horizontal page overflow: "+JSON.stringify(metrics));
     console.log("PASS hero flow viewport "+width+"px: 3 linked panels, local CSS, no overflow");
     await page.close();
   }
 }finally{if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exit(1)});
