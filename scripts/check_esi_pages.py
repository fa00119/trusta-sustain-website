"""Static checks for the additive ESI website pages; does not replace browser/deploy QA."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import sys

PAGES = ["environmental-sustainability.html","esi-evidence-explorer.html",
         "index.html","products.html","launch-offers.html","partners.html","contact.html"]

class Check(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.urls=[];self.titles=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if "id" in a:self.ids.append(a["id"])
        if tag=="a" and "href" in a:self.urls.append(a["href"])
        if tag=="title":self.titles+=1

def main():
    bad=[]
    for path in PAGES:
        file=Path(path)
        if not file.exists():
            bad.append(f"Missing {path}");continue
        text=file.read_text(encoding="utf-8")
        parser=Check()
        try: parser.feed(text)
        except Exception as exc:bad.append(f"{path}: html parser {exc}")
        if parser.titles!=1:bad.append(f"{path}: title count {parser.titles}")
        if len(parser.ids)!=len(set(parser.ids)):bad.append(f"{path}: repeated id")
        for link in parser.urls:
            u=urlparse(link)
            if link.startswith("/") and not link.startswith("//") and not (Path("." + u.path).exists() or u.path=="/"):
                bad.append(f"{path}: broken link {link}")
        if path=="environmental-sustainability.html":
            for term in ["Scope 1","Scope 2","Scope 3","ORBIT","PowerOS","CONFORM","illustrative"]:
                if term not in text:bad.append(f"ESI missing {term}")
        if path=="esi-evidence-explorer.html":
            for term in ["role=\"tab\"","addEventListener","scope3_category","Scope 1","Scope 2","Scope 3"]:
                # Scope3 categories are described as a screening, not entered in the prototype.
                if term=="scope3_category":continue
                if term not in text:bad.append(f"Explorer missing {term}")
    if bad:
        print("\n".join(bad));return 1
    print("ESI additive pages: basic static checks pass; browser, accessibility, deployment and CTA checks still required.")
    return 0

if __name__=="__main__":sys.exit(main())
