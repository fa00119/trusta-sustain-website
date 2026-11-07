import { chromium } from 'playwright';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const errors=[];page.on('pageerror',x=>errors.push(x.message));
 const r=await page.goto('https://trusta-sustain.com/esi-financial-lab.html',{waitUntil:'load'});
 assert.equal(r?.status(),200);
 await page.locator('#cf-download').waitFor();
 const download=page.waitForEvent('download');
 await page.locator('#cf-download').click();
 const d=await download;
 assert.equal(d.suggestedFilename(),'trusta-esi-synthetic-carbon-decision-brief.txt');
 const content=await readFile(await d.path(),'utf8');
 assert.match(content,/ILLUSTRATIVE \/ SIMULATED/);assert.match(content,/\$494,000/);
 assert.match(content,/No source emissions factor/);
 assert.ok(content.split('\n').length>=25);
 assert.deepEqual(errors,[]);
 console.log('Live public synthetic carbon report export: PASS');
}finally{await browser.close()}
