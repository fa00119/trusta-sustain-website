/** Trusta three-product static preview browser QA. Run only against loopback fixture.
 * This script does not send email, ingest customer data or navigate live site.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = 'http://127.0.0.1:8766';
const paths = ['/', '/about.html', '/contact.html', '/trusta-platform.html'];
const failures = [];
const art = 'artifacts/launch-preview';
fs.mkdirSync(art, { recursive: true });

async function check(browser, viewport, label) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  // CI should validate first-party HTML/CSS/JS without hanging on external NASA or analytics resources.
  await page.route('**/*', route => { const url=route.request().url(); return url.startsWith(base+'/') ? route.continue() : route.abort(); });
  const runtimeErrors = [];
  page.on('pageerror', e => runtimeErrors.push(String(e)));
  for (const path of paths) {
    const result = await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    assert.equal(result.status(), 200, label + ' ' + path + ' HTTP status');
    assert(((await page.title()) || '').trim().length > 0, label + ' ' + path + ' title');
    const hasName = await page.getByText('Farhad Azarmi', { exact: false }).count();
    assert.equal(hasName, 0, label + ' ' + path + ' personal display name');
    const overflow = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, window: innerWidth}));
    if (overflow.scroll > overflow.window + 3) {
      const offenders = await page.evaluate(() => [...document.querySelectorAll('body *')].map(el => {
        const b=el.getBoundingClientRect();const cs=getComputedStyle(el);
        return {tag:el.tagName.toLowerCase(),cls:(el.className||'').toString().slice(0,100),id:el.id, left:Math.round(b.left),right:Math.round(b.right),width:Math.round(b.width),position:cs.position,overflow:cs.overflowX};
      }).filter(z => z.right > innerWidth + 3 || z.left < -3).sort((a,b)=>b.right-a.right).slice(0,16));
      console.error('OVERFLOW DIAGNOSTIC',label,path,JSON.stringify(offenders));
      failures.push(label + ' ' + path + ' horizontal overflow ' + JSON.stringify(overflow));
    }
    await page.screenshot({ timeout:15000, path: art + '/' + label + '-' + (path === '/' ? 'index' : path.replace(/\W/g, '-')) + '.png', fullPage:true });
  }
  await page.goto(base + '/trusta-platform.html', { waitUntil: 'domcontentloaded' });
  for (const text of ['ORBIT', 'PowerOS', 'CONFORM', 'UNVERIFIABLE', 'Request an Energy Value Assessment']) {
    assert(await page.getByText(text, { exact: false }).count() > 0, label + ' missing product or assurance phrase: ' + text);
  }
  const growth = page.locator('a[href^="mailto:growth@trusta-sustain.com?"]');
  assert(await growth.count() > 0, label + ' missing Growth mailto CTA');
  const href = await growth.first().getAttribute('href');
  assert(href.includes('subject=') && href.includes('body='), label + ' mailto missing inquiry template');
  assert(await page.getByText('Do not email:', { exact:false }).count() > 0, label + ' missing privacy warning');
  await page.locator('a[href="#assessment"]').first().click();
  assert.equal(new URL(page.url()).hash, '#assessment', label + ' assessment anchor failed');
  const q = await page.locator('#assessment').count();
  assert.equal(q, 1, label + ' assessment id missing or duplicate');
  await page.goto(base + '/', {waitUntil:'domcontentloaded'});
  assert(await page.locator('a[href="/trusta-platform.html"]').count() > 0, label + ' homepage platform navigation missing');
  if(runtimeErrors.length) failures.push(label + ' JS exceptions: ' + runtimeErrors.join('; '));
  await context.close();
}

(async () => {
  const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
  try {
    await check(browser, {width:1365,height:850}, 'desktop');
    await check(browser, {width:390,height:844}, 'mobile');
    if(failures.length) throw Error(failures.join('\n'));
    console.log('BROWSER QA PASS: desktop/mobile pages, no horizontal overflow, privacy/name, CTA and anchor, screenshots.');
    console.log('UNTESTED: actual email reception, real DNS/deploy, legal review, full WCAG, external integrations.');
  } finally {
    await browser.close();
  }
})().catch(e => { console.error('BROWSER QA FAIL:', e);process.exitCode = 1; });
