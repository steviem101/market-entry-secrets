# MES-178 case-study import review

Source: `mes_case_studies_batch_65.csv` (65 drafts). Imported **44** as
`content_items` drafts (`status='draft'`, `content_type='case_study'`); skipped **21**
company-level duplicates already live in the catalogue.

## Skipped (existing case study covers the same company story)

| Batch slug (not imported) | Existing live slug |
|---|---|
| `how-airbnb-scaled-australia-from-sydney-hub-to-mainstream-travel` | `airbnb-australia-market-entry` |
| `how-kaufland-abandoned-australia-before-opening-a-single-store` | `kaufland-australia-market-entry` |
| `how-stripe-entered-australia-through-platforms-not-sales-teams` | `stripe-australia-fintech-expansion` |
| `how-masters-lowes-lost-billions-challenging-bunnings` | `masters-australia-market-entry` |
| `how-starbucks-misread-australias-coffee-culture-and-closed-61-stores` | `starbucks-australia-market-entry` |
| `how-ola-won-australian-drivers-but-never-won-the-riders` | `ola-australia-market-entry` |
| `how-topshops-australian-franchise-collapsed-under-its-own-economics` | `topshop-australia-market-entry` |
| `how-canva-launched-globally-from-sydney-with-a-50-000-person-waitlist` | `canva-australian-design-dominance` |
| `how-afterpay-invented-buy-now-pay-later-from-its-australian-home-market` | `afterpay-buy-now-pay-later-revolution` |
| `how-netflix-localised-its-way-to-australian-streaming-dominance` | `netflix-streaming-australia-launch` |
| `how-aws-built-australias-cloud-market-around-a-sydney-region` | `aws-australia-market-entry` |
| `how-amazon-recovered-from-an-underwhelming-australian-launch` | `amazon-australia-ecommerce-entry` |
| `how-wise-undercut-australias-big-four-banks-on-fx-transparency` | `wise-anz-market-entry` |
| `how-secretlab-sold-australia-gaming-chairs-without-a-single-store` | `secretlab-anz-market-entry` |
| `how-binances-growth-first-australian-entry-ended-in-regulatory-retreat` | `binance-australia-derivatives-market-entry` |
| `how-weworks-australian-business-outlived-its-parents-bankruptcy` | `wework-australia-market-entry` |
| `how-shopback-used-cashback-to-break-into-australian-loyalty` | `shopback-anz-market-entry` |
| `how-foodoras-australian-exit-left-a-gig-economy-legal-bill` | `foodora-australia-market-entry` |
| `how-tesla-used-the-worlds-biggest-battery-to-cement-its-australian-entry` | `tesla-australia-market-entry` |
| `how-slack-spread-through-australian-workplaces-before-hiring-locally` | `slack-australian-market-entry` |
| `how-employment-hero-won-australian-smes-before-expanding-abroad` | `employment-hero-australia-startup` |

## Near matches (imported — editorial judgement call)

- `how-uber-outran-australian-regulators-and-legalised-ride-sharing` — Existing uber-carshare-australia-market-entry covers Uber Carshare only — different story, kept.

## Imported drafts

| Slug | Company | Origin | Outcome | Sections | Notion |
|---|---|---|---|---|---|
| `how-uniqlo-tested-australia-with-a-pop-up-before-its-flagship-bet` | Uniqlo | Japan | successful | 6 | [page](https://www.notion.so/090bce5ab890416d88c9b91826b07429) |
| `how-ing-built-australias-biggest-branchless-bank-from-one-savings-product` | ING | Netherlands | successful | 6 | [page](https://www.notion.so/44abc988600043048ef9f388da189dd3) |
| `how-zara-turned-day-one-sydney-queues-into-a-national-foothold` | Zara | Spain | successful | 6 | [page](https://www.notion.so/4626e68b90114d3d8a11654aec57255a) |
| `how-aldi-cracked-australias-grocery-duopoly-with-a-no-frills-playbook` | Aldi | Germany | successful | 6 | [page](https://www.notion.so/e699c859cad3458ab29c5b2f77214951) |
| `how-costco-pre-sold-australia-on-the-membership-warehouse-model` | Costco | United States | successful | 6 | [page](https://www.notion.so/99a10123dbd442eea119c60f27103d91) |
| `how-byd-rode-a-local-distributor-into-australias-top-car-brands` | BYD | China | successful | 6 | [page](https://www.notion.so/dc2eb1e9209840ba8508bd9731530c22) |
| `how-purplebricks-flat-fee-failed-australias-no-sale-no-fee-culture` | Purplebricks | United Kingdom | unsuccessful | 6 | [page](https://www.notion.so/e697afd6c4a84033b10988e24d60e188) |
| `how-krispy-kreme-over-expanded-its-way-into-administration-in-australia` | Krispy Kreme | United States | unsuccessful | 6 | [page](https://www.notion.so/8bdde0aa06524f6fb83feda8882eaf2b) |
| `how-guzman-y-gomez-filled-australias-mexican-fast-food-gap-and-hit-the-asx` | Guzman y Gomez | Australia | successful | 6 | [page](https://www.notion.so/245bb0b395a84901a48896a588628cf9) |
| `how-xinja-grew-deposits-it-couldnt-afford-and-handed-back-its-banking-licence` | Xinja | Australia | unsuccessful | 6 | [page](https://www.notion.so/88a52153d5af416b823d813ebbd5b9f1) |
| `how-koala-won-australian-mattresses-with-four-hour-delivery-and-a-120-night-trial` | Koala | Australia | successful | 6 | [page](https://www.notion.so/918c60f5101e446a8494cb70b3c57e4f) |
| `how-spotify-converted-australias-music-pirates-into-paying-subscribers` | Spotify | Sweden | successful | 6 | [page](https://www.notion.so/2c76368a2d7b4cd1a2e37bfe87470709) |
| `how-uber-outran-australian-regulators-and-legalised-ride-sharing` | Uber | United States | successful | 6 | [page](https://www.notion.so/ab32c8056c9747879db66b9ea17b5cba) |
| `how-quickflix-lost-its-home-market-when-netflix-arrived` | Quickflix | Australia | unsuccessful | 6 | [page](https://www.notion.so/40b6282969b749bd8c5df4e57594de7d) |
| `how-klarna-entered-afterpays-home-turf-with-a-big-bank-alliance` | Klarna | Sweden | unsuccessful | 6 | [page](https://www.notion.so/203e95d826b242afb92588a1b1658551) |
| `how-ocado-entered-australia-as-a-technology-partner-not-a-retailer` | Ocado | United Kingdom | successful | 9 | [page](https://www.notion.so/112b609b8f6d4e92a7f55346a3fb0d1b) |
| `how-lightspeed-acquired-its-way-into-australian-hospitality-pos` | Lightspeed | Canada | successful | 9 | [page](https://www.notion.so/c7807ee1c96346ad8c2d109b0feafd19) |
| `how-starlings-engine-entered-australia-selling-bank-tech-not-banking` | Engine by Starling | United Kingdom | successful | 9 | [page](https://www.notion.so/3c3a6adb80f1442c931c3b45bb6f42a3) |
| `how-sharesies-took-kiwi-micro-investing-across-the-tasman` | Sharesies | New Zealand | successful | 9 | [page](https://www.notion.so/f65fef00502d4c6b85a096670f605d12) |
| `how-serko-won-australian-corporate-travel-before-going-global` | Serko | New Zealand | successful | 9 | [page](https://www.notion.so/b009e9e335ab40329f11cf50d088b48b) |
| `how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry` | OVO Energy | United Kingdom | mixed/none | 9 | [page](https://www.notion.so/4c179b5719234b9b8a18154e825b923f) |
| `how-shopify-won-australian-merchants-with-partner-led-growth` | Shopify | Canada | successful | 9 | [page](https://www.notion.so/719b809ba5d14fd3bdcd06da2bc2a4af) |
| `how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno` | Circles.Life | Singapore | mixed/none | 10 | [page](https://www.notion.so/b4718523ad72462cadee3fd5f2206f79) |
| `how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down` | Japan Post | Japan | unsuccessful | 9 | [page](https://www.notion.so/c0b2cd8cb4ae4a16995b8f43a2d273d0) |
| `how-singtel-bought-optus-to-enter-australia-at-full-scale` | Singtel | Singapore | successful | 10 | [page](https://www.notion.so/9b51346e264145eaa3d7b167828e548c) |
| `how-minor-international-bought-oaks-hotels-to-enter-australia-overnight` | Minor International | Thailand | successful | 10 | [page](https://www.notion.so/ffbd2abc025848d4a9f7393555fdc913) |
| `how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia` | Kia | South Korea | successful | 9 | [page](https://www.notion.so/21db221c948b4c6cbd9ba437f3e2fa35) |
| `how-daiso-translated-japans-fixed-price-retail-model-for-australia` | Daiso | Japan | successful | 10 | [page](https://www.notion.so/83604ce05f4e410d9729320e7df27eeb) |
| `how-hellofresh-built-australias-meal-kit-category-from-scratch` | HelloFresh | Germany | successful | 10 | [page](https://www.notion.so/bd397dee4b20433fae64458f2f067695) |
| `how-doordash-made-a-late-entry-work-in-australian-food-delivery` | DoorDash | United States | successful | 10 | [page](https://www.notion.so/cd0b3c0c6334460eb048c135db3c74a2) |
| `how-didi-tested-geelong-before-undercutting-uber-across-australia` | DiDi | China | successful | 10 | [page](https://www.notion.so/fd5e0f69773b4f46ae4a78bd86f220ab) |
| `how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly` | Bolt | Estonia | unsuccessful | 9 | [page](https://www.notion.so/1f296a1357f64fbe9c09849aa91db5cd) |
| `how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition` | Fujitsu | Japan | successful | 9 | [page](https://www.notion.so/f5e05baed8444f2f8d5beb0040d38378) |
| `how-agoda-carved-out-an-australian-niche-in-asia-bound-travel` | Agoda | Thailand | successful | 10 | [page](https://www.notion.so/15a23822ae024e558b5ab2ecd7957470) |
| `how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading` | Rakuten Kobo | Japan | successful | 10 | [page](https://www.notion.so/d9c6fe42da6940a194a25cc8faa9de12) |
| `how-nec-anchored-its-australian-entry-in-government-contracts` | NEC | Japan | successful | 10 | [page](https://www.notion.so/724580ed180f4c4592954590d6519eaf) |
| `how-monday-com-scaled-australia-remotely-before-landing-onshore` | monday.com | Israel | successful | 10 | [page](https://www.notion.so/92001b9d6c82464ca615854b6ec74516) |
| `how-zendesk-made-melbourne-its-asia-pacific-launchpad` | Zendesk | Denmark | successful | 10 | [page](https://www.notion.so/567c80f9d2de488996b27debeeda2815) |
| `how-hubspot-grew-australia-using-its-own-inbound-playbook` | HubSpot | United States | successful | 9 | [page](https://www.notion.so/26b7f5b763f145b59e41b5adb105c5a8) |
| `how-intercom-served-australia-product-first-presence-later` | Intercom | Ireland | successful | 9 | [page](https://www.notion.so/2c90eb2f565c44788455f38225c478b9) |
| `how-intuit-quickbooks-took-the-fight-to-xero-in-australia` | Intuit QuickBooks | United States | unsuccessful | 8 | [page](https://www.notion.so/319234e6cee3403c8aa68cd2abbb6be5) |
| `how-rippling-localised-payroll-to-enter-compliance-heavy-australia` | Rippling | United States | mixed/none | 9 | [page](https://www.notion.so/c1d88a693ac64e24a8dea85b8e6d5e4b) |
| `how-zoho-played-the-long-game-in-australia-with-local-data-centres` | Zoho | India | successful | 9 | [page](https://www.notion.so/9e465376650443408d08436d1f36fadb) |
| `how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs` | Freshworks | India | successful | 10 | [page](https://www.notion.so/9ecf4f0af4fa46d9a0c9a45cf7547520) |

Sources for fact-checking stay in the CSV's `sources_markdown` column
(editorial only — never published, not written to the database).
## Verification (2026-07-14, post-import)

- 44/44 drafts present in `content_items` (`status='draft'`, `content_type='case_study'`).
- Per-slug `content_sections` / `content_bodies` counts match the generated
  fixture (`scripts/mes-178-case-study-import/out/expected_counts.json`) exactly;
  every draft has one `content_company_profiles` row.
- RLS check as the `anon` role: **0 drafts visible**; the public catalogue still
  shows only the 102 previously published case studies.
- Import was applied via the Supabase MCP (service-role execution path per the
  ticket); statements are idempotent and safe to re-run.
