import test from "node:test";
import assert from "node:assert/strict";
import { createContentPipeline } from "../dist/services/aiPipeline.js";
import { prepareBookmark } from "../dist/services/bookmarkPreparation.js";
import { createContentSchema, sourceTextSchema } from "../dist/validation.js";
const vector = [1, ...Array(767).fill(0)];

test("provided post text is summarized without trying a blocked site", async () => {
  let providerCalls = 0;
  let context;
  const extract = createContentPipeline({
    scrape: async () => {
      providerCalls++;
      throw new Error("not allowed");
    },
    publicSource: async () => {
      providerCalls++;
      throw new Error("not allowed");
    },
    summarize: async (input) => {
      context = JSON.parse(input);
      return "A practical caption about growing balcony herbs.";
    },
  });
  const result = await prepareBookmark(
    {
      link: "https://www.instagram.com/p/demo/",
      sourceText:
        "Grow basil and mint on a sunny balcony. Water when the top layer of soil is dry.",
    },
    { extract, embed: async () => vector },
  );
  assert.equal(providerCalls, 0);
  assert.equal(result.contentSource, "provided");
  assert.equal(result.processing.inputSource, "provided");
  assert.match(context.pageContent, /basil and mint/);
  assert.match(result.description, /From the text you added/);
  assert.equal(result.vector.length, 768);
});

test("different pasted text on the same URL is never coalesced between saves", async () => {
  const extract = createContentPipeline({
    scrape: async () => {
      throw new Error("not allowed");
    },
    summarize: async (input) => JSON.parse(input).pageContent,
  });
  const [a, b] = await Promise.all([
    extract(
      "https://example.com/post",
      "First private note about balcony herbs.",
    ),
    extract(
      "https://example.com/post",
      "Different private note about React state.",
    ),
  ]);
  assert.match(a.content, /balcony herbs/);
  assert.doesNotMatch(a.content, /React/);
  assert.match(b.content, /React state/);
});

test("embedding outage keeps supplied source text available for keyword indexing", async () => {
  const extract = createContentPipeline({
    scrape: async () => {
      throw new Error();
    },
    summarize: async () => {
      throw new Error("quota");
    },
  });
  const result = await prepareBookmark(
    {
      link: "https://linkedin.com/posts/sample",
      sourceText:
        "PostgreSQL connection pooling with PgBouncer keeps serverless applications responsive.",
    },
    {
      extract,
      embed: async () => {
        throw new Error("unavailable");
      },
    },
  );
  assert.equal(result.vector, null);
  assert.equal(result.processing.indexed, false);
  assert.match(result.extractedContent, /PgBouncer/);
  assert.match(result.description, /PgBouncer/);
});

test("source-text validation prevents empty and excessive input", () => {
  assert.equal(sourceTextSchema.safeParse({ sourceText: "  " }).success, false);
  assert.equal(
    sourceTextSchema.safeParse({ sourceText: "a".repeat(80001) }).success,
    false,
  );
  assert.equal(
    createContentSchema.safeParse({
      link: "file:///tmp/demo",
      sourceText: "A meaningful piece of source text.",
    }).success,
    false,
  );
  assert.equal(
    createContentSchema.parse({
      link: "https://example.com",
      sourceText: "A meaningful piece of source text.",
    }).sourceText,
    "A meaningful piece of source text.",
  );
});
