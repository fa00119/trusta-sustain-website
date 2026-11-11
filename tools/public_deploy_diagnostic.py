#!/usr/bin/env python3
"""Read-only public deployment diagnostics, for CI run. Does not change hosting."""
import json, os, socket, ssl, urllib.request, urllib.error, time
HOST="trusta-sustain.com"
print("PUBLIC DEPLOYMENT DIAGNOSTICS")
try:
  print("DNS:", sorted(set(item[4][0] for item in socket.getaddrinfo(HOST,443))))
except Exception as e:print("DNS ERROR",repr(e))
for url in ["https://trusta-sustain.com/", "https://trusta-sustain.com/trusta-platform.html", "https://trusta-sustain.com/about.html",
            "https://fa00119.github.io/trusta-sustain-website/trusta-platform.html",
            "https://api.github.com/repos/fa00119/trusta-sustain-website/pages"]:
  print("URL",url)
  try:
    req=urllib.request.Request(url,headers={"User-Agent":"TrustaSiteDeploymentInspector/1.0","Cache-Control":"no-cache","Pragma":"no-cache"})
    with urllib.request.urlopen(req, timeout=20) as r:
      s=r.read(700000).decode("utf8","replace")
      print("RESULT", json.dumps({"code":r.status,"final_url":r.url,"headers":{k:v for k,v in r.headers.items() if k.lower() in ("server","x-github-request-id","x-served-by","x-cache","cf-cache-status","cf-ray","age","etag","last-modified","content-type","location")},"length":len(s),"contains_poweros": "PowerOS" in s, "contains_platform":"/trusta-platform.html" in s,"contains_legacy_founder":"Farhad Azarmi" in s, "snippet":s[:300]},ensure_ascii=False))
  except urllib.error.HTTPError as e:
    print("HTTP ERROR",e.code, str(e.read(250))[:250])
  except Exception as e: print("ERROR",repr(e))
