import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base='https://poweros.trusta-sustain.com';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const res=await page.goto(base+'/',{waitUntil:'load'});
 assert.equal(res?.status(),200);
 assert.match(await page.title(),/PowerOS/);
 assert.ok(await page.locator('a[href="https://trusta-sustain.com/environmental-sustainability.html"]').count()>=1);
 assert.ok(await page.locator('a[href="https://trusta-sustain.com/esi-evidence-explorer.html"]').count()>=1);
 const before=await page.locator('#difference').innerText();
 await page.locator('#shift').evaluate(el=>{el.value='15';el.dispatchEvent(new Event('input',{bubbles:true}));});
 const after=await page.locator('#difference').innerText();
 assert.notEqual(after,before,'legacy scenario calculator must respond');
 await page.locator('button[data-site="cooling"]').click();
 assert.match(await page.locator('#baselineLabel').innerText(),/2,350/);
 await page.locator('#reset').click();
 assert.match(await page.locator('#baselineLabel').innerText(),/1,450/);
 assert.match((await page.locator('body').innerText()).toLowerCase(),/synthetic/);
 const h=await page.request.get(base+'/healthz');
 assert.equal(h.status(),200);
 assert.match(await h.text(),/synthetic/);
 assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,'mobile overflow');
 console.log('PowerOS live production synthetic scenarios, ESI links, HTTPS and health: PASS');
}finally{await browser.close();}
