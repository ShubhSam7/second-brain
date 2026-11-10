import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanText,
  extractDocument,
  selectContext,
  SUMMARY_CONTEXT_CHARACTERS,
} from "../dist/services/contentText.js";
import { createContentPipeline } from "../dist/services/aiPipeline.js";
import {
  createEmbeddingService,
  EMBEDDING_DIMENSIONS,
  normalizeEmbedding,
} from "../dist/services/embeddings.js";
const vector = () => [2, ...Array(EMBEDDING_DIMENSIONS - 1).fill(0)];

test("long-page summaries include the conclusion and metadata", async () => {
  const markdown =
    "# Database guide\n\n" +
    "Opening discussion. ".repeat(1400) +
    "\n\n## Conclusion\nUse PgBouncer transaction pooling for short-lived serverless connections.";
  let context;
  const pipeline = createContentPipeline({
    scrape: async () => ({
      markdown,
      metadata: {
        title: "Database guide",
        description: "Connection management explained.",
      },
    }),
    summarize: async (input) => {
      context = JSON.parse(input);
      return "PgBouncer transaction pooling reduces serverless connection pressure.";
    },
  });
  const result = await pipeline("https://example.com/guide");
  assert.match(context.pageContent, /PgBouncer transaction pooling/);
  assert.ok(context.pageContent.length <= SUMMARY_CONTEXT_CHARACTERS);
  assert.equal(context.description, "Connection management explained.");
  assert.match(result.content, /Conclusion/);
  assert.equal(result.summarySource, "ai");
});

test("blocked pages are not summarized or treated as source content", async () => {
  let calls = 0;
  const pipeline = createContentPipeline({
    scrape: async () => ({
      markdown: "Verify you are human\n" + "Please wait. ".repeat(30),
      metadata: { title: "Just a moment..." },
    }),
    summarize: async () => {
      calls++;
      return "invented";
    },
  });
  const result = await pipeline("https://example.com/private");
  assert.equal(calls, 0);
  assert.equal(result.content, "");
  assert.equal(result.summarySource, "unavailable");
  assert.equal(result.title, "example.com");
});

test("summary failure retains real metadata or a factual page excerpt", async () => {
  const pipeline = createContentPipeline({
    scrape: async () => ({
      markdown:
        "PgBouncer supports transaction pooling for serverless PostgreSQL workloads. ".repeat(
          10,
        ),
    }),
    summarize: async () => {
      throw new Error("rate limit");
    },
  });
  const result = await pipeline("https://example.com");
  assert.equal(result.summarySource, "excerpt");
  assert.match(result.summary, /PgBouncer supports transaction pooling/);
  const metadataOnly = createContentPipeline({
    scrape: async () => ({
      metadata: {
        ogTitle: "A real title",
        ogDescription: "A real description.",
      },
    }),
    summarize: async () => {
      throw new Error("must not run");
    },
  });
  assert.equal(
    (await metadataOnly("https://example.com")).summary,
    "A real description.",
  );
});

test("scrape failure returns a fallback and concurrent saves share extraction", async () => {
  let calls = 0;
  const pipeline = createContentPipeline({
    scrape: async () => {
      calls++;
      throw new Error("unavailable");
    },
    summarize: async () => "unused",
  });
  const [a, b] = await Promise.all([
    pipeline("https://example.com"),
    pipeline("https://example.com"),
  ]);
  assert.equal(calls, 1);
  assert.equal(a.extractionStatus, "unavailable");
  assert.deepEqual(a, b);
});

test("cleaning removes boilerplate while preserving prose and repeated code", () => {
  assert.equal(
    cleanText(
      "Accept all cookies\n# Guide\n\nSome content.\nconst x = 1;\nconst x = 1;",
    ),
    "# Guide\n\nSome content.\nconst x = 1;\nconst x = 1;",
  );
  assert.ok(selectContext("a".repeat(100_000), 5000).length <= 5000);
  assert.equal(
    extractDocument("https://example.com", {
      markdown: "# Useful heading\ntext",
    }).title,
    "Useful heading",
  );
});

test("embeddings use retrieval inputs, dimensions, normalization, and query caching", async () => {
  const bodies = [];
  const service = createEmbeddingService({
    apiKey: () => "test-key",
    request: async (_url, options) => {
      bodies.push(JSON.parse(options.body));
      return Response.json({ embedding: { values: vector() } });
    },
  });
  const [a, b] = await Promise.all([
    service(" React   hooks ", "query"),
    service("React hooks", "query"),
  ]);
  assert.equal(bodies.length, 1);
  assert.equal(
    bodies[0].content.parts[0].text,
    "task: search result | query: React hooks",
  );
  assert.equal(bodies[0].outputDimensionality, 768);
  assert.equal(Math.hypot(...a), 1);
  assert.deepEqual(a, b);
  await service("A page body", "document", "A page title");
  assert.equal(
    bodies[1].content.parts[0].text,
    "title: A page title | text: A page body",
  );
});

test("failed embedding calls are evicted and invalid vectors are rejected", async () => {
  let calls = 0;
  const service = createEmbeddingService({
    apiKey: () => "test-key",
    request: async () =>
      ++calls === 1
        ? new Response("", { status: 429 })
        : Response.json({ embedding: { values: vector() } }),
  });
  await assert.rejects(service("retry query", "query"));
  assert.equal((await service("retry query", "query")).length, 768);
  assert.equal(calls, 2);
  for (const invalid of [
    [],
    Array(768).fill(0),
    Array(768).fill(NaN),
    Array(768).fill("1"),
  ])
    assert.throws(() => normalizeEmbedding(invalid));
});

test("query embedding cache expires instead of retaining entries indefinitely", async () => {
  let time = 0;
  let calls = 0;
  const service = createEmbeddingService({
    apiKey: () => "test-key",
    now: () => time,
    cacheTtlMs: 100,
    request: async () => {
      calls++;
      return Response.json({ embedding: { values: vector() } });
    },
  });
  await service("cached query", "query");
  time = 50;
  await service("cached query", "query");
  assert.equal(calls, 1);
  time = 101;
  await service("cached query", "query");
  assert.equal(calls, 2);
});
