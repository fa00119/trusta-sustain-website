const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const endpoints = {
  power: "https://trusta-poweros-public-app-production.up.railway.app",
  conform: "https://trusta-conform-public-app-production.up.railway.app",
};
(async()=>{
  for (const [name,url] of Object.entries(endpoints)) {
    const res=await fetch(url+"/healthz",{signal:AbortSignal.timeout(20000)});
    assert.equal(res.status,200, name+" HTTP healthz");
    const body=await res.json();
    assert.equal(body.ok,true);
    assert.equal(body.mode,"synthetic");
  }
  const browser=await chromium.launch({headless:true});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const problems=[];
    page.on("pageerror",e=>problems.push(e.message));
    await page.goto(endpoints.power+"/",{waitUntil:"domcontentloaded",timeout:25000});
    await page.getByRole("heading",{name:/Explore energy decisions/i}).waitFor();
    assert.match(await page.locator("#baselineLabel").innerText(),/1,450/);
    await page.getByRole("button",{name:"District cooling"}).click();
    assert.match(await page.locator("#baselineLabel").innerText(),/2,350/);
    await page.locator("#shift").evaluate(el=>{el.value="10";el.dispatchEvent(new Event("input",{bubbles:true}));});
    assert.match(await page.locator("#shiftLabel").innerText(),/10%/);
    await page.getByRole("button",{name:"Reset example"}).click();
    assert.match(await page.locator("#baselineLabel").innerText(),/1,450/);
    await page.goto(endpoints.conform+"/",{waitUntil:"domcontentloaded",timeout:25000});
    await page.getByRole("heading",{name:/Every performance claim/i}).waitFor();
    assert.match(await page.locator("#finding").innerText(),/PASS/);
    await page.getByRole("button",{name:"Contradictory packet"}).click();
    assert.match(await page.locator("#finding").innerText(),/FAIL/);
    await page.getByRole("button",{name:"Missing provenance"}).click();
    assert.match(await page.locator("#finding").innerText(),/UNCERTAIN/);
    await page.getByRole("button",{name:"Restore complete packet"}).click();
    assert.match(await page.locator("#finding").innerText(),/PASS/);
    assert.deepEqual(problems,[]);
    console.log("PASS: two isolated Railway apps responsive, interactive synthetic cases, no browser exceptions");
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
