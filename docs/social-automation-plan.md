# Social media automation plan (Facebook + Instagram)

Goal: turn Polein's blog articles, ideas and technician videos into Facebook and
Instagram posts automatically. Claude drafts each post, Dario approves it in a
weekly pull request, and a scheduled job publishes it through the Meta Graph API.

Status: **Phase 1 built, waiting for a first live run** (needs `ANTHROPIC_API_KEY`) · Owner: Dario · Last updated: 2026-11-27

---

## How it works (target state)

```
 Sources                      Weekly draft job (Mon)            You             Daily publish job
 ───────                      ──────────────────────            ───             ─────────────────
 src/blog/posts.json  ──┐     1. pick what to post next
 GitHub Issues "idea" ──┼──▶  2. Claude writes captions/slides ─▶ review PR ─▶ merge ─▶ deploy puts images
 Drive "Videos para    ─┘     3. render images / Reels             (edit or          on polein.com.mx
   redes" (phase 5)           4. add to social/queue.json          delete)           ─▶ post anything due
                              5. open a PR                                            ─▶ log post IDs
```

- **Everything lives in this repo.** No new servers. GitHub Actions does the
  scheduling, and GitHub Pages hosts the images (Instagram needs a public URL
  for every image).
- **Nothing is published without a merged PR.** The draft job can only open PRs.
  Only content on `main` is ever published.
- **Never published twice.** `social/published.json` records every Meta post ID.

### Files to add

| Path | Purpose |
|---|---|
| `social/queue.json` | Approved posts: id, source, scheduled date, networks, captions, image paths |
| `social/published.json` | Log written by the publish job: id → Facebook/Instagram post IDs, date |
| `social/prompt/` | System prompt: brand voice, rules, 2–3 example posts (stable, so it caches) |
| `social/templates/` | HTML/CSS templates for carousel slides and before/after cards |
| `public/social/<post-id>/` | Rendered images, served at `polein.com.mx/social/<post-id>/…` |
| `scripts/social/draft.js` | Picks sources, calls Claude, renders images, updates the queue |
| `scripts/social/render.js` | HTML template → 1080×1350 JPEG (Playwright) |
| `scripts/social/publish.js` | Posts due items to Facebook + Instagram, writes `published.json` |
| `.github/workflows/social-draft.yml` | Weekly cron + manual run → opens a PR |
| `.github/workflows/social-publish.yml` | Daily cron + manual run → publishes |

### Content rules (go into the Claude prompt and the PR checklist)

Same rules as the blog (see `CLAUDE.md`):
- No client names, gym names, prices or supplier names.
- Photos: no visible client logos, gym names or people. Before/after only when
  the change is obvious.
- Mexican Spanish, formal "usted" like the blog, Guadalajara audience.
- Every post ends with a call to action: WhatsApp (Instagram, since captions
  can't have links) or the blog link (Facebook).
- No made-up claims (no "50% off", no guarantees that aren't on the website).

---

## Phase 0 — Account setup (Dario, ~1–2 hours)

> **Meta is ready (2026-11-27):** app "Polein social", system user polein-bot, token never expires,
> all 6 permissions. Page ID `349694218235724`, Instagram @poleinman2026 (ID `17841474385563707`).
> The app's use cases must include Page management and Instagram content — the ads use cases alone
> don't grant `pages_manage_posts` / `instagram_content_publish`. Still to do: Anthropic key, GitHub secrets.

Claude can't do these steps. They need your Meta login.

- [x] **Instagram → Professional account (Business)** and link it to the
      Polein Facebook Page (Instagram app › Settings › Account type and tools,
      then Meta Business Suite › Settings › Linked accounts).
- [ ] Add the Instagram URL to `src/data/data.json` (`Contact.twitter`, a
      legacy key name) and to `public/index.html`. Claude can do this edit once you have the URL.
- [x] **Meta Business Suite / Business Manager**: confirm the Page and the
      Instagram account are both assets of the Polein business.
- [x] **developers.facebook.com** → create an app (type: Business), connected
      to the Polein business.
- [x] **Business Settings › Users › System users** → create a system user
      (Admin), assign it the Page and the Instagram account, and generate a
      token **that never expires** for the app with these permissions:
      `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`,
      `instagram_basic`, `instagram_content_publish`, `business_management`.
      Posting only to your own accounts shouldn't need Meta App Review.
- [x] Copy `.env.example` to `.env`, paste the token there, then run
      `node scripts/social/meta-check.js`: it checks the token (valid, never
      expires, all permissions) and prints the **Page ID** and **Instagram ID**.
      It never posts or prints the token.
- [ ] **console.anthropic.com** → create an API key and set a monthly spend
      limit (e.g. $10) as a safety net.
- [ ] GitHub repo › Settings › Secrets and variables › Actions — add:
      `ANTHROPIC_API_KEY`, `META_ACCESS_TOKEN`, `META_PAGE_ID`, `META_IG_USER_ID`.

**Done when:** the four secrets exist and Instagram shows as linked to the Page.

> Never paste the tokens into chat, code or commits. They go only in GitHub secrets
> (and in a local `.env` that is git-ignored, for testing).

---

## Phase 1 — Drafting with Claude, local only (Claude, ~1 session)

Nothing is posted in this phase. It only produces text.

- [x] `social/prompt/system.md`: brand voice (formal "usted"), the content
      rules above, per-network format, carousel rules. Contact info is filled
      in from `data.json`. The prompt is stable, so it's prompt-cached.
- [x] `scripts/social/draft.js` (`@anthropic-ai/sdk` devDependency):
      - reads `posts.json` + the article body, **converted to plain text**, + FAQ
      - skips anything already in `queue.json` / `published.json` (`--force` to redo)
      - **one Claude call per article** with structured JSON output:
        `hook`, `facebook.message`, `instagram.caption` + `hashtags`, `slides[]`, `review_notes`
      - Facebook link gets UTM tags (`utm_source=facebook…`) so GA4 shows social visits
      - server-side refusal fallback (`fallbacks: "default"`) on Opus/Sonnet
      - automatic warnings: prices, discounts, URL in the Instagram caption,
        missing link or WhatsApp, slide count, length
      - `--dry-run` (doesn't save), `--print-prompt` (no API call), token use + cost per draft
      - defaults: `claude-opus-5-5`, effort `medium`; `--model` / `--effort` to compare
- [ ] **Dario:** create the Anthropic API key, then in the repo root create a
      `.env` file (git-ignored) containing `ANTHROPIC_API_KEY=sk-ant-...`. Never paste the key into chat.
- [x] First 3 drafts written by Claude Opus 5.5 in Claude Code (no API key) from the
      same prompt, saved in `social/queue.json`, readable in `social/preview.md`
      (`node scripts/social/preview.js --out social/preview.md`). All pass the checks.
- [ ] **Dario:** review `social/preview.md` and note what to change in the tone/rules.
- [ ] Once there's an API key, run on 3 articles with both models and compare:
      ```bash
      node scripts/social/draft.js --dry-run --limit 3
      node scripts/social/draft.js --dry-run --limit 3 --model claude-sonnet-5-5
      ```
- [ ] Tune `social/prompt/system.md` until the drafts need few or no edits, and
      add 2–3 approved posts to it as examples.

**Done when:** 3 drafts you would post as they are, plus the measured token use per post.

---

## Phase 2 — Images (Claude, ~1 session)

- [ ] Templates in `social/templates/` using the site palette (navy `#00263a`,
      orange `#ff8200`) and `POLEIN-LOGOTIPO_03.png`:
      1. **Cover slide** — article title, category, logo
      2. **Tip slide** — number + title + 1–2 sentences
      3. **Closing slide** — "Escríbanos por WhatsApp" + number + website
      4. **Antes / Después card** — two real job photos side by side
- [ ] `scripts/social/render.js` → 1080×1350 JPEG (Instagram 4:5 portrait), into
      `public/social/<post-id>/`, compressed (<300 KB each).
- [ ] Before/after photos come from `fotos-blog/raw` / technicians' job photos,
      following the blog photo rules.

**Done when:** one full carousel (cover + 4–6 tips + closing) looks right on a phone.

---

## Phase 3 — Publishing (Claude + Dario, ~1 session)

- [ ] `scripts/social/publish.js` using the Graph API (current version):
      - **Instagram carousel:** create one container per image
        (`is_carousel_item`), then the carousel container with the caption,
        wait until it's `FINISHED`, then `media_publish`.
      - **Facebook:** photo post with the cover image, or a multi-photo post, with
        the message + blog link.
      - Checks every image URL returns HTTP 200 **before** posting (images are only
        live after the site deploys).
      - Writes post IDs to `social/published.json`. Re-running never posts the same
        item twice.
      - `--dry-run` shows what would be posted.
- [ ] **First real post by hand** (`node scripts/social/publish.js --id <id>`),
      checked by you on both networks.
- [ ] Make sure the deploy workflow ignores `social/published.json` commits
      (`paths-ignore`), so logging a post doesn't redeploy the site.

**Done when:** one carousel is live on Instagram and Facebook and logged.

---

## Phase 4 — Automation (Claude, ~1 session)

- [ ] `social-draft.yml`: Mondays ~8:00 Guadalajara time + manual "Run workflow"
      button. Drafts the next **3 posts** for the week (Tue/Thu/Sat), using the
      **Batch API** (50% off), renders the images, opens a PR titled
      "Social posts semana <fecha>".
- [ ] PR description = preview of each post (caption + images) + checklist:
      no clients/prices/suppliers, photos OK, dates OK.
- [ ] `social-publish.yml`: daily ~10:00 Guadalajara time + manual run. Publishes
      due items from `main`, commits `published.json`.
- [ ] Failure alerts: a failed job emails you (GitHub default) and opens an issue.
- [ ] Safety limits: max 3 drafts per run, max 1 post per network per day.

**Done when:** a full week runs on its own, and your only step is merging the PR.

**From here on, the only regular task is reviewing one PR a week (~10 min).**

---

## Phase 5 — Ideas inbox (Claude, short)

- [ ] GitHub label `idea`. You create issues from the GitHub phone app.
- [ ] The draft job reads open `idea` issues first. Each becomes a post (or
      a suggestion to write a full article), the PR links it with `Closes #N`.
- [ ] Optional: a label `urgente` to schedule an idea for the next day.

---

## Phase 6 — Technician videos (Claude + Dario, ~2 sessions)

- [ ] **Dario:** Google Drive folder "Videos para redes" shared with the
      technicians. Simple rules for them: vertical, 15–60 s, no client logos or
      faces, say what you're doing. Get each technician's OK to appear in posts.
- [ ] Weekly draft job also suggests 2–3 video topics (in the PR, for you to
      forward on WhatsApp).
- [ ] Processing: download new videos → ffmpeg (9:16, trim, logo, end card with
      WhatsApp) → transcribe (speech-to-text service, a few cents per video) →
      subtitles → ~6 small frames to Claude (Haiku 5.5) for the logo/face check →
      Claude writes the caption.
- [ ] Videos are too big for git: processed Reels go to cheap storage
      (Cloudflare R2 or Drive) that gives Meta a public URL. Publish as an
      Instagram Reel + Facebook video.

**Done when:** a technician uploads a video and it shows up as a Reel in the next PR.

---

## Phase 7 — Results and paid ads (later)

- [ ] Weekly job pulls reach/engagement for published posts (Graph API insights)
      into `social/stats.json`, and gives Claude the top topics when choosing what to post next.
- [ ] Boost the best posts in Meta Ads Manager (manual at first), optimizing for
      WhatsApp clicks. The Pixel already tracks `whatsapp_click`.
- [ ] Only if it pays off: Meta Marketing API to create boosts automatically.

---

## Costs and limits

| Item | Monthly cost |
|---|---|
| Claude API (~13 posts, Batch + caching) | ~$0.40–1 (Sonnet 5.5 / Opus 5.5) |
| Meta Graph API | Free |
| GitHub Actions + Pages | Free tier |
| Speech-to-text (phase 6) | ~cents per video |
| Video storage (phase 6) | ~$0–1 |

Ways to keep token use down are built in: plain text instead of HTML, one call
per article for both networks, a cached stable system prompt, the Batch API, low
effort for captions, small video frames, Haiku for checks, and edits in the PR
never call Claude again.

## Risks

| Risk | Mitigation |
|---|---|
| Wrong or embarrassing post goes out | Nothing publishes without a merged PR; content rules in the prompt and PR checklist |
| Client data leaks (names, prices) | Sources are only public blog articles, approved ideas and screened videos; never the service reports |
| Meta token revoked / expired | Publish job fails loudly (email + issue); a system user token doesn't expire |
| Meta restricts the account for spammy automation | Low volume (3/week), real content, human approval |
| Images not live yet when publishing | Publisher checks the URL returns 200 first, retries the next day |
