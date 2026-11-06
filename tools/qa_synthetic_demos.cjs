const { chromium } = require("playwright");
const path = require("node:path");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    const errors=[];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto("file://" + path.resolve("poweros-demo.html"));
    await page.getByText("SYNTHETIC / ILLUSTRATIVE").waitFor();
    const initial = await page.locator("#outCost").innerText();
    assert.match(initial,/12,480/);
    await page.locator("#change").fill("10");
    assert.match(await page.locator("#outCost").innerText(),/15,600/);
    assert.equal(errors.length,0,"PowerOS page errors: "+errors.join(","));
    await page.goto("file://" + path.resolve("conform-demo.html"));
    await page.getByText("SYNTHETIC EXAMPLE ONLY").waitFor();
    assert.equal((await page.locator("#outStatus").innerText()),"PASS*");
    await page.getByRole("button",{name:"Contradictory packet"}).click();
    assert.equal((await page.locator("#outStatus").innerText()),"FAIL*");
    await page.getByRole("button",{name:"Incomplete packet"}).click();
    assert.equal((await page.locator("#outStatus").innerText()),"UNCERTAIN*");
    assert.equal(errors.length,0,"Browser page errors: "+errors.join(","));
    console.log("PASS synthetic PowerOS slider + CONFORM PASS/FAIL/UNCERTAIN, mobile viewport, zero JS errors");
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
