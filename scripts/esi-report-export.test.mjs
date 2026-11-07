import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:33232/esi-financial-lab.html',{waitUntil:'load'});
 assert.equal(await page.locator('#cf-gross').innerText(),'$494,000');
 const pending=page.waitForEvent('download');
 await page.getByRole('button',{name:/Download synthetic decision brief/}).click();
 const d=await pending;assert.equal(d.suggestedFilename(),'trusta-esi-synthetic-carbon-decision-brief.txt');
 const fs=await import('node:fs/promises');
 const path=await d.path();assert.ok(path);
 const body=await fs.readFile(path,'utf8');
 assert.match(body,/CLASSIFICATION: ILLUSTRATIVE \/ SIMULATED/);
 assert.match(body,/12,?000|12000/);
 assert.match(body,/\$494,000/);
 assert.match(body,/not realized, billable or creditable/);
 assert.match(body,/Incentive eligibility/);
 assert.ok(body.split('\n').length>20,'Readable multiline report');
 assert.deepEqual(errors,[]);
 console.log('ESI downloadable synthetic decision brief, units and warning evidence PASS');
}finally{await browser.close()}
