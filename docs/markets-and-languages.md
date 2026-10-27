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

- Language buttons change a shared React translation context **in place**. They do not navigate, reload or swap page layouts. The current URL, filters, basket, favorites, comparison, slideshow and form DOM remain in the same component tree. Preference is remembered locally.
- French `/fr`, German `/de`, Spanish `/es` entry URLs remain available for direct links/search engines, but now render the **same original Storefront and ProductPage** components as English. The earlier separate simplified templates were removed.
- All original sections, branding, gallery, media, buttons, ordering and CSS classes are shared. The language layer renders text fragments without extra HTML layout wrappers; input/button adapters retain native elements and refs.
- Existing quality, OEM, FAQ, catalog, category, privacy and consent components use the same text layer. UI and standard content use local dictionaries. Arbitrary custom English business copy or technical descriptions need explicit dictionary/product translations; unknown text remains unchanged rather than invented. Per-product name and description translations in admin remain supported.
- Each translated entry has self-canonical, reciprocal alternate language URLs and sitemap entries. Unknown languages and inactive/missing products remain 404.
- Product data and images are shared. All inquiry form field names, option values, submission handling, private attachments and notifications remain unchanged; translating the option label never changes its submitted value.
- No translation service, DOM mutation, new runtime packages or separate background process.

Google reference: https://developers.google.com/search/docs/specialty/international/localized-versions

## Validation and deployment

Production build and integration checks cover the three landing/product routes, reciprocal metadata, canonical URLs, sitemap, product alias redirects with repeated query values, missing routes, saved translations and malformed translation rejection, plus existing security checks. Browser access to the local preview was unavailable (connection refused). Visual checks, in-place switching with a filled form and one authorized inquiry should be completed on the deployed site. Tests use local temporary data, with no production inquiry or customer email sent.

Deploy with git pull, npm run build, then restart edgevora only after the build succeeds. Test a language switch from a product page and one authorized test inquiry; check the admin, email and Telegram. Adding languages does not guarantee indexing, rankings or organic traffic. Use Search Console impressions, queries, countries and actual inquiries for follow-up decisions.
