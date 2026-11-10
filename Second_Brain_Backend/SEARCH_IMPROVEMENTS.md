# Extraction and search

The backend now cleans and keeps page text, uses metadata alongside excerpts from the start, middle, and end for summaries, and searches the title, summary, URL, and extracted text. Keyword and semantic candidates are merged by reciprocal rank fusion. Direct title/URL matches receive a boost. The dashboard defaults to relevance for search results.

## Activate the database changes

Use Node 20.19+ and run these commands from `Second_Brain_Backend` with the intended database configured in `.env`:

```sh
npm ci
npm run db:search
```

Run `db:search` before starting or deploying the updated backend. It uses `DIRECT_URL` (or `DATABASE_URL` if absent) and applies `prisma/search-index.sql` in a transaction. The SQL adds generated full-text and substring-search columns, enables `pg_trgm`, and builds indexes. It is repeatable and preserves existing bookmarks. A five-second lock timeout causes the transaction to fail rather than wait indefinitely; rerun at a quieter time if necessary.

This repository has no initial Prisma migration baseline, so this targeted schema command works with the existing database without assuming an empty database or resetting its schema. The Prisma schema records the same columns and indexes.

## Existing bookmarks

The new model is `gemini-embedding-2` with 768 dimensions and retrieval-specific input formatting. Previous embedding spaces are incompatible, so old vectors are excluded from semantic comparisons. Existing titles, summaries, and URLs remain available to keyword search immediately after the schema update.

Preview the first batch (no provider calls or writes):

```sh
npm run search:reindex -- --limit 100
```

Rebuild embeddings while preserving saved titles and summaries:

```sh
npm run search:reindex -- --write --limit 100
```

Re-extract pages and replace existing summaries, including custom summaries, when full page extraction succeeds:

```sh
npm run search:reindex -- --write --refresh-summaries --limit 100
```

By default, only entries using an old or missing embedding version are selected. Rerun batches until the dry run reports zero. Add `--user-id USER_ID` to restrict a run. `--all` includes already indexed entries. Provider calls happen sequentially; failures preserve existing data and return a nonzero exit code. Concurrent bookmark edits are skipped instead of overwritten.

Reindexing sends each selected bookmark’s URL, title, summary, and available source text to the configured embedding provider. Review the dry run before using `--write`. User-provided captions and notes are preserved during `--refresh-summaries`; they are never replaced with scraped page content.

## Restricted social posts and missing page text

The capture dialog accepts optional post text, captions, or notes. Supplied text bypasses page extraction and becomes the source for the summary and search index. Summaries clearly begin with “From the text you added”. If a page cannot be read, the link is saved once and the dialog offers to add its text to that same bookmark. “Keep link only” leaves the saved URL available for title and URL searches.

Existing bookmarks have an “Add post text” action inside their summary dialog. Saving replaces the searchable text and summary, updates the generated keyword indexes immediately, and attempts a fresh embedding. If embedding generation fails, stale vectors are cleared and keyword search remains available. Updates require ownership and reject concurrent edits rather than overwriting them.

## Provider configuration and limits

Set `FIRECRAWL_KEY`, `GROQ_API_KEY`, and `GOOGLE_API_KEY` (or `GEMINI_API_KEY`). `SUMMARY_MODEL` optionally overrides the default `openai/gpt-oss-20b`. The previous `llama-3.3-70b-versatile` model returned 404 for the configured account during verification.

Firecrawl requests main content and uses its one-day page cache. The application coalesces simultaneous extraction requests for the same URL. A page blocked by a login, CAPTCHA, or scraper error receives an explicit unavailable summary rather than invented page details. Video links are summarized from extracted page text; the pipeline does not invent transcripts.

Stored source text is bounded to 80,000 characters; summary context is bounded to 20,000 characters sampled across the page. Embeddings include the summary and sampled page context. Source text and generated search columns are excluded from normal library API responses to keep payloads small.

Search query embeddings are cached for five minutes (200-entry cap), with a 3.5-second provider timeout. Failed entries are evicted. Keyword and semantic searches run concurrently, and keyword results remain available if embedding generation or semantic lookup fails. Full-text search uses English stemming; literal substrings retain the original Unicode query. API queries are limited to 500 characters and 1–50 results.

## Verification

```sh
npm test
```

Tests run against isolated in-memory PostgreSQL with pgvector and pg_trgm. They cover extraction fallbacks, long-page context, embedding caching/validation, hybrid ranking, source-text and URL matching, user isolation, incompatible vectors, automatic index updates, and provider outages. They do not connect to the configured database.

Run actual Express and Prisma integration checks with `npm run test:api`. This uses a disposable PostgreSQL instance over a local socket, disables all external providers, and checks capture, search, edits, stale-text removal, and user isolation. `npm run preview:search` serves the same isolated backend with the frontend at `http://127.0.0.1:5174/signin`; use `preview-user` / `preview-password`. These commands never read or write the configured user database.

Provider references: [Gemini retrieval formatting and embedding compatibility](https://aistudio.google.com/docs/embeddings), [Groq model availability](https://console.groq.com/docs/models), [Firecrawl scraping](https://docs.firecrawl.dev/api-reference/endpoint/scrape), [PostgreSQL text ranking](https://www.postgresql.org/docs/current/textsearch-controls.html), [indexed substring matching](https://www.postgresql.org/docs/current/pgtrgm.html).

## Representative bookmark checks

`tests/fixtures/bookmark-corpus.json` contains public examples from X, Instagram, LinkedIn, Reddit, YouTube, Medium, Substack, an independent essay, a recipe blog, GitHub, and MDN. Each has a natural-language query and expected topic signals. These are a small curated smoke test, not a claim about all links on a platform.

```sh
npm run test:links
npm run test:links -- --live --report /tmp/second-brain-link-report.json
```

The first command lists cases without calling providers. `--live` performs extraction, summaries, embeddings, and retrieval against an isolated in-memory PostgreSQL database. It reports full/partial/metadata/unavailable coverage separately, records provider degradation, and checks whether each available link appears in its query's first three results. It never inserts test bookmarks into your configured database. Live runs use provider quota and can vary with public-page availability.

Public GitHub repository roots use the README API, and X posts use the official public oEmbed API before falling back to Firecrawl. A YouTube oEmbed fallback contains only a title/channel preview and is never treated as a transcript. The direct readers use fixed API origins, reject redirects, bound response size, and do not send application credentials or cookies to those endpoints.

Short genuine posts count as source text. Empty social templates and login screens do not. Paywalled articles keep only the visible preview and explicitly label its summary as partial. Newsletter discussion sections and recipe recommendation sections are excluded from the article. Reindexing never replaces a saved summary with a partial preview. Instagram, LinkedIn, Reddit, and other restricted pages still depend on what the public extractor can retrieve; unavailable posts are reported rather than fabricated.

Measured on 2026-11-06: 11 public samples, eight usable links (six full text, two partial previews), and all eight usable links found in the first three results for their test queries. The Instagram, LinkedIn, and Reddit examples were unavailable. Groq returned HTTP 429 during the batch for four summaries, which used metadata/excerpt fallbacks. The check completed in about 33 seconds. This is a small smoke test, not a production latency or accuracy benchmark.
