#!/usr/bin/env python3
"""Dependency-free quality checks for Trusta's public brochure website."""
from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html", "products.html", "orbit.html", "poweros.html",
    "conform.html", "environmental-sustainability.html", "contact.html",
]
SPECIAL_LOCAL = (
    "/assets/mobile.css", "/assets/product-previews.css",
    "/assets/product-previews.js", "/assets/industrial-photography.css",
)

class Inspector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.links = []
        self.images = []
        self.tabs = []
        self.panels = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a":
            self.links.append(a.get("href", ""))
        if tag == "img":
            self.images.append(a)
        if a.get("role") == "tab":
            self.tabs.append(a)
        if a.get("role") == "tabpanel":
            self.panels.append(a)

errors = []
data = {}
for page in PAGES:
    source = ROOT / page
    if not source.is_file():
        errors.append(f"Missing critical page: {page}")
        continue
    html = source.read_text(encoding="utf-8")
    parser = Inspector()
    parser.feed(html)
    data[page] = (html, parser)
    if not html.lower().count('<meta name="viewport"'):
        errors.append(f"{page}: missing mobile viewport")
    if not html.lower().count('/assets/mobile.css'):
        errors.append(f"{page}: missing mobile stylesheet")
    if not html.lower().count('/assets/site.js'):
        errors.append(f"{page}: missing core site JS")
    for img in parser.images:
        if not img.get("alt") and img.get("alt") != "":
            errors.append(f"{page}: image without alt attribute")
    for href in parser.links:
        if not href or href.startswith(("http", "mailto:", "tel:", "#", "javascript:")):
            continue
        # Root-relative anchors have to point to a real local file.
        if href.startswith("/"):
            item = href.split("#", 1)[0].split("?", 1)[0].lstrip("/")
            if not item:
                continue
            # Restrict this to new commercial/product paths; legacy pages
            # may use external routing and are not rewritten here.
            if item in ["products.html", "orbit.html", "poweros.html", "conform.html", "contact.html"]:
                if not (ROOT / item).is_file():
                    errors.append(f"{page}: broken critical link {href}")

if "index.html" in data:
    html, parser = data["index.html"]
    for required in ('id="product-ui-previews"', 'trusta-photo-section', 'visual-showcase'):
        if required not in html:
            errors.append(f"Homepage missing visual module: {required}")
    expected = {
        "preview-tab-orbit": "preview-panel-orbit",
        "preview-tab-poweros": "preview-panel-poweros",
        "preview-tab-conform": "preview-panel-conform",
    }
    for tid, panel in expected.items():
        if tid not in parser.ids or panel not in parser.ids:
            errors.append(f"Homepage missing tab or panel: {tid} -> {panel}")
    if len(parser.tabs) != 3 or len(parser.panels) != 3:
        errors.append("Homepage preview tab/panel count must be three")
    for tab in parser.tabs:
        if tab.get("aria-controls") not in parser.ids:
            errors.append("Tab aria-controls points to missing panel")
    for target in [
        "https://orbit.trusta-sustain.com/demo/orbit",
        "https://trusta-poweros-public-app-production.up.railway.app/",
        "https://trusta-conform-public-app-production.up.railway.app/",
    ]:
        if target not in html:
            errors.append(f"Homepage missing product demo link: {target}")
if "products.html" in data and "/#product-ui-previews" not in data["products.html"][0]:
    errors.append("Products page lacks discoverable product preview link")
for name in [
    "assets/mobile.css", "assets/industrial-photography.css",
    "assets/product-previews.css", "assets/product-previews.js",
]:
    if not (ROOT / name).is_file():
        errors.append(f"Missing core asset: {name}")
if errors:
    for err in errors:
        print("FAIL:", err)
    sys.exit(1)
print(f"PASS: {len(PAGES)} critical pages, mobile styles, photo/preview assets, product CTAs and accessible tabs")
