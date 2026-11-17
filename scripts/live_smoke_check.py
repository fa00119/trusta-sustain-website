#!/usr/bin/env python3
"""Best-effort public endpoint status. Warn, never fail deployment for third-party outages."""
import urllib.request
import urllib.error
import time
urls = {
    "Website homepage": "https://trusta-sustain.com/",
    "Products": "https://trusta-sustain.com/products.html",
    "ORBIT read-only demo": "https://orbit.trusta-sustain.com/demo/orbit",
    "PowerOS synthetic demo": "https://trusta-poweros-public-app-production.up.railway.app/",
    "CONFORM synthetic demo": "https://trusta-conform-public-app-production.up.railway.app/",
}
for name, url in urls.items():
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "TrustaSiteQA/1.0"})
        with urllib.request.urlopen(request, timeout=12) as response:
            content = response.read(700000).decode("utf-8", errors="replace")
            code = response.status
            note = ""
            if name == "Website homepage":
                missing = [s for s in ['id="product-ui-previews"', 'trusta-photo-section'] if s not in content]
                note = " WARNING: public HTML missing newest sections: " + ", ".join(missing) if missing else " latest sections visible"
            print(f"{name}: HTTP {code}{note}")
    except Exception as exc:
        print(f"WARNING: {name}: {type(exc).__name__}: {str(exc)[:180]}")
print("Public checks are informational; GitHub source checks are release gates.")
