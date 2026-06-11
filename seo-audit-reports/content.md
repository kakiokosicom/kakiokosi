# Content Quality / E-E-A-T Audit — kakiokosi.com

Audit date: 2026-06-11. Basis: Google Quality Rater Guidelines (Sept 2025), crawl of 500 URLs (`/tmp/seo-audit-kakiokosi/pages.jsonl`).

## 1. Indexable Set

- 500 crawled, 498 OK, **403 noindexed** (tags, pagination, Block C posts, old /2010/ WP URLs — deliberate, excluded from this audit).
- **95 indexable pages**: 1 homepage, 8 category pages, 59 articles (`/share/<cat>/<id>`), 14 SEO guide/static pages, 7 utility pages (about, contact, company, tos, privacy, regal, /share root), 2 `/uploads` image files, plus pillar pages (kakiokoshi-toha, gijiroku, mojikoshi-tool, tapeokoshi, etc.).
- Article mix: 22 IT (2026 auto-publish batch), 20 business, 5 politics, 4 society, 4 entertainment, 3 culture, 1 world.
- Indexable article char_count (full page incl. boilerplate): min 1,417 / median 4,736 / max 30,177.

## 2. Thin Content Among Indexable Pages (char_count < 1500)

8 pages:

| char_count | URL | Assessment |
|---|---|---|
| 296 | /share/company | Utility — acceptable, but could carry E-E-A-T weight (history, team) |
| 625 | /share/regal | Utility (特商法) — acceptable |
| 856 | /share/contact | Utility — acceptable |
| 906 | /share/jirei | **Thin for an indexable commercial page** (依頼事例) — needs real case studies or noindex |
| 962 | /share/category/culture | Thin hub — only 3 posts; add category intro/curation text |
| 963 | /share/category/economy | Thin hub — 4 posts, all likely noindexed; near-empty indexable page |
| 1139 | /share/technique | "スピードを10倍にする裏技" — promising E-E-A-T topic, far too short to rank |
| 1417 | /share/entertainment/641 | Only thin indexable *article* — "一言書き起こし" (single quote + 2 lines of context); main content ≈700 chars |

Effective count of content-thin indexable pages (excluding pure utility company/regal/contact): **5**.

## 3. E-E-A-T Assessment (representative pages read in full)

Pages read: /share/it/1385, /share/business/75, /share/entertainment/641 (articles); /share/kakiokoshi-toha, /share/gijiroku, /share/mojikoshi-tool (guides); homepage; /share/category/it; /share/about.

### Strengths

- **Trust infrastructure is strong.** Every page footer: 運営 株式会社ユリカ + full Shibuya address; links to 利用規約 / プライバシーポリシー / お問い合わせ / 運営情報 / 特定商取引法. Organization JSON-LD with postal address, contactPoint email, `sameAs` → x.com/kakiokosi, x.com/paji_a, note.com/hajimeataka.
- **/share/about is a genuine E-E-A-T asset**: AboutPage + FAQPage schema, mission, 編集方針・品質管理 (出典の明示, 正確性, 定期的な更新), 編集部について, 運営会社 table.
- **Dates everywhere**: articles show 公開日 + 更新日 (e.g. business/75: "2011/4/11 更新: 2026/3/28") and Article JSON-LD carries datePublished/dateModified. 2026-03 "編集部注" update blocks across legacy posts are real freshness signals.
- **Legacy transcription articles DO add value beyond the raw transcript** (mitigates the "no added value" duplicate-content risk): editorial intro explaining why it was transcribed, 2026 editor's note, table of contents, descriptive pull-quote H2s segmenting long transcripts (business/75: 8 H2s over 21,799 chars), and source attribution on many classics — business/75 links masason's tweet, business/77 links the SoftBank press release + the original Ustream recording, society/121 links the original TED YouTube video.
- **Authoritativeness raw material exists**: 2011 founding, "143本以上 / 累計78万PV" stated on kakiokoshi-toha; 15-year archive of 孫正義/TED/political speeches is unique, hard-to-replicate content.

### Weaknesses

**(A) The 2026 IT batch (22 indexable articles) is the biggest E-E-A-T/AI-quality risk.**
- Only **4 of 22** IT articles contain any source signal (ポッドキャスト/配信); **18/22 have zero attribution** — no speaker name, no link to original audio/video. External links in main content: only x.com/kakiokosi (e.g. /share/it/1385, /share/it/1386).
- Yet each is bylined **"文字起こし: 書き起こし.com（編集部）"** on a site whose About page promises 「出典の明示 ― 書き起こしの元となった映像・音声の出典（イベント名、日時、配信元URL等）を記事内に」. This is a direct, checkable contradiction between stated editorial policy and practice — exactly what QRG raters use to lower Trust.
- Content style is essay/commentary ("〜を読み解きます", "ここがポイントなんですが——"), not transcription. Labeling commentary as 文字起こし risks the Sept 2025 QRG flag for content that misrepresents how it was created, and the pieces carry several low-quality-AI markers: no named human source, repeated structural template (hook headline with ——, 4-5 H2s, ~2,100–2,600 page chars at the low end), identical "関連する書き起こし記事" + Captio/メモ link block.
- Fix: add a source block to every IT article (元配信: ポッドキャスト名・回・日付・URL, 話者名), or relabel the byline from 文字起こし to 解説/編集部コラム.

**(B) No visible named author.** Byline is the generic "書き起こし.com（編集部）" sitewide. 安宅基 / paji (ex-livedoor, the actual 78万views operator) appears nowhere in visible content — only in Organization `sameAs`. The single strongest unused E-E-A-T lever: a named editor profile on /share/about + Person schema linked from Article author, with credentials.

**(C) Pillar guide pages are structurally excellent but too shallow for their head terms.** Visible page text incl. nav/footer: kakiokoshi-toha 1,834 / gijiroku 2,336 / mojikoshi-tool 2,558 chars → main content roughly 1,200–2,000 chars while titles promise 「徹底解説」「完全ガイド」「【2026年最新】…10選」. Competing pages for 文字起こし ツール / 議事録 書き方 typically run 8,000–15,000+ Japanese chars. The skeletons (definition lead, 3 types, comparison table, template, 使い分け) are right — they need 3–5x expansion with the site's unique angle (15 years of human transcription experience, real before/after examples).

**(D) Undisclosed self-promotion.** /share/mojikoshi-tool and /share/gijiroku recommend SimpleMemoFast (link to simplememofast.com, "Captioの体験を最も忠実に再現している") with no relationship disclosure. If this is an owned/affiliated product, QRG treats undisclosed promotion as a trust deduction. Add 「※当編集部が開発・運営」 or equivalent.

**(E) Factual inconsistency in self-description.** Homepage claims "163本以上"; /share/about and /share/kakiokoshi-toha claim "143本以上". Small, but it is a verifiable accuracy error on trust-bearing pages.

**(F) Repetitive cross-link module.** The same Captio/タイムスタンプメモ/受信箱メモ trio is appended to gijiroku, mojikoshi-tool, multiple IT articles and dominates the homepage/category/it listings. Repetitive structure across pages is an explicit low-quality-AI marker in the Sept 2025 QRG, and it skews the "transcription archive" identity toward a memo-app funnel.

## 4. Duplicate Titles (summary.json)

All four duplicate-title pairs (孫vs佐々木 光の道 1/2, old /2010/05/ WP URLs vs /share/business/309-310, plus the homepage title pair) involve pages that are **noindexed and correctly canonicalized** to the /share/ versions. **No indexable duplicate-title issue.** The two empty-title entries are the /uploads image files (see Issues).

## 5. AI-Citation Readiness — Score: 72/100

Good:
- Clean H1→H2→H3 hierarchy on all sampled pages; pull-quote H2s make transcripts quotable.
- Definition-first leads on guides ("書き起こしとは、…作業のことです" / "議事録とは、…文書のことです") — ideal for AI Overviews/LLM citation.
- Tables (議事録項目, ツール比較), copy-paste 議事録テンプレート, FAQPage schema on About, `speakable` in Article schema, full Article/Organization/BreadcrumbList graph.

Gaps:
- No FAQ blocks/FAQPage schema on the pillar guides themselves (kakiokoshi-toha, gijiroku, mojikoshi-tool) — the highest-value pages for citation.
- 18/22 IT articles cite no primary source, making them unverifiable and unlikely to be cited by attribution-conscious AI engines.
- Transcript articles lack a structured metadata block (話者 / イベント名 / 日付 / 元URL) that would make them machine-quotable; data exists informally in prose.

## 6. "No Added Value" Duplicate-Content Risk (transcription-site specific)

**Low for the legacy archive**: original intros, editor's notes, segmentation headings, TOCs, and (often) source links mean these pages are the canonical text version of audio that has no other text form — the classic defensible transcription model. Weakest case: /share/entertainment/641 (one quoted sentence + two context lines). **Moderate-to-high for the 2026 IT batch** — but inverted: the risk is not duplication, it is *claimed* transcription with no demonstrable source (see Issue A).

## 7. E-E-A-T Scores

| Factor | Weight | Score | Notes |
|---|---|---|---|
| Experience | 20% | 70 | 15-year first-hand transcription archive, real editorial updates; IT batch shows no first-hand source |
| Expertise | 25% | 55 | Competent guides; no named/credentialed author anywhere visible |
| Authoritativeness | 25% | 55 | History + PV claims, unique archive; few external citations, paji's reputation not leveraged |
| Trustworthiness | 30% | 60 | Excellent company/legal transparency; undercut by policy-vs-practice contradiction (sources), undisclosed product promo, 143 vs 163 inconsistency |
| **Weighted E-E-A-T** | | **60** | |

## 8. Issues Table

| # | Issue | Evidence | Severity |
|---|---|---|---|
| 1 | 18/22 indexable IT articles bylined "文字起こし" with no source/speaker/URL, contradicting the site's own 出典の明示 policy; AI-commentary style | /share/it/1385, /share/it/1387, /share/it/1374… vs /share/about policy | **High** |
| 2 | No visible named author; generic 編集部 byline sitewide; paji/安宅基 credentials unused | All sampled articles; Article JSON-LD author = "書き起こし.com（編集部）" | **High** |
| 3 | Pillar guides 1.2–2k chars of main content vs 徹底解説/完全ガイド/10選 titles; uncompetitive depth | /share/kakiokoshi-toha (1,834), /share/gijiroku (2,336), /share/mojikoshi-tool (2,558 — full-page counts) | **High** |
| 4 | Undisclosed promotion of SimpleMemoFast on pillar pages | /share/mojikoshi-tool, /share/gijiroku → simplememofast.com | Medium |
| 5 | Thin indexable pages: /share/jirei (906), /share/technique (1139), /share/category/culture (962), /share/category/economy (963), /share/entertainment/641 (1417) | pages.jsonl char_count | Medium |
| 6 | Repetitive Captio/メモ cross-link module on guides + IT articles; memo cluster dominates homepage/IT category | gijiroku, mojikoshi-tool, it/1385 footers; /share/category/it top 4 listings | Medium |
| 7 | Article-count claim inconsistency: 163本 (home) vs 143本 (about, kakiokoshi-toha) | homepage vs /share/about | Low |
| 8 | 2 /uploads image files crawled as indexable pages, empty titles, no canonical | summary.json missing_canonical; /uploads/2017/07/…png, /uploads/2014/04/…jpg | Low |
| 9 | Some legacy articles lack original-source link (e.g. politics/643, entertainment/641) | extracted main-content external links | Low |

## 9. Scores

- **Content quality score: 62/100**
- E-E-A-T weighted: 60/100 (Exp 70 / Expertise 55 / Auth 55 / Trust 60)
- AI-citation readiness: 72/100
- Indexable thin pages (<1500 chars): 8 (5 after excluding pure utility pages)

## 10. Priority Recommendations

1. Add a mandatory source block (話者・イベント/配信名・日付・元URL) to all 22 IT articles, or rebrand their byline from 文字起こし to 解説/コラム. Bring practice in line with the published editorial policy.
2. Publish a named author profile (安宅基 / paji: ex-livedoor, 2011年から運営, 78万PV) on /share/about, switch Article `author` to that Person with `sameAs` → x.com/paji_a, note.com/hajimeataka, and show the byline on articles.
3. Expand the three pillar guides 3–5x with first-hand material (real transcription before/after samples, timing data from 15 years of work) and add FAQ sections with FAQPage schema.
4. Disclose the SimpleMemoFast relationship; vary or trim the repeated memo-app cross-link module.
5. Fix the 143/163 count inconsistency (automate the figure); expand or noindex /share/jirei, /share/technique, category/culture, category/economy; merge /share/entertainment/641 into a 本田圭佑 compilation or noindex it.
