#!/usr/bin/env python3
"""Release freshness and public endpoint check for Trusta's static website.

First-party HTML is a release gate: missing recently-shipped sections or a failed
fetch exits nonzero. Third-party product demos are advisory only.
"""
import urllib.request
import urllib.error
import sys

HOMEPAGE = "https://trusta-sustain.com/"
PAGES = {
    "Homepage": HOMEPAGE,
    "Products": "https://trusta-sustain.com/products.html",
    "Contact": "https://trusta-sustain.com/contact.html",
}
DEMOS = {
    "ORBIT demo": "https://orbit.trusta-sustain.com/demo/orbit",
    "PowerOS demo": "https://trusta-poweros-public-app-production.up.railway.app/",
    "CONFORM demo": "https://trusta-conform-public-app-production.up.railway.app/",
}
REQUIRED = {
    "Homepage": (
        'class="visual-showcase"',
        'class="trusta-photo-section"',
        'id="product-ui-previews"',
        'assets/product-previews.js',
        'assets/industrial-photography.css',
    ),
    "Products": ('/#product-ui-previews',),
    "Contact": ('growth@trusta-sustain.com',),
}


def fetch(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "TrustaSiteQA/1.1 (+public release verification)", "Accept": "text/html"},
    )
    with urllib.request.urlopen(request, timeout=18) as response:
        raw = response.read(1500000)
        return response.status, raw.decode("utf-8", errors="replace")


failures = []
for name, url in PAGES.items():
    try:
        code, html = fetch(url)
        missing = [marker for marker in REQUIRED.get(name, ()) if marker not in html]
        if code != 200 or missing:
            failures.append(f"{name}: HTTP {code}; missing release markers: {missing}")
        else:
            print(f"PASS {name}: HTTP {code}; expected release content present")
    except Exception as exc:
        failures.append(f"{name}: {type(exc).__name__}: {str(exc)[:220]}")

for name, url in DEMOS.items():
    try:
        code, _ = fetch(url)
        print(f"{'PASS' if code == 200 else 'WARN'} {name}: HTTP {code}")
    except Exception as exc:
        print(f"WARN {name}: {type(exc).__name__}: {str(exc)[:180]}")

if failures:
    for failure in failures:
        print("FAIL:", failure, file=sys.stderr)
    print("First-party live release checks failed; inspect hosting build, Pages settings and cache.", file=sys.stderr)
    sys.exit(1)

print("PASS: First-party public site matches expected release markers.")
