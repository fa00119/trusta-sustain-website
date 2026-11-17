# Trusta Website Conversion Measurement — Baseline & Operating Rules

**Baseline period:** 2026-11-10 through 2026-11-16 inclusive.  
**Source:** Connected Trusta Sustain GA4 property (561144668) and Google Search Console (domain `trusta-sustain.com`) via Windsor.ai.  
**Data timing:** GA4 may lag; numbers are a point-in-time query, not guaranteed finalized.  
**Maintainer:** Trusta Growth & Product Engineering.

## Baseline metrics

| Metric | Observed |
|---|---:|
| GA4 `page_view` events | 171 |
| GA4 `sessions` in date-level session report | 76 |
| GA4 views of `/` (page-path report) | 55 |
| GA4 views of `/contact.html` | 2 |
| GA4 `enterprise_contact_intent` events | 2 |
| GA4 `orbit_live_demo_open` events | 1 |
| GA4 `energy_scan_completed` events | 11 |
| GA4 `decision_brief_generated` events | 3 |

Do not interpret the numbers as users, unique people, qualified leads or confirmed revenue. Reports may apply different measurement bases; **do not divide contact page views by homepage views and call it session conversion**.

## Funnel stages & permitted evidence

1. **Site reach:** GA4 sessions/users, `screen_page_views`, landing page and traffic source.
2. **Product engagement:** `product_preview_select`, `product_demo_open` and product page views.
3. **Inquiry intent:** `product_inquiry_intent`, `pilot_inquiry_navigation`, `enterprise_contact_intent`, `contact_email_copy`. These are **click/copy actions, not sent emails**.
4. **Inbound inquiry confirmed:** Email actually received by `growth@trusta-sustain.com` or another authorized inbox, with a subject/time/correspondence supporting the inquiry. Do not auto-attribute it to the website without explicit referral data or verifiable link.
5. **Qualified opportunity:** Human or CRM-reviewed fit, actual scope, buyer, and next step.
6. **Proposal / paid conversion:** Confirmed written proposal and accepted scope, or verified order/payment record. **Never infer payment from a checkout click**.

All analytics events should avoid raw emails, names, email body text, facility addresses, sensitive customer files, secrets and other PII.

## Implementation inventory (November 2026)

- Website has product-specific inquiry links to Growth with minimal, non-confidential scoping prompts.
- `assets/site.js` tracks `product_demo_open` and `product_inquiry_intent` category, plus `pilot_inquiry_navigation` and existing `enterprise_contact_intent`.
- `assets/product-previews.js` tracks `product_preview_select`.
- `assets/contact-email.js` tracks `contact_email_copy` only when the address was actually copied; it never claims an inquiry was submitted.
- GitHub Actions `.github/workflows/site-qa.yml` checks static pages, browser interaction and public HTML freshness. A passing **local browser test is not evidence of production browser success**.
- Public site release state and new GA4 event ingestion must be independently validated.

## Weekly review operating procedure

1. Read GA4 session and event-count reports by date, source and relevant landing page.
2. Look for recent custom event names; if absent, separate **no recorded interactions** from **measurement not verified**.
3. Check connected Growth inbox and CRM for **actual inbound** inquiry receipts and qualifications, excluding outbound replies, auto-responses, spam, and self-tests.
4. Reconcile qualified leads and proposal/payment evidence by actual identifiers and consented process; do not guess website source.
5. Compare *like-for-like date ranges* and note release dates when interpreting trends.
6. Prioritize a broken inquiry path or high-intent page before cosmetic features.

## GA4 follow-up checks

- Confirm that product-preview tab interactions and product-specific inquiry clicks generate their custom GA4 events with permitted `product` and `source_path` parameters.
- Validate GA4 event availability with an actual, consented test click if needed; **avoid artificially inflating production lead counts**.
- Only mark an event as a key event after confirming it represents the intended funnel stage (e.g., an inquiry click is not a completed lead).
- Use separate fields for `clicked`, `email_received`, `qualified`, `proposal_sent`, `won`, `revenue_verified`.

## Search Console baseline note

The connected domain Search Console report for the recent 14-day period returned **8 homepage clicks from 22 impressions**, with very small counts on most product pages. These counts are too small to infer strong SEO trends or commercial conversion rates; use them to prioritize ongoing search-visibility measurement, not to make sales claims.

**Commercial outcome definition:** Repeatable, verified qualified inbound opportunities and paid customers, not traffic or clicks alone.
