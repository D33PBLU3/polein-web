# Overview

**Polein** is a gym equipment maintenance and repair company based in Guadalajara, Jalisco, México (C.P. 45134). This repository is their public marketing website — a single-page React application providing service information, a photo gallery, testimonials, and a contact form.

**Live URL:** https://www.polein.com.mx  
**Hosting:** GitHub Pages (gh-pages branch), custom domain via `CNAME`  
**Contact:** poleinman@gmail.com / WhatsApp 33 251 171 82

## External Dependencies

| Dependency | Purpose | Where configured |
|---|---|---|
| EmailJS (`emailjs-com` ^2.6.4) | Contact form email delivery | `src/components/contact.jsx` — service `service_polein`, template `template_tz9ijtt` |
| GitHub Pages (`gh-pages` ^6.1.1) | Static site deployment | `npm run deploy` in `package.json` |
| Google Fonts (CDN) | Open Sans, Lato, Raleway typefaces | `public/index.html` `<link>` tags |
| Bootstrap 3 (local copy) | Responsive grid + navbar collapse | `public/css/bootstrap.css`, `public/js/bootstrap.js` |
| Font Awesome 4 (local copy) | Icons throughout the page | `public/fonts/font-awesome/` |
| jQuery 1.11.1 (local copy) | Bootstrap JS navbar collapse only | `public/js/jquery.1.11.1.js` |
| Nivo Lightbox (local copy) | Gallery image lightbox overlay | `public/css/nivo-lightbox/`, `public/js/` |
| smooth-scroll (^16.1.3) | Animated anchor scroll on navbar clicks | `src/App.jsx` — targets `a[href*="#"]` |

## Social / Contact Channels

| Channel | URL |
|---|---|
| WhatsApp | https://wa.me/3325117182 (stored under `Contact.youtube` key in data.json) |
| Facebook | https://www.facebook.com/profile.php?id=61562725871176 |
| Instagram | stored under `Contact.twitter` key in data.json (URL not yet updated from placeholder) |
