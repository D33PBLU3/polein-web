#!/usr/bin/env node
// Renders the drafts in social/queue.json as readable Markdown, for reviewing
// them (and, in phase 4, as the weekly pull request description).
//
// Usage: node scripts/social/preview.js [--status draft] [--out social/preview.md]
//   Without --out, prints to the terminal.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const status = opt("--status", "draft");
const out = opt("--out", null);

const queuePath = path.join(ROOT, "social/queue.json");
const queue = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, "utf8")) : [];
const items = queue.filter((q) => status === "all" || q.status === status);

const quote = (text) => text.split("\n").map((l) => (l ? `> ${l}` : ">")).join("\n");
const words = (s) => s.split(/\s+/).filter(Boolean).length;

const md = [
  `# Publicaciones para revisar (${items.length})`,
  "",
  "Revise cada publicación. Para cambiar algo, edite el texto en `social/queue.json`.",
  "",
  "- [ ] Sin nombres de clientes, gimnasios atendidos, precios ni proveedores",
  "- [ ] Nada inventado (descuentos, garantías, cifras que no estén en el artículo)",
  "- [ ] El tono suena a Polein",
  "",
];

for (const it of items) {
  md.push(
    "---",
    "",
    `## ${it.id}`,
    "",
    `**Fuente:** [${it.source.slug}](${it.source.url}) · **Modelo:** ${it.model}${it.scheduledAt ? ` · **Programada:** ${it.scheduledAt}` : ""}`,
    "",
    `**Idea:** ${it.hook}`,
    ""
  );
  if (it.warnings && it.warnings.length) md.push(...it.warnings.map((w) => `> ⚠️ ${w}`), "");
  if (it.reviewNotes) md.push(`**Notas para revisar:** ${it.reviewNotes}`, "");
  md.push(
    `### Facebook (${words(it.facebook.message)} palabras)`,
    "",
    quote(it.facebook.message),
    "",
    `### Instagram (${words(it.instagram.caption)} palabras)`,
    "",
    quote(it.instagram.caption),
    ">",
    quote(it.instagram.hashtags.map((h) => `#${h}`).join(" ")),
    "",
    ...(it.group
      ? [`### Grupos de Facebook — para compartir a mano (${words(it.group.message)} palabras)`, "", quote(it.group.message), ""]
      : []),
    `### Carrusel (${it.slides.length} imágenes)`,
    "",
    "| # | Título | Texto |",
    "|---|---|---|",
    ...it.slides.map((s, i) => `| ${i + 1} | **${s.title}** | ${s.body} |`),
    ""
  );
}

const text = md.join("\n");
if (out) {
  fs.writeFileSync(path.join(ROOT, out), text);
  console.log(`Wrote ${out} (${items.length} posts)`);
} else {
  console.log(text);
}
