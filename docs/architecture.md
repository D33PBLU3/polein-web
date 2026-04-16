# Architecture

## Component Diagram

```
App.jsx
├── Router (BrowserRouter)
│   ├── Route "/"
│   │   ├── <Navigation />          ← fixed navbar, route-aware anchor hrefs
│   │   ├── <Header />              ← hero with full-bleed background image
│   │   ├── <Features />            ← 4 icon cards (data.Features[])
│   │   ├── <About />               ← description + two bullet lists (Why/Why2)
│   │   ├── <Services />            ← 6 service tiles (data.Services[])
│   │   ├── <Gallery />             ← grid of <Image /> components (data.Gallery[])
│   │   │   └── <Image />           ← individual portfolio item with lightbox link
│   │   ├── <Testimonials />        ← client quotes (data.Testimonials[])
│   │   └── <Contact />             ← EmailJS form + contact info + social links + footer
│   └── Route "/terms-and-conditions"
│       └── <TermsAndConditions />  ← standalone legal page, no nav
```

## Data Flow

```
src/data/data.json
       │
       ▼ (imported + loaded into useState via useEffect on mount)
    App.jsx  landingPageData
       │
       ├─ data={landingPageData.Header}       → <Header>
       ├─ data={landingPageData.Features}     → <Features>
       ├─ data={landingPageData.About}        → <About>
       ├─ data={landingPageData.Services}     → <Services>
       ├─ data={landingPageData.Gallery}      → <Gallery>
       ├─ data={landingPageData.Testimonials} → <Testimonials>
       └─ data={landingPageData.Contact}      → <Contact>
```

Components guard against `undefined` with `props.data ? props.data.field : "loading"` because the JSON is set asynchronously via `useEffect` (even though it's a local import — this is a legacy pattern from when it was fetched).

## Key Request Flows

**Contact form submission:**
1. User fills name / phone / email / message and clicks "Enviar Mensaje"
2. `contact.jsx` calls `emailjs.sendForm("service_polein", "template_tz9ijtt", formElement, publicKey)`
3. EmailJS API sends email to poleinman@gmail.com using the template
4. On success: Spanish confirmation message shown in orange; form fields cleared
5. On failure: Spanish error message shown

**Anchor navigation (cross-page):**
1. User on `/terms-and-conditions` clicks a nav link (e.g. "SERVICIOS")
2. `navigation.jsx` emits `href="/#services"` (not `#services`) because `isRootPage === false`
3. Browser navigates to `/`, React Router renders the home page, browser scrolls to `#services`
4. `smooth-scroll` library handles animation via its selector `a[href*="#"]` initialized in `App.jsx`

## Architecture Decisions

- **Static JSON as CMS:** `data.json` is the single source of truth for all content. There is no backend, CMS, or database — content changes require a code commit and redeploy.
- **Bootstrap 3 (not 4/5):** The project was scaffolded from a Bootstrap 3 landing page template (`@Issaafalkattan`). jQuery is present solely for Bootstrap's navbar collapse JS.
- **No TypeScript:** Plain JavaScript throughout. No prop-types library either.
- **No global state management:** `App.jsx` holds the single state object `landingPageData` and passes slices down as props. No Redux, Context, or Zustand.
