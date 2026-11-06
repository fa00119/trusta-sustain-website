const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const server = spawn("python3", ["-m","http.server","8788","--bind","127.0.0.1"],{stdio:"ignore"});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try {
  await sleep(1500);
  browser=await chromium.launch({headless:true});
  for (const width of [375,390,430,768,1440]) {
   const page=await browser.newPage({viewport:{width,height:844}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8788/",{waitUntil:"networkidle"});
   const visual=page.locator(".premium-network-visual");
   assert.equal(await visual.count(),1,"original hero composition restored");
   assert.equal(await page.locator(".network-canvas").count(),1,"local SVG visible");
   assert.equal(await page.locator(".flow-panel,.flow-node").count(),0,"large overlay cards removed");
   assert.equal(await page.locator(".network-nodes > circle").count()>10,true,"luminous network points");
   for (const product of ["ORBIT","PowerOS","CONFORM"]){
     assert.equal(await page.locator(".home-demo-links a").filter({hasText:product}).count(),1,product+" CTA preserved");
   }
   const geom=await page.evaluate(()=>{
     const box=s=>{const b=document.querySelector(s).getBoundingClientRect();return{top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height}};
     return {links:box(".home-demo-links"),visual:box(".premium-network-visual"),header:box(".hero-copy"),pageWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,css:[...document.styleSheets].some(s=>s.href?.includes("premium-network-hero.css"))};
   });
   assert.equal(geom.css,true,"custom CSS loaded");
   assert.ok(geom.visual.height>=270,"network is present, not empty");
   assert.ok(geom.pageWidth<=width+2,"no horizontal overflow "+JSON.stringify(geom));
   if(width<=900){
    assert.ok(geom.links.bottom<=geom.visual.top+2,"demo links must not overlap visual "+JSON.stringify(geom));
    assert.ok(geom.visual.left>=-1&&geom.visual.right<=width+1,"visual inside viewport");
    assert.equal(await page.locator(".premium-network-visual .solution-rail").isVisible(),false,"no overlapping rail on mobile");
   }
   assert.deepEqual(errors,[],"no browser exceptions");
   console.log("PASS: premium original-style network hero "+width+"px; separate CTA & art, no overlap or overflow");
   await page.close();
  }
 } finally {if(browser)await browser.close();server.kill("SIGTERM")}
})().catch(e=>{console.error(e);process.exit(1)});
