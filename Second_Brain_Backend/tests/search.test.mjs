import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import {
  lexicalSearchQuery,
  semanticSearchQuery,
  searchLibrary,
} from "../dist/services/search.js";
import { EMBEDDING_VERSION } from "../dist/services/embeddings.js";
import { searchQuerySchema } from "../dist/validation.js";
let db;
const queryVector = [1, ...Array(767).fill(0)];
const run = async (statement) =>
  (await db.query(statement.text, statement.values)).rows;
const search = (query, embed = async () => queryVector) =>
  searchLibrary("alice", query, 10, { query: run, embed });
before(async () => {
  db = new PGlite({ extensions: { vector, pg_trgm } });
  await db.exec(`CREATE EXTENSION vector;
    CREATE TABLE "Content" (id TEXT PRIMARY KEY,title TEXT NOT NULL,link TEXT NOT NULL,description TEXT,
    type TEXT NOT NULL DEFAULT 'article',category TEXT NOT NULL DEFAULT 'article',domain TEXT,thumbnail TEXT,
    "userId" TEXT NOT NULL,"createdAt" TIMESTAMP NOT NULL DEFAULT now(),"updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    embedding vector(768),"embeddingGeneratedAt" TIMESTAMP);
    INSERT INTO "Content" (id,title,link,"userId") VALUES ('old','Earlier model vector','https://old.example','alice');`);
  const migration = await readFile(
    new URL("../prisma/search-index.sql", import.meta.url),
    "utf8",
  );
  await db.exec(migration);
  await db.exec(migration);
  const fixtures = [
    [
      "exact",
      "React hooks reference",
      "State management with hooks.",
      null,
      "https://react.dev/reference/react",
      "alice",
      null,
    ],
    [
      "summary",
      "Software design notes",
      "Practical React hooks and component state examples.",
      null,
      "https://notes.example/components",
      "alice",
      null,
    ],
    [
      "body",
      "Conference notes",
      "Notes from a talk.",
      "PgBouncer connection pooling is useful for serverless PostgreSQL applications.",
      "https://notes.example/connections",
      "alice",
      null,
    ],
    [
      "semantic",
      "Building a calmer workspace",
      "Creating focus and reducing digital clutter.",
      null,
      "https://ideas.example/focus",
      "alice",
      EMBEDDING_VERSION,
    ],
    [
      "url",
      "Useful resource",
      "A toolkit.",
      null,
      "https://github.com/acme/retrieval-lab",
      "alice",
      null,
    ],
    [
      "foreign",
      "React hooks secret",
      "Private conference notes.",
      "PgBouncer connection pooling.",
      "https://private.example",
      "bob",
      EMBEDDING_VERSION,
    ],
    [
      "literal",
      "100% coverage",
      "Literal symbols matter.",
      null,
      "https://notes.example/coverage",
      "alice",
      null,
    ],
  ];
  for (const [id, title, description, body, link, userId, model] of fixtures)
    await db.query(
      'INSERT INTO "Content" (id,title,description,"extractedContent",link,"userId","embeddingModel",embedding) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::vector)',
      [
        id,
        title,
        description,
        body,
        link,
        userId,
        model,
        model ? JSON.stringify(queryVector) : null,
      ],
    );
  await db.query("UPDATE \"Content\" SET embedding=$1::vector WHERE id='old'", [
    JSON.stringify(queryVector),
  ]);
});
after(async () => {
  await db?.close();
});

test("hybrid search keeps title and summary matches even when semantic results exist", async () => {
  const result = await search("React hooks");
  assert.equal(result.matchType, "hybrid");
  assert.equal(result.results[0].id, "exact");
  assert.ok(result.results.some((row) => row.id === "summary"));
  assert.ok(result.results.some((row) => row.id === "semantic"));
  assert.ok(!result.results.some((row) => row.id === "foreign"));
  assert.equal(
    result.results.find((row) => row.id === "summary").similarity,
    null,
  );
});
test("keyword search still works during an embedding provider outage", async () => {
  const result = await search("component state", async () => {
    throw new Error("provider unavailable");
  });
  assert.equal(result.semanticAvailable, false);
  assert.equal(result.matchType, "keyword");
  assert.ok(result.results.some((row) => row.id === "summary"));
});
test("source details omitted from summaries remain searchable, including word stems", async () => {
  const rows = await run(lexicalSearchQuery("alice", "connection pools"));
  assert.deepEqual(
    rows.map((row) => row.id),
    ["body"],
  );
});
test("URL fragments are searchable and wildcard symbols are literal", async () => {
  assert.equal(
    (await run(lexicalSearchQuery("alice", "retrieval-lab")))[0].id,
    "url",
  );
  assert.deepEqual(
    (await run(lexicalSearchQuery("alice", "%"))).map((row) => row.id),
    ["literal"],
  );
});
test("semantic lookup excludes other users and incompatible old vectors", async () => {
  assert.deepEqual(
    (await run(semanticSearchQuery("alice", queryVector))).map((row) => row.id),
    ["semantic"],
  );
});
test("the search index updates automatically when a summary changes", async () => {
  await db.query("UPDATE \"Content\" SET description=$1 WHERE id='literal'", [
    "Observability with OpenTelemetry tracing.",
  ]);
  assert.equal(
    (await run(lexicalSearchQuery("alice", "OpenTelemetry")))[0].id,
    "literal",
  );
});
test("SQL-like input cannot escape tenant filtering", async () => {
  assert.ok(
    !(await run(lexicalSearchQuery("alice", "' OR 1=1 --"))).some(
      (row) => row.id === "foreign",
    ),
  );
});
test("search validation rejects empty or oversized input and invalid limits", () => {
  for (const query of [
    { q: "   " },
    { q: "a".repeat(501) },
    { q: ["react"] },
    { q: "react", limit: "0" },
    { q: "react", limit: "51" },
  ])
    assert.equal(searchQuerySchema.safeParse(query).success, false);
  assert.equal(
    searchQuerySchema.parse({ q: " React   hooks " }).q,
    "React hooks",
  );
});

test("a result found by both searches is returned once with hybrid provenance", async () => {
  const result = await search("calmer workspace");
  assert.equal(result.results.filter((row) => row.id === "semantic").length, 1);
  assert.equal(
    result.results.find((row) => row.id === "semantic").matchType,
    "hybrid",
  );
});

test("keyword results survive a semantic database lookup failure", async () => {
  const result = await searchLibrary("alice", "React hooks", 10, {
    embed: async () => queryVector,
    query: async (statement) => {
      if (statement.text.includes("<=>"))
        throw new Error("vector lookup unavailable");
      return run(statement);
    },
  });
  assert.equal(result.semanticAvailable, false);
  assert.equal(result.results[0].id, "exact");
});

test("updating source text clears stale vectors when new embeddings fail", async () => {
  const { embeddingUpdateQuery } =
    await import("../dist/services/bookmarkPreparation.js");
  await db.query(
    'INSERT INTO "Content" (id,title,link,"userId",embedding,"embeddingModel") VALUES ($1,$2,$3,$4,$5::vector,$6)',
    [
      "edit",
      "Old title",
      "https://example.com/edit",
      "alice",
      JSON.stringify(queryVector),
      EMBEDDING_VERSION,
    ],
  );
  await db.query(
    'UPDATE "Content" SET "extractedContent"=$1,"contentSource"=$2 WHERE id=$3',
    ["A fresh caption about basil gardening.", "provided", "edit"],
  );
  await run(embeddingUpdateQuery("edit", null));
  const row = (
    await db.query(
      'SELECT embedding,"embeddingModel" FROM "Content" WHERE id=$1',
      ["edit"],
    )
  ).rows[0];
  assert.equal(row.embedding, null);
  assert.equal(row.embeddingModel, null);
  assert.equal(
    (await run(lexicalSearchQuery("alice", "basil gardening")))[0].id,
    "edit",
  );
});
