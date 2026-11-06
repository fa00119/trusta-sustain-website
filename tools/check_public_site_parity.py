#!/usr/bin/env python3
"""Read-only comparison of approved repository copy against publicly served HTML.
Fails closed if the public endpoint still serves stale HTML; never submits forms.
"""
import datetime
import sys
import urllib.request
from urllib.error import HTTPError, URLError

TARGETS = [
    ("https://trusta-sustain.com/", "Fixed scope and fee confirmed in a written proposal"),
    ("https://trusta-sustain.com/contact.html", "Request an ORBIT screen"),
    ("https://trusta-sustain.com/products.html", "Decide. Model. Verify. Learn."),
    ("https://trusta-sustain.com/poweros.html", "Request a guided PowerOS demo"),
    ("https://trusta-sustain.com/conform.html", "Request a guided CONFORM demo"),
    ("https://trusta-sustain.com/poweros-demo.html", "SYNTHETIC / ILLUSTRATIVE"),
    ("https://trusta-sustain.com/conform-demo.html", "SYNTHETIC EXAMPLE ONLY"),
]
for url, marker in TARGETS:
    req = urllib.request.Request(url, headers={
        "User-Agent": "Trusta-Public-Parity-QA/1.0",
        "Accept": "text/html",
        "Cache-Control": "no-cache",
    })
    try:
        with urllib.request.urlopen(req, timeout=18) as response:
            html = response.read(512_000).decode("utf-8", errors="replace")
            found = marker in html
            print(f"{url}: HTTP {response.status}, expected marker found={found}; "
                  f"ETag={response.headers.get('ETag')}; "
                  f"Last-Modified={response.headers.get('Last-Modified')}; "
                  f"Cache={response.headers.get('CF-Cache-Status') or response.headers.get('X-Cache')}")
            if not found:
                print("FAIL: public site does not yet match approved main copy")
                sys.exit(1)
    except (HTTPError, URLError, TimeoutError) as err:
        print(f"FAIL: public site fetch error: {type(err).__name__}: {err}")
        sys.exit(2)
print(f"PASS: public site parity {datetime.datetime.now(datetime.timezone.utc).isoformat()}")
