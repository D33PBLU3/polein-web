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

The form element is passed directly to `emailjs.sendForm()`, so all `name` attributes on inputs map to template variables:

| HTML `name` | Template variable | Type |
|---|---|---|
| `name` | `{{name}}` | text |
| `phone` | `{{phone}}` | tel |
| `email` | `{{email}}` | email |
| `message` | `{{message}}` | textarea |

## UX behavior

- On success: `confirmationMessage` state is set to "Correo enviado, nosotros nos pondremos en contacto contigo" (orange bold text below the button); form fields reset to empty
- On failure: message set to "Hubo un error al enviar el correo. Inténtalo nuevamente."
- The confirmation message is never auto-dismissed; it persists until the user reloads

## Changing the template or service

1. Log in to the EmailJS dashboard (account associated with poleinman@gmail.com)
2. Update the Service, Template, or Public Key there
3. Update the corresponding hardcoded values in `src/components/contact.jsx:33-38`
4. Redeploy with `npm run deploy`

## Domain whitelisting

EmailJS requires the sending domain to be whitelisted in the dashboard under **Account → Security**. The current allowed origin is `www.polein.com.mx`. If testing locally with `yarn start`, you may need to temporarily add `localhost:3000`.
