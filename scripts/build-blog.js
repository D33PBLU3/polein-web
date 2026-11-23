#!/usr/bin/env node
// Generates the static, indexable blog pages and the sitemap.
//
// The React app is a single-page app: on GitHub Pages every sub-route is
// served through 404.html with HTTP 404, so Google won't index it. Blog
// articles therefore are plain HTML files written to build/blog/<slug>/index.html,
// which GitHub Pages serves with HTTP 200.
//
// Sources (single source of truth, also read by the React home teaser):
//   src/blog/posts.json        metadata per article (title, description, FAQ...)
//   src/blog/posts/<slug>.html article body (HTML fragment, no <h1>)
//   src/blog/blog.json         blog UI strings
//   src/data/data.json         contact info (phone, WhatsApp, address)
//   src/config/tracking.js     GA4 / Google Ads / Meta Pixel IDs
//
// Usage: node scripts/build-blog.js [outDir]   (default: build) — runs in postbuild.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.resolve(ROOT, process.argv[2] || "build");
const SITE = "https://polein.com.mx";

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const posts = readJson("src/blog/posts.json");
const blog = readJson("src/blog/blog.json");
const data = readJson("src/data/data.json");
const L = blog.labels;
const contact = data.Contact;
const footer = (data.Labels && data.Labels.footer) || {};

// tracking.js is an ES module with one object literal; evaluate just that object.
const trackingSrc = fs.readFileSync(path.join(ROOT, "src/config/tracking.js"), "utf8");
const TRACKING = new Function(
  trackingSrc.replace(/export\s+const\s+TRACKING\s*=/, "return ")
)();

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
};

const postUrl = (p) => `${SITE}/blog/${p.slug}/`;
const telHref = `tel:+52${contact.phone.replace(/\D/g, "")}`;
const waLink = (title) => {
  const msg = L.agendaMessage.replace("{title}", title);
  const sep = contact.youtube.includes("?") ? "&" : "?";
  return `${contact.youtube}${sep}text=${encodeURIComponent(msg)}`;
};

// Same behaviour as src/utils/analytics.js: GA4 + Google Ads + Meta Pixel,
// auto-tracking every wa.me / tel: click, and the first-visit source.
const trackingScript = () => `<script>
(function(){
var T=${JSON.stringify(TRACKING)};
var META={whatsapp_click:"Contact",call_click:"Contact",generate_lead:"Lead"};
function load(src){var s=document.createElement("script");s.async=true;s.src=src;document.head.appendChild(s);}
var first=T.GA4_ID||T.GOOGLE_ADS_ID;
if(first){window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag("js",new Date());
if(T.GA4_ID)gtag("config",T.GA4_ID);if(T.GOOGLE_ADS_ID)gtag("config",T.GOOGLE_ADS_ID);
load("https://www.googletagmanager.com/gtag/js?id="+first);}
if(T.META_PIXEL_ID&&!window.fbq){var f=window.fbq=window._fbq=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments);};
f.push=f;f.loaded=true;f.version="2.0";f.queue=[];load("https://connect.facebook.net/en_US/fbevents.js");f("init",T.META_PIXEL_ID);f("track","PageView");}
function track(name,params){
if(window.gtag){if(T.GA4_ID)gtag("event",name,params);var l=T.GOOGLE_ADS_LABELS[name];
if(T.GOOGLE_ADS_ID&&l)gtag("event","conversion",{send_to:T.GOOGLE_ADS_ID+"/"+l});}
if(window.fbq&&META[name])fbq("track",META[name],params);}
function where(el){if(el.closest(".float-btns"))return"floating";var s=el.closest("[id]");return s?s.id:"unknown";}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;
var h=a.getAttribute("href")||"";var p={location:"blog:"+where(a),page:location.pathname};
if(/^https:\\/\\/(wa\\.me|api\\.whatsapp\\.com)/.test(h))track("whatsapp_click",p);else if(h.indexOf("tel:")===0)track("call_click",p);},true);
try{var K="polein_visit_source";if(!localStorage.getItem(K)){var u=new URL(location.href),q=u.searchParams,src="";
var host="";try{host=document.referrer?new URL(document.referrer).hostname.replace(/^www\\./,""):"";}catch(x){}
if(q.get("gclid")||q.get("gbraid")||q.get("wbraid"))src="Google Ads";else if(q.get("fbclid"))src="Facebook / Instagram (enlace)";
else if(q.get("utm_source"))src=q.get("utm_source")+(q.get("utm_medium")?" / "+q.get("utm_medium"):"");
else if(host&&!/polein\\.com\\.mx$/.test(host)){src=/(^|\\.)google\\./.test(host)?"Búsqueda en Google":"Sitio externo ("+host+")";}
if(src&&q.get("utm_campaign"))src+=" (campaña: "+q.get("utm_campaign")+")";
localStorage.setItem(K,(src||"Directo / desconocido")+" · blog");}}catch(x){}
})();
</script>`;

const head = ({ title, description, canonical, ogType, extraLd, image }) => `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" href="/img/logo/logo2.jpg" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:locale" content="es_MX" />
  <meta property="og:site_name" content="Polein" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
${image
    ? `  <meta property="og:image" content="${SITE}${image}" />`
    : `  <meta property="og:image" content="${SITE}/img/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />`}
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="/css/bootstrap.css" />
  <link rel="stylesheet" href="/fonts/font-awesome/css/font-awesome.css" />
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/blog.css" />
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700|Raleway:600,700,800&display=swap" rel="stylesheet" />
  ${extraLd.map(jsonLd).join("\n  ")}
  ${trackingScript()}
</head>
<body class="blog-page">`;

const nav = () => `
<nav id="menu" class="navbar navbar-default navbar-fixed-top">
  <div class="container">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#blog-navbar">
        <span class="sr-only">${esc(L.toggle)}</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="/"><img src="/img/logo/logo2.jpg" alt="Polein" class="nav-logo" /></a>
    </div>
    <div class="collapse navbar-collapse" id="blog-navbar">
      <ul class="nav navbar-nav navbar-right">
        <li><a href="/">${esc(L.home.toUpperCase())}</a></li>
        <li><a href="/#services">${esc(L.services.toUpperCase())}</a></li>
        <li><a href="/blog/">${esc(L.blog.toUpperCase())}</a></li>
        <li><a href="/#contact">${esc(L.contact.toUpperCase())}</a></li>
      </ul>
    </div>
  </div>
</nav>`;

const breadcrumbs = (items) => `
<ol class="breadcrumb blog-breadcrumb">
  ${items.map((it, i) => (i === items.length - 1
    ? `<li class="active">${esc(it.name)}</li>`
    : `<li><a href="${it.href}">${esc(it.name)}</a></li>`)).join("\n  ")}
</ol>`;

const breadcrumbLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: SITE + it.href,
  })),
});

const cta = (title) => `
<aside class="blog-cta" id="blog-cta">
  <h2>${esc(L.ctaTitle)}</h2>
  <p>${esc(L.ctaText)}</p>
  <a class="btn btn-custom btn-lg" href="${esc(waLink(title))}" target="_blank" rel="noopener noreferrer"><i class="fa fa-whatsapp"></i> ${esc(L.ctaWhatsapp)}</a>
  <a class="btn btn-blog-outline btn-lg" href="${telHref}"><i class="fa fa-phone"></i> ${esc(L.ctaCall)} ${esc(contact.phone)}</a>
</aside>`;

// Compact "Agenda tu mantenimiento" box placed mid-article (and atop the index).
const agenda = (title) => `
<aside class="blog-agenda">
  <div class="blog-agenda-icon"><i class="fa fa-calendar"></i></div>
  <div class="blog-agenda-text">
    <strong>${esc(L.inlineTitle)}</strong>
    <span>${esc(L.inlineText)}</span>
  </div>
  <a class="btn btn-blog-wa" href="${esc(waLink(title))}" target="_blank" rel="noopener noreferrer"><i class="fa fa-whatsapp"></i> ${esc(L.inlineButton)}</a>
</aside>
`;

// Before/after photo pairs: p.beforeAfter = [{ before, after, caption }].
// Photos are 600x450 (scripts/optimize-blog-photos.sh) so both halves line up.
const beforeAfter = (p) => (p.beforeAfter || []).map((ba) => `
<figure class="blog-ba">
  <div class="blog-ba-pair">
    <div class="blog-ba-item"><span class="blog-ba-label">${esc(L.before)}</span><img src="${ba.before}" alt="${esc(L.before)}: ${esc(ba.caption)}" width="600" height="450" loading="lazy" /></div>
    <div class="blog-ba-item"><span class="blog-ba-label blog-ba-after">${esc(L.after)}</span><img src="${ba.after}" alt="${esc(L.after)}: ${esc(ba.caption)}" width="600" height="450" loading="lazy" /></div>
  </div>
  <figcaption>${esc(ba.caption)}</figcaption>
</figure>`).join("");

// Insert the agenda box before the middle <h2> of the body (needs at least 2).
const withAgenda = (body, title) => {
  const idx = [];
  const re = /<h2[\s>]/g;
  let m;
  while ((m = re.exec(body))) idx.push(m.index);
  if (idx.length < 2) return body + agenda(title);
  const at = idx[Math.floor(idx.length / 2)];
  return body.slice(0, at) + agenda(title) + body.slice(at);
};

const card = (p) => `
<article class="blog-card">
  <a href="/blog/${p.slug}/">
    ${p.image
      ? `<img class="blog-card-img" src="${p.image}" alt="${esc(p.imageAlt || p.title)}" width="667" height="500" loading="lazy" />`
      : `<div class="blog-card-icon"><i class="${p.icon}"></i></div>`}
    <span class="blog-category">${esc(p.category)}</span>
    <h2>${esc(p.title)}</h2>
    <p>${esc(p.excerpt)}</p>
    <span class="blog-card-more">${esc(L.readMore)} <i class="fa fa-angle-right"></i></span>
  </a>
</article>`;

const pageEnd = (title) => `
<footer id="footer">
  <div class="container text-center">
    <p class="footer-nap"><strong>Polein</strong> · ${esc(contact.address)} · <a href="${telHref}">${esc(contact.phone)}</a> · <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
    <p class="footer-legal">© ${new Date().getFullYear()} ${esc(footer.company || "")} ${esc(footer.rights || "")} · <a href="/aviso-de-privacidad">${esc(L.privacy)}</a></p>
  </div>
</footer>
<div class="float-btns">
  <a href="${telHref}" class="float-btn float-btn-call" aria-label="${esc(L.floatCall)}"><i class="fa fa-phone"></i></a>
  <a href="${esc(waLink(title))}" target="_blank" rel="noopener noreferrer" class="float-btn float-btn-whatsapp" aria-label="${esc(L.floatWhatsapp)}"><i class="fa fa-whatsapp"></i></a>
</div>
<script src="/js/jquery.1.11.1.js"></script>
<script src="/js/bootstrap.js"></script>
</body>
</html>
`;

const publisher = {
  "@type": "Organization",
  "@id": `${SITE}/#business`,
  name: "Polein",
  logo: { "@type": "ImageObject", url: `${SITE}/img/logo/logo2.jpg` },
};

function renderPost(p) {
  const body = fs.readFileSync(path.join(ROOT, "src/blog/posts", `${p.slug}.html`), "utf8");
  const crumbs = [
    { name: L.home, href: "/" },
    { name: L.blog, href: "/blog/" },
    { name: p.title, href: `/blog/${p.slug}/` },
  ];
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      image: `${SITE}${p.image || "/img/og-image.jpg"}`,
      datePublished: p.datePublished,
      dateModified: p.dateModified,
      inLanguage: "es-MX",
      mainEntityOfPage: postUrl(p),
      author: { "@type": "Organization", name: L.author, url: `${SITE}/` },
      publisher,
      about: p.category,
    },
    breadcrumbLd(crumbs),
  ];
  if (p.faq && p.faq.length) {
    ld.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  const related = (p.related || [])
    .map((s) => posts.find((x) => x.slug === s))
    .filter(Boolean);

  return head({
    title: `${p.title} | Polein`,
    description: p.description,
    canonical: postUrl(p),
    ogType: "article",
    extraLd: ld,
    image: p.image,
  }) + nav() + `
<main class="blog-main" id="blog-article">
  <div class="container">
    <div class="row">
      <div class="col-md-8 col-md-offset-2">
        ${breadcrumbs(crumbs)}
        <article class="blog-article">
          <header>
            <span class="blog-category">${esc(p.category)}</span>
            <h1>${esc(p.title)}</h1>
            <p class="blog-meta">${esc(L.author)} · ${esc(L.updated)} ${fmtDate(p.dateModified)} · ${p.readingMinutes} ${esc(L.minutes)}</p>
          </header>
          ${p.image && !(p.beforeAfter || []).length ? `<figure class="blog-hero"><img src="${p.image}" alt="${esc(p.imageAlt || p.title)}" width="667" height="500" /></figure>` : ""}
          ${beforeAfter(p)}
          <div class="blog-body">
${withAgenda(body, p.title)}
          </div>
          ${p.faq && p.faq.length ? `
          <section class="blog-faq" id="blog-faq">
            <h2>${esc(L.faqTitle)}</h2>
            ${p.faq.map((f) => `<div class="blog-faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join("\n            ")}
          </section>` : ""}
          ${cta(p.title)}
        </article>
        ${related.length ? `
        <section class="blog-related" id="blog-related">
          <h2>${esc(L.relatedTitle)}</h2>
          <div class="blog-grid">${related.map(card).join("")}</div>
        </section>` : ""}
      </div>
    </div>
  </div>
</main>` + pageEnd(p.title);
}

function renderIndex() {
  const crumbs = [
    { name: L.home, href: "/" },
    { name: L.blog, href: "/blog/" },
  ];
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: blog.index.title,
      description: blog.index.description,
      url: `${SITE}/blog/`,
      inLanguage: "es-MX",
      publisher,
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: postUrl(p),
        datePublished: p.datePublished,
      })),
    },
    breadcrumbLd(crumbs),
  ];
  return head({
    title: blog.index.metaTitle,
    description: blog.index.description,
    canonical: `${SITE}/blog/`,
    ogType: "website",
    extraLd: ld,
  }) + nav() + `
<main class="blog-main" id="blog-index">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <header class="blog-index-header">
      <h1>${esc(blog.index.title)}</h1>
      <p>${esc(blog.index.intro)}</p>
    </header>
    <div class="row"><div class="col-md-8 col-md-offset-2">${agenda(blog.index.title)}</div></div>
    <div class="blog-grid">${posts.map(card).join("")}</div>
    <div class="row"><div class="col-md-8 col-md-offset-2">${cta(blog.index.title)}</div></div>
  </div>
</main>` + pageEnd(blog.index.title);
}

function renderSitemap() {
  const latest = posts.map((p) => p.dateModified).sort().pop();
  const urls = [
    { loc: `${SITE}/`, lastmod: latest },
    { loc: `${SITE}/blog/`, lastmod: latest },
    ...posts.map((p) => ({ loc: postUrl(p), lastmod: p.dateModified })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
}

// --- validate & write ------------------------------------------------------
const slugs = new Set();
for (const p of posts) {
  if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`Bad slug: ${p.slug}`);
  if (slugs.has(p.slug)) throw new Error(`Duplicate slug: ${p.slug}`);
  slugs.add(p.slug);
  if (p.description.length > 170) console.warn(`[blog] description >170 chars: ${p.slug}`);
  for (const ba of p.beforeAfter || []) {
    for (const img of [ba.before, ba.after]) {
      if (!img || !fs.existsSync(path.join(ROOT, "public", img))) throw new Error(`${p.slug}: missing before/after image ${img}`);
    }
    if (!ba.caption) throw new Error(`${p.slug}: before/after needs a caption`);
  }
  if (p.image && !fs.existsSync(path.join(ROOT, "public", p.image))) throw new Error(`${p.slug}: missing image ${p.image}`);
  for (const r of p.related || []) {
    if (!posts.some((x) => x.slug === r)) throw new Error(`${p.slug}: unknown related "${r}"`);
  }
}

const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

write("blog/index.html", renderIndex());
for (const p of posts) write(`blog/${p.slug}/index.html`, renderPost(p));
write("sitemap.xml", renderSitemap());
console.log(`[blog] ${posts.length} articles + index + sitemap → ${path.relative(ROOT, OUT)}/`);
