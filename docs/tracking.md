# Tracking & ads measurement

How polein.com.mx measures visits and leads, which accounts own each piece, and the rules that keep the numbers correct. Set up on 2026-11-23.

## IDs

All IDs live in `src/config/tracking.js`. An empty value means that platform never loads. These IDs are public by nature: they ship in the site's JavaScript. No passwords or tokens belong in this repo.

| Platform | ID | Where to find it |
|---|---|---|
| Google Analytics 4 | `G-JH86EDB7JY` | GA4 → Administrar → Flujos de datos |
| Google tag (container shared by GA4 and Ads) | `GT-K5M22KK6` | Google Ads → Objetivos → Configuración → Etiqueta de Google |
| Google Ads conversion ID | `AW-18120282115` | Google Ads → Objetivos → Conversiones → (acción) → Configuración de la etiqueta |
| Ads label: WhatsApp click | `uHt2COr2jL4dEIOgtsBD` | same, the part after `/` in `send_to` |
| Ads label: Call click | `sUpvCO32jL4dEIOgtsBD` | same |
| Ads label: Formulario de contacto | `UFbmCPD2jL4dEIOgtsBD` | same |
| Meta Pixel (dataset "Polein Web") | `3044279845920634` | Meta → Administrador de eventos → Orígenes de datos |

Other links in `src/data/data.json` → `Contact`:

| Key | Value |
|---|---|
| `google` | Google Business Profile share link (contact icon) |
| `googleReview` | `https://g.page/r/CREfNqvmBeD5EAE/review`: direct review form, used by the testimonials "Déjanos tu reseña en Google" button. Also use it in WhatsApp after each job. |
| `twitter` | Instagram URL (legacy key name). **Still empty**: the icon stays hidden until it's set. |

## What each action sends

`src/utils/analytics.js` has one document-level click listener, so any new `wa.me` or `tel:` link is tracked automatically.

| User action | GA4 event | Google Ads conversion | Meta event |
|---|---|---|---|
| Any page load | `page_view` (automatic) | — | `PageView` |
| Clicks a WhatsApp link (`wa.me`) | `whatsapp_click` + `location` | WhatsApp click | `Contact` |
| Clicks a phone link (`tel:`) | `call_click` + `location` | Call click | `Contact` |
| Contact form sent successfully | `generate_lead` + `location`, `lead_source` | Formulario de contacto | `Lead` |

`location` is the page section where the click happened (`header`, `contact`, `floating`…). No name, phone, email or message text is ever sent to Google or Meta.

## Lead source in the form email

Each form email (EmailJS, see `docs/emailjs.md`) includes:

- **¿Cómo nos conociste?**: the visitor's optional answer (`Labels.contact.fields.leadSourceOptions`).
- **Origen de la visita (automático)**: the first way this browser reached the site, saved in localStorage (`polein_visit_source`) on the first visit. Detected from `gclid`/`gbraid`/`wbraid` (Google Ads), `fbclid`, `utm_*` tags, or the referrer (Google search, Facebook, Instagram, other site). If nothing matches, it says "Directo / desconocido". Logic and tests: `describeSource` in `analytics.js` / `analytics.test.js`.

To tag your own links, for example the Instagram bio or a WhatsApp campaign, add UTM parameters. For example, `https://polein.com.mx/?utm_source=instagram&utm_medium=bio` shows up as "instagram / bio".

## Account settings (outside the code)

These were configured by hand in each platform. Keep them this way.

**Google Ads**
- The Google tag uses the **tag already detected on the site** (the GA4 one). Nothing extra was installed.
- 3 conversion actions, created **manually with code**, all **Primary**:
  - Contacto → "WhatsApp click"
  - Cliente potencial por teléfono → "Call click"
  - Envío de formulario → "Formulario de contacto"
- Value: **same value for each conversion, 100 MXN**. This is a placeholder, not a real price. Update it once the real lead-to-client rate is known (lead value ≈ close rate × average job value).
- Count: **Una** (one per click session).
- **Auto-tagging ON** (Administrador → Configuración de la cuenta). Required for GA4 attribution and for "Google Ads" to appear as the visit source.
- Automatic, URL-based, or click-based conversions suggested by Google: **off**. They would double-count.

**GA4**
- Linked to Google Ads (Administrar → Vínculos de Google Ads), with personalized advertising and auto-tagging enabled.
- `whatsapp_click`, `call_click` and `generate_lead` are marked as **key events**.

**Meta**
- Dataset "Polein Web", Pixel only (no Conversions API), installed through the site code. No "Configuración automática de eventos".

## Rules that keep the numbers correct

1. **Never import GA4 key events into Google Ads as Primary conversions.** The site already sends the 3 conversions directly to Ads, so an import counts every lead twice and makes Ads bid on fake numbers. If an import exists, set it to **Secundaria**.
2. **Don't add a second Google tag or the Meta base code to `public/index.html`.** `analytics.js` loads both.
3. When adding or removing a tracking tool, **update the privacy notice**: `data.Privacy` sections 4 (providers) and 5 (cookies), and `lastUpdated`.
4. A new lead type, for example a quote request button, needs:
   - a new event name in `trackEvent`
   - a matching `GOOGLE_ADS_LABELS` entry, with a new conversion action created in Ads
   - an entry in `META_EVENTS`

## How to verify it works

| Platform | Check |
|---|---|
| Google Ads | Objetivos → Conversiones: each action goes from "Inactiva" to "Registrando conversiones" within ~3 h of a real click. A conversion is only *counted* when the visitor came from an ad. |
| GA4 | Informes → Tiempo real: click WhatsApp on the site and `whatsapp_click` appears within a minute. |
| Meta | Administrador de eventos → Polein Web → Probar eventos → open the site → `PageView`, then `Contact` after clicking WhatsApp. |
| Browser | DevTools → Network: requests to `googletagmanager.com` / `google-analytics.com` and `facebook.com/tr`. Ad blockers hide these, so test without one. |

## Where to read the results

- **GA4 → Informes → Adquisición → Adquisición de tráfico**, with the key-event column: leads by channel (Google Ads, organic search, Facebook, direct).
- **Google Ads → Campañas**, "Conversiones" and "Costo/conv." columns: cost per lead.
- **Form emails**: the source lines show where each form lead came from. WhatsApp and phone leads carry no source, so ask them "¿Cómo nos conociste?" in the chat.
