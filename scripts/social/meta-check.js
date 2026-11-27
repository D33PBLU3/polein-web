#!/usr/bin/env node
// Checks the Meta token in .env and finds the IDs the publisher needs.
// Read-only: it never posts anything and never prints the token.
//
// Usage: node scripts/social/meta-check.js
//
// Prints: whether the token is valid and never expires, which permissions it
// has (and which are missing), the Facebook Page ID, the Instagram business
// account ID, and the lines to add to .env / GitHub secrets.

const { graph, token, GraphError, GRAPH_VERSION } = require("./meta");

const REQUIRED = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
];

const ok = (s) => console.log(`  ✅ ${s}`);
const bad = (s) => console.log(`  ❌ ${s}`);
const warn = (s) => console.log(`  ⚠️  ${s}`);

async function main() {
  const t = token();
  let problems = 0;

  console.log(`Meta Graph API ${GRAPH_VERSION}\n`);
  console.log("Token");
  const { data: info } = await graph("/debug_token", { input_token: t });
  if (!info.is_valid) {
    bad(`Not valid${info.error ? `: ${info.error.message}` : ""}. Generate a new one for polein-bot.`);
    process.exitCode = 1;
    return;
  }
  ok(`Valid · app "${info.application}" (${info.app_id}) · type ${info.type}`);
  if (!info.expires_at) ok("Never expires");
  else {
    warn(`Expires ${new Date(info.expires_at * 1000).toLocaleString("es-MX")} — generate it with expiration "Never"`);
    problems++;
  }

  const scopes = new Set(info.scopes || []);
  const missing = REQUIRED.filter((s) => !scopes.has(s));
  if (missing.length) {
    bad(`Missing permissions: ${missing.join(", ")}`);
    problems++;
  } else ok("All 6 permissions granted");

  console.log("\nFacebook Page");
  const { data: pages = [] } = await graph("/me/accounts", {
    fields: "id,name,tasks,instagram_business_account{id,username}",
  });
  if (!pages.length) {
    bad("No Pages. In Business settings › System users › polein-bot › Assign assets, add the Page.");
    process.exitCode = 1;
    return;
  }
  for (const p of pages) {
    ok(`${p.name} · Page ID ${p.id}`);
    const tasks = p.tasks || [];
    if (!tasks.includes("CREATE_CONTENT") && !tasks.includes("MANAGE")) {
      bad(`polein-bot can't post on this Page (tasks: ${tasks.join(", ") || "none"}). Give it content/full control.`);
      problems++;
    }
  }
  const page = pages[0];
  if (pages.length > 1) warn(`${pages.length} Pages found; using the first one (${page.name}).`);

  console.log("\nInstagram");
  const ig = page.instagram_business_account;
  if (!ig) {
    bad("No Instagram business account linked to this Page. Link it in Business Suite › Settings › Linked accounts.");
    problems++;
  } else {
    ok(`@${ig.username || "?"} · Instagram ID ${ig.id}`);
    try {
      const { data: lim = [] } = await graph(`/${ig.id}/content_publishing_limit`, {
        fields: "quota_usage,config",
      });
      const l = lim[0];
      if (l) ok(`Publishing allowed · ${l.quota_usage || 0} of ${l.config?.quota_total ?? "?"} API posts used in the last 24 h`);
    } catch (e) {
      bad(`Can't check publishing (${e.message}). The token may lack instagram_content_publish, or the account isn't assigned to polein-bot.`);
      problems++;
    }
  }

  console.log("\nAdd these to .env and to GitHub › Settings › Secrets and variables › Actions:");
  console.log(`  META_PAGE_ID=${page.id}`);
  if (ig) console.log(`  META_IG_USER_ID=${ig.id}`);
  console.log("  META_ACCESS_TOKEN=(the token you already have in .env)");

  console.log(problems ? `\n${problems} problem(s) to fix above.` : "\nEverything is ready for publishing (Phase 3).");
  if (problems) process.exitCode = 1;
}

main().catch((err) => {
  if (err instanceof GraphError && err.code === 190) {
    console.error("The token was rejected by Meta (expired or revoked). Generate a new one for polein-bot and update .env.");
  } else {
    console.error(`Error: ${err.message}`);
  }
  process.exit(1);
});
