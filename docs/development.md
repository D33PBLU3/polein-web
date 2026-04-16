# Development

## Prerequisites

- Node.js (CRA 5 requires Node ≥14; tested on LTS)
- Yarn or npm
- A GitHub account with write access to the repo (for deploy)

## No environment variables required

There is no `.env` file. The only external credentials are EmailJS keys hardcoded in `src/components/contact.jsx:33-38`:
- Service ID: `service_polein`
- Template ID: `template_tz9ijtt`
- Public Key: `Gb2jANzOJTCSPTPSj`

These are intentionally public (EmailJS public keys are client-side safe), but the domain must be whitelisted in the EmailJS dashboard for the form to work.

## Running locally

```bash
yarn install
yarn start         # http://localhost:3000
```

The dev server proxies to `/` so React Router works normally. There is no backend to start.

## Building

```bash
npm run build      # outputs to build/
```

CRA builds a static bundle. The `homepage` field in `package.json` is set to `https://www.polein.com.mx`, which tells CRA to use absolute asset paths — do not remove this or the gh-pages deploy will have broken asset URLs.

## Deploy pipeline

```bash
npm run deploy
# equivalent to:
#   npm run build
#   echo "polein.com.mx" > build/CNAME
#   gh-pages -d build
```

`gh-pages` pushes the `build/` folder to the `gh-pages` branch. GitHub Pages serves it at polein.com.mx. The CNAME file is regenerated on every deploy (not committed to `main`).

There is no CI. Deploys are manual from a local machine.

## Testing

```bash
npm test           # interactive watch mode
npm test -- --watchAll=false   # single run (e.g. in CI)
```

Test files live next to source files (CRA convention). Currently only `src/App.test.js` exists with a default smoke test. No component-level tests are written.

## Adding a new section

1. Add data to `src/data/data.json` under a new top-level key
2. Create `src/components/mysection.jsx` following the same props pattern
3. Import and add `<MySection data={landingPageData.MySection} />` in `App.jsx`
4. Add a `#mysection` anchor link in `navigation.jsx` with the `isRootPage` conditional
5. Add CSS for `#mysection` in `public/css/style.css`
