# Standalone Trusta Product Applications — 2026-11-06

Two isolated public apps are deployed in the Railway project `trusta-product-apps-public` (production). **These are illustrative, entirely synthetic decision-support demonstrations, NOT validated customer-control/verification engines.** The protected PowerOS research Studio is a separate service, untouched.

| App | Railway function service ID | Live Railway address | Planned custom hostname |
|---|---|---|---|
| PowerOS | `92e28394-7fee-47c2-af37-33ca2be5c5e8` | https://trusta-poweros-public-app-production.up.railway.app | `poweros.trusta-sustain.com` |
| CONFORM | `13a2d9fb-e48d-4228-9d38-d9eee145961f` | https://trusta-conform-public-app-production.up.railway.app | `conform.trusta-sustain.com` |

## DNS records needed at the authoritative DNS host (GoDaddy if that is where the zone is managed)

| Type | Host / Name | Target / Value |
|---|---|---|
| CNAME | `poweros` | `hklmoohe.up.railway.app` |
| TXT | `_railway-verify.poweros` | `railway-verify=db822559b8c054ad0f76b516db058450d5f5ec0bb0130c52cc072834dc7e32d9` |
| CNAME | `conform` | `lntbxpvc.up.railway.app` |
| TXT | `_railway-verify.conform` | `railway-verify=3ca5f822a67e263cb1e4e493530194941b4a047a37c360d207beeb14719c0a8d` |

These are the values returned by Railway on 2026-11-06. Do not create conflicting A/AAAA/CNAME records for these hosts. Add the records, then confirm both Railway domain ownership and certificate issuance before changing any website links from Railway addresses to custom hostnames. DNS changes must be made wherever authoritative nameservers point; buying new domains is unnecessary.

## Code ownership and deployment

- `apps/poweros-public/index.ts` is the source snapshot of the deployed PowerOS Bun Function.
- `apps/conform-public/index.ts` is the source snapshot of the deployed CONFORM Bun Function.
- These Railway Functions are currently **not auto-linked to GitHub**: edits to GitHub files alone do not deploy them. Future updates must modify the Function code through an approved release, compare the source snapshot and deployed code, then run CI and verify Railway `SUCCESS`.
- GitHub Actions `standalone-apps-qa.yml` exercises both remote apps (200/healthz + mobile browser scenarios).
- No personal data upload, account creation, production controller, third-party verification, Stripe connection or arbitrary file processing exists in these public demonstrations.

## Promotion gate
Do not describe simulated PowerOS cost differences as independently verified savings. Do not describe CONFORM example PASS as accreditation, accepted regulatory compliance or real-world evidence certification. Conduct a separately authorized customer pilot with pre-registered baseline and reference truth to substantiate field outcomes.
