import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='https://trusta-sustain.com';
 const landing=await page.goto(base+'/environmental-sustainability.html',{waitUntil:'load'});
 assert.equal(landing?.status(),200);
 await page.getByRole('heading',{name:/Environmental complexity/i}).waitFor();
 assert.ok(await page.getByText('GHG Inventory — Scope 1, 2 & 3').count()>=1);
 assert.ok(await page.locator('a[href^="mailto:growth@trusta-sustain.com"]').count()>=5);
 const explorer=await page.goto(base+'/esi-evidence-explorer.html',{waitUntil:'load'});
 assert.equal(explorer?.status(),200);
 await page.getByRole('tab',{name:'Scope 1'}).waitFor();
 assert.match(await page.locator('#progressLabel').innerText(),/0 of 4/);
 await page.locator('#scope-panel input[type=checkbox]').first().check();
 assert.match(await page.locator('#progressLabel').innerText(),/1 of 4/);
 await page.getByRole('tab',{name:'Scope 2'}).click();
 assert.match(await page.locator('#progressLabel').innerText(),/0 of 4/);
 await page.getByRole('tab',{name:'Scope 3'}).click();
 assert.match(await page.locator('#progressLabel').innerText(),/0 of 4/);
 await page.getByRole('button',{name:'Reset selections'}).click();
 await page.getByRole('tab',{name:'Scope 1'}).click();
 assert.match(await page.locator('#progressLabel').innerText(),/0 of 4/);
 const notice=await page.locator('.ex-note').allInnerTexts();
 assert.ok(notice.some(t=>/not an ESG score/i.test(t)));
 assert.equal(errors.length,0,'Browser JS errors: '+errors.join('; '));
 // New UI must fit a phone.
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth > window.innerWidth+3);
 assert.equal(overflow,false,'mobile horizontal overflow');
 console.log('Live ESI landing + Scope 1/2/3 interactive browser QA PASS');
} finally{await browser.close();}
