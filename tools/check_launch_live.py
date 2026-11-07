#!/usr/bin/env python3
"""Read-only external launch-pages parity. No live payment actions."""
import urllib.request
from datetime import datetime, timezone
targets={
 "https://trusta-sustain.com/launch-offers.html":["Evidence Triage","Scenario &amp; Data Review","Focused Infrastructure Diagnostic","From $1,500","From $3,500","From $6,500","Request written quote"],
 "https://trusta-sustain.com/partners.html":["10–15%","net cash actually collected","written agreement","No government procurement kickbacks"],
 "https://trusta-sustain.com/vendor-evidence-readiness.html":["Vendor Performance Evidence Readiness","Six checks before presenting results","Request a paid evidence review","not an accredited verification"],
 "https://trusta-sustain.com/":["/launch-offers.html","/partners.html"]
}
for url,required in targets.items():
 req=urllib.request.Request(url,headers={"User-Agent":"Trusta-Public-Parity/2026","Cache-Control":"no-cache"})
 with urllib.request.urlopen(req,timeout=20) as r:
  html=r.read().decode("utf-8")
  print(url,r.status,r.headers.get("Last-Modified"))
  assert r.status==200
  for needle in required:
   assert needle in html,(url,needle)
print("PASS",datetime.now(timezone.utc).isoformat(),"new services & partner live parity")
