#!/usr/bin/env node
// Drafts Facebook + Instagram posts from blog articles with Claude (phase 1 of
// docs/social-automation-plan.md). Nothing is published here: drafts go to
// social/queue.json with status "draft", for a person to review.
//
// One Claude call per article returns both networks + carousel slide text as
// JSON. The system prompt (social/prompt/system.md + contact info) never
// changes between calls, so it is prompt-cached.
//
// Usage:
//   node scripts/social/draft.js [options]
//     --slug <slug>       draft this article (repeatable); default: next unposted ones
//     --limit <n>         how many articles when no --slug is given (default 1)
//     --model <id>        claude-opus-5-5 (default) | claude-sonnet-5-5 | claude-haiku-5-5
//     --effort <level>    low | medium (default) | high
//     --dry-run           print the drafts, don't write social/queue.json
//     --print-prompt      print the prompts and exit, without calling Claude
//     --force             draft even if the article is already queued/published
//
// Needs ANTHROPIC_API_KEY (environment variable, or a git-ignored .env file in
// the repo root with ANTHROPIC_API_KEY=...).

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const SITE = "https://polein.com.mx";
const QUEUE = path.join(ROOT, "social/queue.json");
const PUBLISHED = path.join(ROOT, "social/published.json");

// $ per 1M tokens: input, output, cache read. Cache writes cost 1.25x input.
const PRICES = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.1 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01 },
};
// Claude Haiku 5.5 has no server-side refusal fallback.
const SUPPORTS_FALLBACK = new Set(["claude-opus-5-5", "claude-sonnet-5-5"]);

// ---------- args ----------

function parseArgs(argv) {
  const opts = { slugs: [], limit: 1, model: "claude-opus-5-5", effort: "medium" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) fail(`${a} needs a value`);
      return argv[++i];
    };
    if (a === "--slug") opts.slugs.push(next());
    else if (a === "--limit") opts.limit = parseInt(next(), 10);
    else if (a === "--model") opts.model = next();
    else if (a === "--effort") opts.effort = next();
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--print-prompt") opts.printPrompt = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--help" || a === "-h") {
      console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 22).join("\n"));
      process.exit(0);
    } else fail(`Unknown option: ${a}`);
  }
  if (!PRICES[opts.model]) fail(`Unknown model ${opts.model}. Use one of: ${Object.keys(PRICES).join(", ")}`);
  if (!["low", "medium", "high"].includes(opts.effort)) fail("--effort must be low, medium or high");
  if (!(opts.limit > 0)) fail("--limit must be a positive number");
  return opts;
}

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// ---------- sources ----------

const readJson = (p, fallback) =>
  fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : fallback;

// Article HTML fragment → plain text. Plain text is ~25% fewer tokens than
// HTML, and keeps the structure Claude needs (headings, list items).
function htmlToText(html) {
  return html
    .replace(/<h[1-6][^>]*>/gi, "\n\n## ")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|ul|ol|div|table|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(td|th)[^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n\n(?=- )/g, "\n")
    .trim();
}

function articleUrl(slug) {
  return `${SITE}/blog/${slug}/`;
}

function contactBlock(contact) {
  const waNumber = (contact.youtube || "").replace(/\D/g, ""); // legacy key: holds the wa.me link
  const local = waNumber.replace(/^52/, "");
  const pretty = local.length === 10 ? `${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}` : contact.phone;
  return [
    `- WhatsApp y teléfono: ${pretty}`,
    `- Sitio web: polein.com.mx`,
    `- Horario: ${contact.hours}`,
    `- Zona: Guadalajara, Zapopan y área metropolitana (Jalisco)`,
  ].join("\n");
}

function buildSystemPrompt() {
  const data = readJson(path.join(ROOT, "src/data/data.json"));
  const template = fs.readFileSync(path.join(ROOT, "social/prompt/system.md"), "utf8");
  return template.replace("{{CONTACT}}", contactBlock(data.Contact));
}

function buildUserPrompt(post) {
  const body = fs.readFileSync(path.join(ROOT, "src/blog/posts", `${post.slug}.html`), "utf8");
  const faq = (post.faq || []).map((f) => `- P: ${f.q}\n  R: ${f.a}`).join("\n");
  return [
    "Fuente: artículo del blog de Polein.",
    "",
    `Título: ${post.title}`,
    `Categoría: ${post.category}`,
    `Resumen: ${post.excerpt || post.description}`,
    "",
    "Artículo:",
    htmlToText(body),
    faq ? `\nPreguntas frecuentes del artículo:\n${faq}` : "",
  ].join("\n");
}

// ---------- output schema ----------

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["hook", "facebook", "instagram", "group", "slides", "review_notes"],
  properties: {
    hook: { type: "string" },
    facebook: {
      type: "object",
      additionalProperties: false,
      required: ["message"],
      properties: { message: { type: "string" } },
    },
    instagram: {
      type: "object",
      additionalProperties: false,
      required: ["caption", "hashtags"],
      properties: {
        caption: { type: "string" },
        hashtags: { type: "array", items: { type: "string" } },
      },
    },
    group: {
      type: "object",
      additionalProperties: false,
      required: ["message"],
      properties: { message: { type: "string" } },
    },
    slides: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "body"],
        properties: { title: { type: "string" }, body: { type: "string" } },
      },
    },
    review_notes: { type: "string" },
  },
};

// ---------- Claude ----------

async function draftPost(client, opts, system, post) {
  const params = {
    model: opts.model,
    max_tokens: 8000,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    output_config: { effort: opts.effort, format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: buildUserPrompt(post) }],
  };
  if (SUPPORTS_FALLBACK.has(opts.model)) {
    // If a safety classifier declines, Anthropic re-runs the request on its
    // recommended fallback model instead of returning a refusal.
    params.betas = ["server-side-fallback-2026-07-01"];
    params.fallbacks = "default";
  }

  const response = await client.beta.messages.create(params);

  if (response.stop_reason === "refusal") {
    const why = response.stop_details ? ` (${response.stop_details.category || "sin categoría"})` : "";
    throw new Error(`Claude declined to draft this article${why}`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Response hit max_tokens before finishing; try --effort low");
  }
  const text = response.content.find((b) => b.type === "text");
  if (!text) throw new Error(`No text in response (stop_reason: ${response.stop_reason})`);

  return { result: JSON.parse(text.text), usage: response.usage, servedBy: response.model };
}

// ---------- post-processing ----------

function finalize(post, result, opts, usage, servedBy) {
  const date = new Date().toISOString().slice(0, 10);
  // UTM tags so GA4 shows which visits came from Facebook posts.
  const link = `${articleUrl(post.slug)}?utm_source=facebook&utm_medium=social&utm_campaign=${post.slug}`;
  const groupLink = `${articleUrl(post.slug)}?utm_source=facebook-grupos&utm_medium=social&utm_campaign=${post.slug}`;
  const hashtags = [...new Set(result.instagram.hashtags.map((h) => h.replace(/^#/, "").trim().toLowerCase()))].filter(Boolean);

  const item = {
    id: `${date}-${post.slug}`,
    status: "draft",
    source: { type: "blog", slug: post.slug, url: articleUrl(post.slug) },
    createdAt: new Date().toISOString(),
    model: servedBy || opts.model,
    effort: opts.effort,
    scheduledAt: null,
    hook: result.hook,
    facebook: { message: result.facebook.message.replace(/\{URL\}/g, link), link },
    instagram: { caption: result.instagram.caption, hashtags },
    // Shared by hand in Facebook groups (the Groups API no longer exists).
    group: { message: result.group.message.replace(/\{URL\}/g, groupLink), link: groupLink },
    slides: result.slides,
    reviewNotes: result.review_notes,
    warnings: [],
    usage: {
      input: usage.input_tokens,
      cacheWrite: usage.cache_creation_input_tokens || 0,
      cacheRead: usage.cache_read_input_tokens || 0,
      output: usage.output_tokens,
    },
  };
  item.warnings = checkDraft(item);
  return item;
}

// Cheap automatic checks. They don't replace the human review, they point at
// things to look at.
function checkDraft(item) {
  const w = [];
  const words = (s) => s.split(/\s+/).filter(Boolean).length;
  const fb = item.facebook.message;
  const ig = item.instagram.caption;
  const all = [fb, ig, ...item.slides.map((s) => `${s.title} ${s.body}`)].join("\n");

  if (!fb.includes(item.source.url)) w.push("Facebook: the article link is missing");
  if (/https?:\/\/|www\.|\.com/i.test(ig)) w.push("Instagram: caption contains a URL (not clickable there)");
  if (/\$\s?\d|\bMXN\b|\bpesos\b|\bprecio/i.test(all)) w.push("Mentions a price or money");
  if (/descuento|promoci[oó]n|gratis|% de/i.test(all)) w.push("Mentions a discount/promotion — confirm it's real");
  if (!/2511\s?7182|25117182/.test(fb)) w.push("Facebook: WhatsApp number missing");
  if (!/2511\s?7182|25117182/.test(ig)) w.push("Instagram: WhatsApp number missing");
  if (item.group) {
    if (!item.group.message.includes(item.source.url)) w.push("Group version: the article link is missing");
    if (/#\w/.test(item.group.message)) w.push("Group version has hashtags (looks like an ad in groups)");
    if (words(item.group.message) > 150) w.push(`Group version is long (${words(item.group.message)} words)`);
  }
  if (item.slides.length < 5 || item.slides.length > 7) w.push(`Carousel has ${item.slides.length} slides (expected 5–7)`);
  if (item.instagram.hashtags.length > 15) w.push(`${item.instagram.hashtags.length} hashtags (max 15)`);
  if (words(fb) > 220) w.push(`Facebook text is long (${words(fb)} words)`);
  if (words(ig) > 180) w.push(`Instagram caption is long (${words(ig)} words)`);
  return w;
}

function cost(model, u) {
  const p = PRICES[model] || PRICES["claude-opus-5-5"];
  return (u.input * p.input + u.cacheWrite * p.input * 1.25 + u.cacheRead * p.cacheRead + u.output * p.output) / 1e6;
}

function printDraft(item) {
  const line = "─".repeat(70);
  console.log(`\n${line}\n${item.id}  [${item.model}, effort ${item.effort}]\n${line}`);
  console.log(`Idea: ${item.hook}\n`);
  console.log("FACEBOOK\n" + item.facebook.message + "\n");
  console.log("INSTAGRAM\n" + item.instagram.caption);
  console.log("\n" + item.instagram.hashtags.map((h) => `#${h}`).join(" ") + "\n");
  if (item.group) console.log("GRUPOS DE FACEBOOK (compartir a mano)\n" + item.group.message + "\n");
  console.log("CARRUSEL");
  item.slides.forEach((s, i) => console.log(`  ${i + 1}. ${s.title}\n     ${s.body}`));
  if (item.reviewNotes) console.log(`\nNotas para revisar: ${item.reviewNotes}`);
  if (item.warnings.length) console.log(`\n⚠ ${item.warnings.join("\n⚠ ")}`);
  const u = item.usage;
  console.log(
    `\nTokens: ${u.input} in + ${u.cacheWrite} cache write + ${u.cacheRead} cache read, ${u.output} out` +
      ` ≈ $${cost(item.model, u).toFixed(4)}`
  );
}

// ---------- main ----------

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const envFile = path.join(ROOT, ".env");
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

  const posts = readJson(path.join(ROOT, "src/blog/posts.json"));
  const queue = readJson(QUEUE, []);
  const published = readJson(PUBLISHED, []);
  const done = new Set(
    [...queue, ...published].filter((x) => x.source && x.source.type === "blog").map((x) => x.source.slug)
  );

  let selected;
  if (opts.slugs.length) {
    selected = opts.slugs.map((s) => posts.find((p) => p.slug === s) || fail(`No article with slug "${s}"`));
    const already = selected.filter((p) => done.has(p.slug));
    if (already.length && !opts.force && !opts.dryRun && !opts.printPrompt) {
      fail(`Already queued or published: ${already.map((p) => p.slug).join(", ")} (use --force to draft again)`);
    }
  } else {
    // Featured articles first, then the order of posts.json.
    const ordered = [...posts.filter((p) => p.featured), ...posts.filter((p) => !p.featured)];
    selected = ordered.filter((p) => opts.force || !done.has(p.slug)).slice(0, opts.limit);
    if (!selected.length) {
      console.log("Every article is already queued or published. Nothing to draft.");
      return;
    }
  }

  const system = buildSystemPrompt();

  if (opts.printPrompt) {
    console.log("=== SYSTEM ===\n" + system);
    for (const p of selected) console.log(`\n=== USER (${p.slug}) ===\n` + buildUserPrompt(p));
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    fail("ANTHROPIC_API_KEY is not set. Put it in a .env file in the repo root (it's git-ignored).");
  }

  const AnthropicModule = require("@anthropic-ai/sdk");
  const Anthropic = AnthropicModule.default || AnthropicModule;
  const client = new Anthropic();

  // Sequential on purpose: the first call writes the prompt cache, the rest read it.
  const drafts = [];
  let failed = 0;
  for (const post of selected) {
    process.stdout.write(`Drafting ${post.slug}… `);
    try {
      const { result, usage, servedBy } = await draftPost(client, opts, system, post);
      const item = finalize(post, result, opts, usage, servedBy);
      console.log("ok");
      printDraft(item);
      drafts.push(item);
    } catch (err) {
      failed++;
      console.log("failed");
      if (err instanceof Anthropic.AuthenticationError) fail("The API key was rejected. Check ANTHROPIC_API_KEY.");
      if (err instanceof Anthropic.RateLimitError) console.error("  Rate limited — try again in a minute.");
      else console.error(`  ${err.message}`);
    }
  }

  if (drafts.length) {
    const total = drafts.reduce((s, d) => s + cost(d.model, d.usage), 0);
    console.log(`\n${drafts.length} draft(s), ≈ $${total.toFixed(4)} total.`);
    if (opts.dryRun) {
      console.log("Dry run: social/queue.json was not changed.");
    } else {
      const ids = new Set(drafts.map((d) => d.id));
      const next = [...queue.filter((q) => !ids.has(q.id)), ...drafts];
      fs.mkdirSync(path.dirname(QUEUE), { recursive: true });
      fs.writeFileSync(QUEUE, JSON.stringify(next, null, 2) + "\n");
      console.log(`Saved to social/queue.json (status "draft").`);
    }
  }
  if (failed) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { htmlToText, buildUserPrompt, buildSystemPrompt, finalize, checkDraft, cost };
