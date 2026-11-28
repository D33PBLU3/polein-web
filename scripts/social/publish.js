#!/usr/bin/env node
// Publishes an approved post to the Polein Facebook Page and Instagram
// (phase 3 of docs/social-automation-plan.md).
//
//   Facebook: multi-photo post (the carousel images) + the message with the blog link.
//   Instagram: carousel (the same images) + caption, hashtags and location tag
//   (the Polein Page's address, Zapopan; META_IG_LOCATION_ID=none to turn it off).
//
// Safety:
//   - Only posts items with status "approved" in social/queue.json.
//   - Never posts the same network twice: social/published.json records every
//     post ID, and a re-run only does the network that's missing.
//   - Checks every image URL is live on polein.com.mx (HTTP 200) first; Instagram
//     downloads them from there, so the site must be deployed before publishing.
//
// Usage:
//   node scripts/social/publish.js --id <post-id> --dry-run   # show what would be posted
//   node scripts/social/publish.js --id <post-id>             # publish
//     --only facebook|instagram                               # one network only
//
// Needs META_ACCESS_TOKEN, META_PAGE_ID, META_IG_USER_ID (.env or environment).

const fs = require("fs");
const path = require("path");
const { graph, loadEnv, GraphError } = require("./meta");

const ROOT = path.resolve(__dirname, "../..");
const SITE = "https://polein.com.mx";
const QUEUE = path.join(ROOT, "social/queue.json");
const PUBLISHED = path.join(ROOT, "social/published.json");

const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : fallback);
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--id") o.id = argv[++i];
    else if (argv[i] === "--only") o.only = argv[++i];
    else if (argv[i] === "--dry-run") o.dryRun = true;
    else throw new Error(`Unknown option ${argv[i]}`);
  }
  if (!o.id) throw new Error("Usage: node scripts/social/publish.js --id <post-id> [--dry-run] [--only facebook|instagram]");
  if (o.only && !["facebook", "instagram"].includes(o.only)) throw new Error("--only must be facebook or instagram");
  return o;
}

function env(name) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`${name} is not set (.env). Run node scripts/social/meta-check.js to find it.`);
  return v;
}

const igCaption = (item) =>
  `${item.instagram.caption}\n\n${item.instagram.hashtags.map((h) => `#${h}`).join(" ")}`;

async function checkImages(urls) {
  const bad = [];
  for (const u of urls) {
    const res = await fetch(u, { method: "HEAD" }).catch(() => null);
    if (!res || res.status !== 200) bad.push(`${u} (${res ? res.status : "no response"})`);
  }
  return bad;
}

async function publishFacebook(item, urls, pageId) {
  // Posting to a Page needs the Page's own token; the system user token gets it.
  const { data: pages = [] } = await graph("/me/accounts", { fields: "id,access_token" });
  const page = pages.find((p) => p.id === pageId);
  if (!page) throw new Error(`polein-bot has no access to Page ${pageId}`);

  const mediaIds = [];
  for (const url of urls) {
    const r = await graph(`/${pageId}/photos`, { url, published: "false" }, { method: "POST", accessToken: page.access_token });
    mediaIds.push(r.id);
  }
  const params = { message: item.facebook.message };
  mediaIds.forEach((id, i) => (params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id })));
  const post = await graph(`/${pageId}/feed`, params, { method: "POST", accessToken: page.access_token });
  const info = await graph(`/${post.id}`, { fields: "permalink_url" }, { accessToken: page.access_token }).catch(() => ({}));
  return { postId: post.id, url: info.permalink_url || `https://www.facebook.com/${post.id}` };
}

async function waitFinished(containerId) {
  for (let i = 0; i < 30; i++) {
    const { status_code: s } = await graph(`/${containerId}`, { fields: "status_code" });
    if (s === "FINISHED") return;
    if (s === "ERROR" || s === "EXPIRED") throw new Error(`Instagram couldn't process media ${containerId} (${s})`);
    await sleep(3000);
  }
  throw new Error(`Instagram media ${containerId} still processing after 90 s`);
}

// Instagram location tag: a Facebook Page with an address. Defaults to the
// Polein Page (Zapopan); META_IG_LOCATION_ID overrides it, "none" turns it off.
function locationId(pageId) {
  const v = (process.env.META_IG_LOCATION_ID || "").trim();
  if (v.toLowerCase() === "none") return null;
  return v || pageId;
}

async function publishInstagram(item, urls, igId, pageId) {
  const children = [];
  for (const image_url of urls) {
    const c = await graph(`/${igId}/media`, { image_url, is_carousel_item: "true" }, { method: "POST" });
    children.push(c.id);
  }
  for (const c of children) await waitFinished(c);
  const params = { media_type: "CAROUSEL", children: children.join(","), caption: igCaption(item) };
  const loc = locationId(pageId);
  let carousel;
  try {
    carousel = await graph(`/${igId}/media`, loc ? { ...params, location_id: loc } : params, { method: "POST" });
  } catch (err) {
    if (!loc) throw err;
    // A bad location must not block the post: publish without it.
    console.log(`\n   ⚠️  Location ${loc} rejected (${err.message}); publishing without location.`);
    carousel = await graph(`/${igId}/media`, params, { method: "POST" });
  }
  await waitFinished(carousel.id);
  const pub = await graph(`/${igId}/media_publish`, { creation_id: carousel.id }, { method: "POST" });
  const info = await graph(`/${pub.id}`, { fields: "permalink" }).catch(() => ({}));
  return { mediaId: pub.id, permalink: info.permalink || null };
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  loadEnv();

  const queue = readJson(QUEUE, []);
  const item = queue.find((q) => q.id === o.id);
  if (!item) throw new Error(`No post "${o.id}" in social/queue.json`);
  if (!item.images || !item.images.length) throw new Error("No images yet. Run: node scripts/social/render.js " + o.id);
  if (item.images.length > 10) throw new Error("Instagram carousels take at most 10 images");

  const published = readJson(PUBLISHED, []);
  let record = published.find((p) => p.id === item.id);
  const networks = ["facebook", "instagram"].filter((n) => (!o.only || o.only === n) && !(record && record[n]));
  const urls = item.images.map((p) => SITE + p);

  console.log(`Post ${item.id} (status: ${item.status})`);
  console.log(`Images: ${urls.length} · Networks to publish: ${networks.join(", ") || "none (already published)"}`);
  if (!networks.length) return;

  const bad = await checkImages(urls);
  if (bad.length) console.log(`⚠️  Not live on the site yet:\n   ${bad.join("\n   ")}`);
  else console.log("✅ All images are live on polein.com.mx");

  if (o.dryRun) {
    if (networks.includes("facebook")) console.log(`\n── Facebook ──\n${item.facebook.message}`);
    if (networks.includes("instagram")) console.log(`\n── Instagram ──\n${igCaption(item)}`);
    console.log("\nDry run: nothing was posted.");
    if (item.status !== "approved") console.log(`Note: status is "${item.status}"; it must be "approved" to publish.`);
    return;
  }

  if (item.status !== "approved") throw new Error(`Status is "${item.status}". Only "approved" posts are published.`);
  if (bad.length) throw new Error("Deploy the site first so Instagram can download the images.");
  const pageId = env("META_PAGE_ID");
  const igId = env("META_IG_USER_ID");

  if (!record) {
    record = { id: item.id, source: item.source };
    published.push(record);
  }
  const save = () => {
    record.updatedAt = new Date().toISOString();
    item.status = ["facebook", "instagram"].every((n) => record[n]) ? "published" : "approved";
    writeJson(PUBLISHED, published);
    writeJson(QUEUE, queue);
  };

  let failed = false;
  for (const n of networks) {
    process.stdout.write(`Publishing to ${n}… `);
    try {
      record[n] =
        n === "facebook"
          ? await publishFacebook(item, urls, pageId)
          : await publishInstagram(item, urls, igId, pageId);
      record[n].publishedAt = new Date().toISOString();
      save(); // after each network, so a later failure never causes a double post
      console.log(`✅ ${record[n].url || record[n].permalink || "done"}`);
    } catch (err) {
      failed = true;
      console.log("❌");
      console.error(`   ${err instanceof GraphError ? `Meta: ${err.message}` : err.message}`);
    }
  }
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
