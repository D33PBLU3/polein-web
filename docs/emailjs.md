# EmailJS Integration

The contact form at `#contact` sends email via the EmailJS client-side SDK without any backend.

## Configuration (src/components/contact.jsx:33-38)

| Parameter | Value |
|---|---|
| Service ID | `service_polein` |
| Template ID | `template_tz9ijtt` |
| Public Key | `Gb2jANzOJTCSPTPSj` |
| Recipient | poleinman@gmail.com (configured in the EmailJS dashboard template) |

## Form fields sent to EmailJS

`contact.jsx` calls `emailjs.send()` with these template params:

| HTML `name` | Template variable | Type |
|---|---|---|
| `name` | `{{name}}` | text |
| `phone` | `{{phone}}` | tel |
| `email` | `{{email}}` | email (**optional**, may be empty) |
| `service_type` | `{{service_type}}` | select (optional; options = `Services[].name` + "Otro") |
| `equipment` | `{{equipment}}` | text (optional, brand/model) |
| `lead_source` | `{{lead_source}}` | select (optional; "¿Cómo nos conociste?", options = `Labels.contact.fields.leadSourceOptions`) |
| — | `{{visit_source}}` | not a field: the first way this browser reached the site (Google Ads click, Google search, Facebook…), detected in `src/utils/analytics.js` (`getVisitSource`) and kept in localStorage |
| `message` | `{{message}}` | textarea — service type, equipment, lead source and visit source are **prepended** to it, so they reach the inbox even if the template doesn't use those variables |

If the template sets Reply-To to `{{email}}`, it will be empty for visitors who skip the email field — reply by phone/WhatsApp in that case.

## UX behavior

- On success: `Labels.contact.success` is shown (orange bold text above the button) and fields reset; a `generate_lead` analytics event fires
- On failure: `Labels.contact.error` is shown. All form text lives in `Labels.contact` in `data.json`
- The confirmation message is never auto-dismissed; it persists until the user reloads

## Changing the template or service

1. Log in to the EmailJS dashboard (account associated with poleinman@gmail.com)
2. Update the Service, Template, or Public Key there
3. Update the corresponding hardcoded values in `src/components/contact.jsx:33-38`
4. Commit and push to `main` (GitHub Actions deploys)

## Domain whitelisting

EmailJS requires the sending domain to be whitelisted in the dashboard under **Account → Security**. The current allowed origin is `www.polein.com.mx`. If testing locally with `yarn start`, you may need to temporarily add `localhost:3000`.
