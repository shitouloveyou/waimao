# Pruning shear markets and multilingual buyer pages

Research checked 27 October 2026. Source: World Bank WITS / UN Comtrade, HS 820150, calendar year 2024, imports from World:
https://wits.worldbank.org/trade/comtrade/en/country/ALL/year/2024/tradeflow/Imports/partner/WLD/product/820150

| Country | Import value, USD million |
|---|---:|
| United States | 51.96549 |
| France | 44.19794 |
| Germany | 37.81119 |
| Netherlands | 22.17015 |
| United Kingdom | 13.68563 |
| Spain | 10.53780 |

These are category-level import values, **not actual unit usage or demand for this supplier's SK5 models**. The heading includes similar single-handed shears, including poultry shears. Imports can include distribution/re-exports; domestic production and sales are not measured. EU totals must not be added to member-country values. This is a market-screening aid, not an advertisement ROI estimate. It suggests researching buyers in the US, France and Germany first; customer fit, landed cost, samples and actual inquiries must still be established.

## Implemented language scope

- Existing English site remains at `/` and `/products/...`.
- French `/fr`, German `/de`, Spanish `/es`: translated buyer landing/catalog, product template and inquiry form.
- One shared product database and images; active products automatically appear in each language. Products are never copied into independent stores.
- Top language links use native language names; product detail links retain the current product and URL query attribution. Other English auxiliary pages link to the relevant language's homepage.
- Each translated page has a self-canonical, reciprocal alternate language URLs and sitemap entries. Unknown languages and inactive/missing products return 404.
- Product editor supports optional name and description translations. Known category/material/name terms have a limited built-in glossary. All other product-specific English technical text is explicitly displayed as original English, not passed off as a full translation. Confirm translations against actual specifications; no model attributes are invented.
- Auxiliary quality, OEM, FAQ, category, printable catalog and privacy pages remain English in this first version; the language choices lead back to a translated buying entry point. This is not a claim of complete site-wide translation.
- Forms use the existing same-origin inquiry endpoint, spam field, limits, private attachment handling and notification settings. Request type values remain stable for the admin. No additional server, translation API, package or background service.
- Product clicks on localized paths use the existing event tracking. Analytics consent behavior is unchanged; the existing consent banner is English.

Google reference: https://developers.google.com/search/docs/specialty/international/localized-versions

## Validation and deployment

Production build and integration checks cover the three landing/product routes, reciprocal metadata, canonical URLs, sitemap, product alias redirects with repeated query values, missing routes, saved translations and malformed translation rejection, plus existing security checks. Phone visual validation and a real localized inquiry should be completed after deployment. Tests use local temporary data, with no production inquiry or customer email sent.

Deploy with git pull, npm run build, then restart edgevora only after the build succeeds. Test a language switch from a product page and one authorized test inquiry; check the admin, email and Telegram. Adding languages does not guarantee indexing, rankings or organic traffic. Use Search Console impressions, queries, countries and actual inquiries for follow-up decisions.
