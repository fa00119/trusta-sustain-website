"""Dependency-free quality gates for the Trusta three-product prelaunch preview.

Run: python3 tools/check_three_product_preview.py
Scope: only newly edited product launch paths; not a browser or live deploy test.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = ("index.html", "about.html", "contact.html", "trusta-platform.html")
class Scan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.ids, self.forms, self.inputs = [], [], [], []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("a", "link", "script", "img"):
            target = attrs.get("href" if tag in ("a", "link") else "src")
            if target: self.links.append((tag, target))
        if "id" in attrs: self.ids.append(attrs["id"])
        if tag == "form": self.forms.append(attrs)
        if tag == "input": self.inputs.append(attrs)

failures = []
all_pages = {}
for path in PAGES:
    html = (ROOT / path).read_text(encoding="utf-8")
    s = Scan()
    s.feed(html)
    all_pages[path] = (html,s)
    if re.search(r"Farhad\s+Azarmi", html, flags=re.I):
        failures.append(f"{path}: personal name still public")
    if len(s.ids) != len(set(s.ids)):
        failures.append(f"{path}: duplicate HTML ids")
    if re.search(r"(?:private[_-]?key|api[_-]?token|session[_-]?secret)\s*[:=]", html, re.I):
        failures.append(f"{path}: possible embedded secret")
    for tag, url in s.links:
        if url.startswith("#"):
            if url[1:] not in s.ids:
                failures.append(f"{path}: broken anchor {url}")
        if not url.startswith("/") or url.startswith("//"): continue
        local = unquote(urlsplit(url).path).lstrip("/")
        if local and (not (ROOT/local).is_file() or ".." in Path(local).parts):
            failures.append(f"{path}: missing local {tag} target {url}")

home, hs = all_pages["index.html"]
about, ab = all_pages["about.html"]
contact, cs = all_pages["contact.html"]
platform, ps = all_pages["trusta-platform.html"]
for path, (html, scan) in all_pages.items():
    if path != "trusta-platform.html" and "/trusta-platform.html" not in html:
        failures.append(f"{path}: missing link to integrated platform")
for term in ("ORBIT", "PowerOS", "CONFORM", "UNVERIFIABLE", "Verified realized customer savings", "mailto:growth@trusta-sustain.com"):
    if term not in platform:
        failures.append(f"platform: missing critical term {term}")
if ps.forms:
    failures.append("platform: unexpected form or customer data intake")
if "operational meter" not in platform and "meter" not in platform.lower():
    failures.append("platform: missing confidential meter warning")
if not any(url.startswith("mailto:growth@trusta-sustain.com?") for _,url in ps.links):
    failures.append("platform: expected organization-managed mailto inquiry")
if "customer" in platform.lower() and "hypothetical" not in platform.lower():
    failures.append("platform: hypothetical/research evidence labelling missing")
if "trusta-platform.html" not in (ROOT/"sitemap.xml").read_text(encoding="utf-8"):
    failures.append("sitemap: product page not indexed")
if failures:
    print("PREVIEW QA FAIL")
    for item in failures: print(" -",item)
    sys.exit(1)
print(f"PREVIEW SOURCE QA PASS: {len(PAGES)} launch HTML pages, local links, anchors, privacy and controlled intake rules")
print("NOT TESTED: actual mail delivery, live production pages, browser render, endpoint security, accessibility, deploy.")
