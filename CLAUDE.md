# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing landing page for Polein, a gym equipment maintenance/repair service in Guadalajara, Mexico — React 17 + CRA, deployed to GitHub Pages at polein.com.mx.

## Commands

```bash
yarn install           # install deps
yarn start             # dev server on localhost:3000
npm run build          # production build → build/
npm test               # run test suite (react-scripts test)
npm run deploy         # build + write CNAME + push to gh-pages branch
```

## Non-obvious conventions

- **All page content lives in `src/data/data.json`** — text, images, contact info, social URLs. Components receive this as props from `App.jsx`. Never hardcode display text in components.

- **Social media keys are mismatched:** `Contact.youtube` holds the WhatsApp `wa.me` link; `Contact.twitter` holds the Instagram URL. The keys are legacy and the icon rendering in `contact.jsx` reflects the actual service, not the key name. Do not rename the keys without updating both files.

- **Route-aware anchor links:** `navigation.jsx` checks `location.pathname === '/'` to decide between `#section` (same-page) and `/#section` (cross-page) hrefs. Any new nav link must follow this pattern.

- **Bootstrap via local file, not CDN:** Bootstrap CSS/JS and Font Awesome are served from `public/css/` and `public/fonts/` (copied into the repo), not from a CDN. jQuery 1.11.1 is in `public/js/` but only used by Bootstrap's JS collapse — React handles all interactivity.

- **EmailJS credentials are in source:** Service ID, template ID, and public key are hardcoded in `src/components/contact.jsx`. There is no `.env` file. See `docs/emailjs.md` before modifying the contact form.

- **`Header.title` and `Header.paragraph` are intentionally empty** in `data.json` — the intro section uses a full-bleed background image (`public/img/polein-intro3.jpg`) and no text overlay.

- **`Team` data has placeholder names** (John Doe, etc.) — the section is rendered but the names/photos have not been updated with real data.

## Docs

Read only the docs relevant to your task:

- [`docs/overview.md`](docs/overview.md) — service purpose and external dependency table
- [`docs/architecture.md`](docs/architecture.md) — component diagram and key flows
- [`docs/development.md`](docs/development.md) — prerequisites, local dev, deploy pipeline
- [`docs/emailjs.md`](docs/emailjs.md) — contact form / EmailJS integration details
