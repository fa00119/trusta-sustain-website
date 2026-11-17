#!/usr/bin/env python3
"""Headless Chromium checks for Trusta's responsive static website."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "website-qa"
OUTPUT.mkdir(parents=True, exist_ok=True)


@contextmanager
def local_server():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)


def assert_ok(value, description):
    if not value:
        raise AssertionError(description)
    print("PASS:", description)


def test_viewport(page, base, label, mobile):
    page.goto(base + "/index.html", wait_until="domcontentloaded")
    page.locator("#product-ui-previews").scroll_into_view_if_needed()
    assert_ok(page.locator('[role="tab"]').count() == 3, f"{label}: three product tabs")
    assert_ok(page.locator("#preview-panel-orbit").is_visible(), f"{label}: ORBIT preview visible")
    page.locator("#preview-tab-poweros").click()
    # Verify event reaches the local gtag dataLayer (without calling Google's servers).
    preview_events = page.evaluate("""() => Array.from(window.dataLayer || [])
      .filter(args => args[0] === 'event' && args[1] === 'product_preview_select')
      .map(args => args[2]?.product)""")
    assert_ok("poweros" in preview_events, f"{label}: PowerOS preview event queued locally")
    assert_ok(page.locator("#preview-panel-poweros").is_visible(), f"{label}: PowerOS tab active")
    assert_ok(page.locator("#preview-panel-orbit").is_hidden(), f"{label}: ORBIT panel hidden after switch")
    page.locator("#preview-tab-conform").click()
    assert_ok(page.locator("#preview-panel-conform").is_visible(), f"{label}: CONFORM tab active")
    preview_events = page.evaluate("""() => Array.from(window.dataLayer || [])
      .filter(args => args[0] === 'event' && args[1] === 'product_preview_select')
      .map(args => args[2]?.product)""")
    assert_ok("conform" in preview_events, f"{label}: CONFORM preview event queued locally")
    # Synthetic click: block navigation and email-client launch; no lead is generated.
    inquiry = page.locator('#preview-panel-conform a[href^="mailto:"]').first
    page.evaluate("""() => document.addEventListener('click', e => {
      if (e.target.closest('a[href^="mailto:"]')) e.preventDefault();
    }, {capture:true, once:true})""")
    inquiry.dispatch_event("click")
    inquiry_events = page.evaluate("""() => Array.from(window.dataLayer || [])
      .filter(args => args[0] === 'event' && args[1] === 'product_inquiry_intent')
      .map(args => args[2]?.product)""")
    assert_ok("conform" in inquiry_events, f"{label}: CONFORM inquiry intent event queued locally")
    page.locator("#preview-tab-conform").press("ArrowRight")
    assert_ok(page.locator("#preview-tab-orbit").get_attribute("aria-selected") == "true", f"{label}: keyboard arrow navigation")
    assert_ok(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2"), f"{label}: no horizontal page overflow")
    page.screenshot(path=str(OUTPUT / f"homepage-{label}.png"), full_page=True, animations="disabled")

    # Home uses collapsed navigation through 1600px, including laptop widths.
    if mobile or label == "desktop-1440":
        page.goto(base + "/index.html", wait_until="domcontentloaded")
        menu = page.locator(".menu")
        assert_ok(menu.is_visible(), f"{label}: responsive menu visible")
        menu.click()
        assert_ok(menu.get_attribute("aria-expanded") == "true", f"{label}: responsive navigation opens")
        menu.press("Escape")
        assert_ok(menu.get_attribute("aria-expanded") == "false", f"{label}: Escape closes responsive menu")

    page.goto(base + "/contact.html", wait_until="domcontentloaded")
    assert_ok(page.locator("#choose-engagement").count() == 1, f"{label}: inquiry choices available")
    assert_ok(page.locator("#copy-growth-email").count() == 1, f"{label}: copy-email fallback is available")
    assert_ok(page.locator("#copy-growth-feedback").is_visible(), f"{label}: email fallback contact address is readable")
    for product, subject in [("ORBIT", "ORBIT%20Site%20Screen"), ("PowerOS", "PowerOS%20Scenario"), ("CONFORM", "CONFORM%20Evidence")]:
        href = page.locator(f'#choose-engagement a[href^="mailto:"]').filter(has_text=product).first.get_attribute("href")
        assert_ok(href is not None and subject in href, f"{label}: {product} inquiry directs to matching sales template")
    assert_ok(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2"), f"{label}: contact page fits viewport")
    page.screenshot(path=str(OUTPUT / f"contact-{label}.png"), full_page=True, animations="disabled")


def main():
    with local_server() as base, sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
        try:
            for label, width, height, mobile in (
                ("mobile-320", 320, 740, True),
                ("mobile-375", 375, 812, True),
                ("tablet-768", 768, 1024, True),
                ("desktop-1440", 1440, 900, False),
            ):
                context = browser.new_context(viewport={"width": width, "height": height},
                                              is_mobile=mobile, has_touch=mobile)
                page = context.new_page()
                page.route("https://**/*", lambda route: route.abort())
                test_viewport(page, base, label, mobile)
                context.close()
        finally:
            browser.close()
    print("PASS: Responsive UI smoke checks complete")


if __name__ == "__main__":
    main()
