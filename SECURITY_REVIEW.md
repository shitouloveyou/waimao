# Edgevora Tools — launch security review

Review date: 2026-10-26 (UTC).

## Scope and evidence

Reviewed the application source and lockfile, public HTTPS responses, all 11 public content pages, product-to-inquiry navigation, and isolated production-mode HTTP tests. Production customer records, credentials and inquiry attachments were not retrieved. No real inquiries, email deliveries, load tests or destructive requests were made against the live website.

Observed on the live deployment before this security patch:

- Homepage, catalog, garden category, OEM, quality, FAQ, privacy and all four product pages returned HTTP 200 with one H1 and a description.
- Updated product URLs and homepage canonical were present. RFQ selection carried the product name and quantity into the inquiry form.
- Cloudflare Access redirected anonymous backup/export requests to its login page. Application routes independently check the signed administrator session.
- `/.env`, `/.git/config` and `/data/store.json` returned 404.
- HTTPS requests succeeded with normal certificate verification. HSTS, frame denial, nosniff and referrer-policy headers were present.
- The desktop hero headline and product image occupied separate columns. Viewport metadata and responsive CSS were reviewed; physical iPhone testing and a complete accessibility/performance audit were not performed.

## Issues addressed in this patch

1. **Customer reference files relied on unguessable public URLs.** New inquiry files use private storage and an authenticated attachment route, with private/no-store responses. Legacy attachment URLs linked from inquiry records now require administrator authentication too. Product and logo assets remain public. Previously downloaded/cached copies cannot be recalled by this code change.
2. **Uploads trusted their declared MIME type.** Added basic JPEG, PNG, WebP, PDF, MP4 and WebM signatures, retained per-file size limits, and bounded multipart request reads. These checks are not antivirus or full document validation.
3. **Write APIs lacked consistent same-origin enforcement and bounded JSON parsing.** Added same-origin checks, limited actual streamed body reads (not only Content-Length), rejected compressed bodies, and controlled malformed-body responses. SITE_URL must contain the real HTTPS origin.
4. **CSV exports could include spreadsheet formulas from inquiry fields.** Formula-like values are neutralized before export.
5. **Malformed session signatures could reach a timing-safe comparison with invalid buffers.** Sessions now require the expected timestamp and hexadecimal signature format. Existing valid sessions retain their current lifetime.
6. **Rate-limit buckets could grow without a hard bound.** Added bounded storage and per-process global ceilings alongside IP limits. Limits remain memory-local; they reset on restart and do not replace edge protection. Nginx must overwrite trusted proxy headers.
7. **JSON backup omitted orders.** Added orders. Full recovery still requires backing up the entire data directory, including attachments and analytics files.
8. **Minor launch polish.** Added the brand to homepage metadata, canonical URLs to FAQ/privacy, updated attachment privacy wording, and made new store-file writes owner-only.

## Verification

- Production `npm run build` passed.
- `npm run test:security` passed against an isolated temporary data directory, with external email credentials explicitly disabled.
- Regression coverage includes anonymous admin access, cross-origin mutations, malformed sessions/JSON, login cookie flags, legacy/new attachment permissions and cache policy, fake attachment rejection, valid inquiry persistence, oversized/compressed request rejection, CSV neutralization, order backup, product validation, permanent redirects with repeated query parameters, canonical metadata and unknown-product 404s.
- `npm audit --omit=dev` reported zero known vulnerabilities for the checked lockfile. This result is time-specific and does not cover OS packages or the deployed Node.js executable.
- Next.js 16.4.2 and sharp 0.35.5 satisfy the versions specified by the Next.js October 14 security notice. React Server Components fixes in Next.js are framework-bundled; the root React package version alone is not sufficient to assess that advisory.

## Server checks still required

These cannot be established from the public website/source alone:

- Actual Node.js version used by systemd. The October 21 security release fixes Node.js issues; use a patched supported line (22.23.4+, 24.22.1+, or 26.12.1+ within that major).
- Application listener bound to loopback, public firewall rules, Cloudflare origin isolation and trusted real-IP configuration.
- Nginx body size, request/connection limits and timeouts.
- Strength and permissions of production environment secrets, service user privileges, OS updates and off-server backups/restoration.
- A final real browser inquiry/email check after deployment of this patch, performed with a clearly marked test inquiry. This review did not send production mail.

This is a focused launch review and regression check, not a guarantee that every vulnerability has been found or a claim that the server has never been compromised.

## Primary references

- https://nextjs.org/blog/nextjs-security-update-october-14-2026
- https://nodejs.org/en/blog/vulnerability/october-2026-security-releases
