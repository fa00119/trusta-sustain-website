import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('http://127.0.0.1:33232/esi-financial-lab.html', { waitUntil: 'load' });
  assert.equal(response?.status(), 200);

  async function scenario(inputs) {
    for (const [name, value] of Object.entries(inputs)) {
      await page.locator('#cf-' + name).fill(String(value));
    }
    const gross = await page.locator('#cf-gross').innerText();
    const net = await page.locator('#cf-net').innerText();
    const avoided = await page.locator('#cf-avoided').innerText();
    const amount = text => Number(text.replace(/[^0-9.-]/g, ''));
    assert.ok(amount(gross) >= 0 && amount(net) >= 0 && amount(avoided) >= 0, 'Outputs are non-negative');
    assert.ok(Math.abs(amount(gross) - amount(net) - amount(avoided)) <= 1, 'Rounded exposure conservation');
    assert.ok(amount(avoided) <= amount(gross), 'Avoided exposure cannot exceed gross exposure');
    return { gross, net, avoided };
  }

  assert.equal(await page.locator('#cf-gross').innerText(), '$494,000');
  const initial = await scenario({});
  assert.deepEqual(initial, { gross: '$494,000', net: '$400,400', avoided: '$93,600' });

  // Exported report must agree with the actual displayed result and mark its evidence class.
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download synthetic decision brief/ }).click();
  const download = await pending;
  assert.equal(download.suggestedFilename(), 'trusta-esi-synthetic-carbon-decision-brief.txt');
  assert.ok(await download.path());
  const body = await fs.readFile(await download.path(), 'utf8');
  assert.match(body, /CLASSIFICATION: ILLUSTRATIVE \/ SIMULATED/);
  assert.match(body, /12,?000|12000/);
  assert.ok(body.includes(initial.gross), 'Report gross matches UI');
  assert.ok(body.includes(initial.net), 'Report net matches UI');
  assert.ok(body.includes(initial.avoided), 'Report avoided value matches UI');
  assert.match(body, /not realized, billable or creditable/);
  assert.match(body, /Incentive eligibility/);
  assert.ok(body.split('\n').length > 20, 'Readable multiline report');

  // Input boundary and adversarial scenarios: no negative exposure or phantom value.
  let s = await scenario({ emissions: 0, price: 100, coverage: 100, free: 0, reduction: 1000 });
  assert.deepEqual(s, { gross: '$0', net: '$0', avoided: '$0' }, 'Zero baseline has zero exposure and value');
  s = await scenario({ emissions: 100, price: 50, coverage: 100, free: 0, reduction: 100000000 });
  assert.deepEqual(s, { gross: '$5,000', net: '$0', avoided: '$5,000' }, 'Reduction capped at baseline');
  s = await scenario({ emissions: 100, price: 50, coverage: 100, free: 1000, reduction: 20 });
  assert.deepEqual(s, { gross: '$0', net: '$0', avoided: '$0' }, 'Excess allowance does not create a credit');
  s = await scenario({ emissions: 100, price: -50, coverage: 100, free: 0, reduction: 20 });
  assert.deepEqual(s, { gross: '$0', net: '$0', avoided: '$0' }, 'Negative entered price is safely clamped');
  s = await scenario({ emissions: 100, price: 50, coverage: 500, free: 0, reduction: 20 });
  assert.deepEqual(s, { gross: '$5,000', net: '$4,000', avoided: '$1,000' }, 'Coverage capped at 100%');
  await scenario({ emissions: 100000000, price: 10000, coverage: 100, free: 0, reduction: 100000000 });
  assert.equal(await page.locator('#cf-gross').innerText(), '$1,000,000,000,000');
  assert.equal(await page.locator('#cf-net').innerText(), '$0');

  // Checklist completion is NOT documentary verification / accreditation.
  await page.getByRole('tab', { name: /Offset integrity/ }).click();
  for (const item of await page.locator('#cf-offset-checks input').all()) await item.check();
  assert.match(await page.locator('#cf-offset-count').innerText(), /6 \/ 6/);
  assert.equal(await page.locator('#cf-offset-status').innerText(), 'UNCERTAIN');
  assert.equal(await page.locator('#cf-offset-status').getAttribute('data-status'), 'UNCERTAIN');
  await page.getByRole('tab', { name: /Incentive evidence/ }).click();
  for (const item of await page.locator('#cf-incentive-checks input').all()) await item.check();
  assert.match(await page.locator('#cf-incentive-next').innerText(), /UNVERIFIED/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 3), false, 'Mobile overflow');
  assert.deepEqual(errors, [], 'No uncaught browser JS errors');
  console.log('ESI report export, 6 quantitative boundary cases, checklist fail-closed and mobile QA PASS');
} finally {
  await browser.close();
}
