# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing landing page for Polein, a gym equipment maintenance/repair service in Guadalajara, Mexico — React 17 + CRA, deployed to GitHub Pages at polein.com.mx.

## Commands

```bash
yarn install           # install deps
yarn start             # dev server on localhost:3000
npm run build          # production build → build/
npm test               # run test suite (react-scripts test)
git push origin main    # deploys: GitHub Actions builds and publishes to GitHub Pages
```

## Non-obvious conventions

- **All page content lives in `src/data/data.json`** — text, images, contact info, social URLs. Components receive this as props from `App.jsx`. Never hardcode display text in components.

- **Social media keys are mismatched:** `Contact.youtube` holds the WhatsApp `wa.me` link; `Contact.twitter` holds the Instagram URL. The keys are legacy and the icon rendering in `contact.jsx` reflects the actual service, not the key name. Do not rename the keys without updating both files.

- **Route-aware anchor links:** `navigation.jsx` checks `location.pathname === '/'` to decide between `#section` (same-page) and `/#section` (cross-page) hrefs. Any new nav link must follow this pattern.

- **Bootstrap via local file, not CDN:** Bootstrap CSS/JS and Font Awesome are served from `public/css/` and `public/fonts/` (copied into the repo), not from a CDN. jQuery 1.11.1 is in `public/js/` but only used by Bootstrap's JS collapse — React handles all interactivity.

- **EmailJS credentials are in source:** Service ID, template ID, and public key are hardcoded in `src/components/contact.jsx`. There is no `.env` file. See `docs/emailjs.md` before modifying the contact form.

- **The hero headline is baked into the banner image** (`public/img/polein-header.webp`). `Header.title` renders as a screen-reader/SEO-only `<h1 className="sr-only">` — no visible text overlay. Only the CTA buttons (`Header.ctaPrimary` = WhatsApp, `Header.ctaSecondary` = services) sit on top. On mobile (<768px) the banner is shown uncropped (`background-size: 100% auto`) with the buttons below it on navy, because `cover` cropped the image's headline.

- **Tracking IDs live in `src/config/tracking.js`** (GA4, Google Ads, Meta Pixel). An empty ID = that platform never loads. `src/utils/analytics.js` uses one document-level click listener that auto-tracks every `wa.me` link (`whatsapp_click`) and `tel:` link (`call_click`); the contact form fires `generate_lead` on success. New WhatsApp/phone links need no extra tracking code. Read `docs/tracking.md` before touching tracking: GA4 events must **not** be imported into Google Ads (double counting), and the privacy notice must change with any tracking tool.

- **UI labels live in `data.Labels`** (nav, section titles, form fields/messages, aria-labels, footer) — passed to components as a `labels` prop because some sections' `data` is an array with no room for a title. Add new UI strings there, not in JSX.

- **Business info is duplicated in `public/index.html`** (Open Graph tags + LocalBusiness JSON-LD for Google/WhatsApp previews, which can't read React state). When phone, email, hours, socials or services change in `data.json`, update `index.html` too. Share image: `public/img/og-image.jpg` (1200×630).

- **`Brands` lists brand names as text only** — no logos (would need each brand owner's permission); keep the disclaimer.

- **Privacy notice (Aviso de Privacidad, Mexican LFPDPPP)** lives in `data.Privacy` and renders at `/aviso-de-privacidad` (`PrivacyPolicy.jsx`; `/terms-and-conditions` redirects there). In `sections[].content`, a string is a paragraph and an array is a bullet list; URLs and emails are auto-linked. Update `lastUpdated` and the cookies/providers sections whenever tracking tools or form providers change. The contact form shows `Privacy.formNotice` + link above the submit button.

- **`public/sitemap.xml` lists only `/`.** Sub-routes are served through `404.html` with HTTP 404, so Google won't index them — don't add them to the sitemap. SEO landing pages would need real prerendered HTML files per route.

- **Direct visits to sub-routes work via `build/404.html`** — the `postbuild` script copies `index.html` to `404.html`, so GitHub Pages serves the React app for unknown paths (with HTTP status 404).

- **`public/css/style.css` uses CRLF line endings** — preserve them when editing with scripts, or the whole file shows as changed.

- **`Team` data has placeholder names** (John Doe, etc.) — the section is rendered but the names/photos have not been updated with real data.

## Docs

Read only the docs relevant to your task:

- [`docs/overview.md`](docs/overview.md) — service purpose and external dependency table
- [`docs/architecture.md`](docs/architecture.md) — component diagram and key flows
- [`docs/development.md`](docs/development.md) — prerequisites, local dev, deploy pipeline
- [`docs/emailjs.md`](docs/emailjs.md) — contact form / EmailJS integration details
- [`docs/tracking.md`](docs/tracking.md) — GA4, Google Ads, Meta Pixel IDs, events, lead source, account settings and verification
