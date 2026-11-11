import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base='https://conform.trusta-sustain.com';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const res=await page.goto(base+'/',{waitUntil:'load'});
 assert.equal(res?.status(),200,'CONFORM production root should return 200');
 await page.getByRole('heading',{name:/Scope 1, 2 & 3/}).waitFor();
 assert.match(await page.locator('#esi-status').innerText(),/^PASS/);
 await page.getByRole('button',{name:/Scope 2 · Purchased electricity/}).click();
 assert.match(await page.locator('#esi-status').innerText(),/^UNCERTAIN/);
 await page.locator('#esi-special').check();
 assert.match(await page.locator('#esi-status').innerText(),/^PASS/);
 await page.getByRole('button',{name:/Scope 3 · Supplier evidence/}).click();
 assert.match(await page.locator('#esi-status').innerText(),/^FAIL/);
 await page.locator('#esi-special').uncheck();
 assert.match(await page.locator('#esi-status').innerText(),/^PASS/);
 const old=page.locator('button[data-case]');
 assert.ok(await old.count()>=3,'legacy CONFORM scenarios preserved');
 await old.nth(1).click();
 assert.match(await page.locator('#finding').innerText(),/PASS|FAIL|UNCERTAIN/);
 assert.ok(await page.locator('a[href="https://trusta-sustain.com/environmental-sustainability.html"]').count()>0);
 const disclaimer=await page.locator('.esi-caution').innerText();
 assert.match(disclaimer,/NOT a certified GHG inventory/);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
 assert.equal(overflow,false,'mobile horizontal overflow');
 assert.deepEqual(errors,[]);
 const h=await page.request.get(base+'/healthz');
 assert.equal(h.status(),200);
 assert.match(await h.text(),/synthetic/);
 console.log('CONFORM Railway live production: synthetic ESI + old scenarios + HTTPS browser gate PASS');
} finally {await browser.close();}
