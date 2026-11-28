#!/usr/bin/env node
// Renders a queued post's carousel as 1080×1350 JPEGs (phase 2 of
// docs/social-automation-plan.md): cover, one image per tip, an optional
// before/after photo pair, and a closing slide with the WhatsApp number.
//
// Output: public/social/<post-id>/01.jpg, 02.jpg, … (deployed with the site, so
// Instagram can fetch them from https://polein.com.mx/social/<post-id>/NN.jpg).
// Also stores the image paths on the queue item (item.images).
//
// Usage: node scripts/social/render.js <post-id> [--chrome]
//   Uses the system Google Chrome locally (no browser download). In CI, install
//   Chromium with `npx playwright-core install chromium` and it's used instead.
//
// Slide design: social/templates/carousel.css. Text comes from item.slides; the
// first slide is the cover, the last one is the closing slide. Optional
// item.beforeAfter = { before, after, title } (paths relative to the repo)
// inserts a photo slide before the closing slide, and the "after" photo becomes
// the cover background.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "../..");
const QUEUE = path.join(ROOT, "social/queue.json");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Text for a slide: escaped, and hyphenated words ("WD-40") never split across lines.
const txt = (s) => esc(s).replace(/(\S+-\S+)/g, '<span class="nw">$1</span>');
const fileUrl = (rel) => pathToFileURL(path.join(ROOT, rel)).href;

function whatsappNumber() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/data.json"), "utf8"));
  const local = (data.Contact.youtube || "").replace(/\D/g, "").replace(/^52/, ""); // legacy key = wa.me link
  return local.length === 10 ? `${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}` : data.Contact.phone;
}

function slidesHtml(item, category) {
  const tips = item.slides.slice(1, -1);
  const cover = item.slides[0];
  const close = item.slides[item.slides.length - 1];
  const total = item.slides.length + (item.beforeAfter ? 1 : 0);
  const logo = fileUrl("social/templates/logo-white.png");
  const foot = (n, extra = "") =>
    `<div class="foot"><img src="${logo}" alt="Polein" />${extra || `<span class="count">${n} / ${total}</span>`}</div>`;

  const out = [];
  const bg = item.beforeAfter ? ` style="background-image: url('${fileUrl(item.beforeAfter.after)}')"` : "";
  out.push(`<section class="slide cover${bg ? " photo" : ""}"${bg}>
  <div class="kicker">Guía · ${esc(category)}</div>
  <h1>${txt(cover.title)}</h1>
  <p>${txt(cover.body)}</p>
  ${foot(1, '<span class="swipe">Deslice →</span>')}
</section>`);

  tips.forEach((t, i) => {
    out.push(`<section class="slide tip">
  <div class="num">${String(i + 1).padStart(2, "0")}</div>
  <h2>${txt(t.title)}</h2>
  <p>${txt(t.body)}</p>
  ${foot(i + 2)}
</section>`);
  });

  if (item.beforeAfter) {
    const ba = item.beforeAfter;
    out.push(`<section class="slide ba">
  <h2>${esc(ba.title || "Así queda después del servicio")}</h2>
  <div class="pair">
    <figure><img src="${fileUrl(ba.before)}" alt="" /><span>ANTES</span></figure>
    <figure class="after"><img src="${fileUrl(ba.after)}" alt="" /><span>DESPUÉS</span></figure>
  </div>
  ${foot(total - 1)}
</section>`);
  }

  out.push(`<section class="slide close">
  <h2>${txt(close.title)}</h2>
  <p>${txt(close.body)}</p>
  <div class="wa"><i class="fa fa-whatsapp"></i> ${esc(whatsappNumber())}</div>
  <div class="site">polein.com.mx</div>
  ${foot(total)}
</section>`);
  return out;
}

function page(section) {
  return `<!DOCTYPE html><html lang="es-MX"><head><meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700|Raleway:700,800&display=block" rel="stylesheet" />
<link rel="stylesheet" href="${fileUrl("public/fonts/font-awesome/css/font-awesome.css")}" />
<link rel="stylesheet" href="${fileUrl("social/templates/carousel.css")}" />
</head><body>${section}</body></html>`;
}

async function launch() {
  const { chromium } = require("playwright-core");
  try {
    return await chromium.launch(); // Chromium installed by playwright-core (CI)
  } catch {
    return chromium.launch({ channel: "chrome" }); // system Google Chrome (local)
  }
}

async function main() {
  const id = process.argv[2];
  if (!id || id.startsWith("-")) {
    console.error("Usage: node scripts/social/render.js <post-id>");
    process.exit(1);
  }
  const queue = JSON.parse(fs.readFileSync(QUEUE, "utf8"));
  const item = queue.find((q) => q.id === id);
  if (!item) throw new Error(`No post "${id}" in social/queue.json`);
  if (!item.slides || item.slides.length < 3) throw new Error("A carousel needs at least 3 slides (cover, tip, closing)");
  if (item.beforeAfter) {
    for (const p of [item.beforeAfter.before, item.beforeAfter.after]) {
      if (!fs.existsSync(path.join(ROOT, p))) throw new Error(`Missing photo ${p}`);
    }
  }

  const posts = JSON.parse(fs.readFileSync(path.join(ROOT, "src/blog/posts.json"), "utf8"));
  const post = item.source && item.source.type === "blog" ? posts.find((p) => p.slug === item.source.slug) : null;
  const sections = slidesHtml(item, (post && post.category) || "Polein");

  const outDir = path.join(ROOT, "public/social", id);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "polein-render-"));

  const browser = await launch();
  const images = [];
  try {
    const pg = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    for (let i = 0; i < sections.length; i++) {
      const html = path.join(tmp, `${i}.html`);
      fs.writeFileSync(html, page(sections[i]));
      await pg.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
      await pg.evaluate(() => document.fonts.ready);
      // Text must fit: flag any slide whose content overflows the footer.
      const overflow = await pg.evaluate(() => {
        const s = document.querySelector(".slide");
        const foot = s.querySelector(".foot").getBoundingClientRect().top;
        const last = [...s.children].filter((c) => !c.classList.contains("foot")).pop();
        return last.getBoundingClientRect().bottom > foot - 20;
      });
      if (overflow) console.warn(`⚠️  Slide ${i + 1}: text runs into the footer, shorten it`);
      const name = `${String(i + 1).padStart(2, "0")}.jpg`;
      await pg.screenshot({ path: path.join(outDir, name), type: "jpeg", quality: 88 });
      images.push(`/social/${id}/${name}`);
    }
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  item.images = images;
  fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + "\n");
  const kb = images.map((p) => Math.round(fs.statSync(path.join(ROOT, "public", p)).size / 1024));
  console.log(`Rendered ${images.length} slides → public/social/${id}/ (${kb.join(", ")} KB)`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
