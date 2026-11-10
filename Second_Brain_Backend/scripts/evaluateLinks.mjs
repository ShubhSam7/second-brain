import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const cases = JSON.parse(
  await readFile(
    new URL("../tests/fixtures/bookmark-corpus.json", import.meta.url),
    "utf8",
  ),
);
if (!process.argv.includes("--live")) {
  console.table(cases.map(({ source, url }) => ({ source, url })));
  console.log(
    "Add --live to call the configured providers. Results use an isolated database; your library is never modified.",
  );
} else {
  const [
    { scrapeAndSummarize },
    { getEmbedding, EMBEDDING_VERSION },
    { documentEmbeddingText },
    { searchLibrary },
    { PGlite },
    { vector },
    { pg_trgm },
  ] = await Promise.all([
    import("../dist/services/aiPipeline.js"),
    import("../dist/services/embeddings.js"),
    import("../dist/services/contentText.js"),
    import("../dist/services/search.js"),
    import("@electric-sql/pglite"),
    import("@electric-sql/pglite-pgvector"),
    import("@electric-sql/pglite/contrib/pg_trgm"),
  ]);
  const db = new PGlite({ extensions: { vector, pg_trgm } });
  const report = [];
  const start = performance.now();
  try {
    await db.exec(`CREATE EXTENSION vector;
      CREATE TABLE "Content" (id text PRIMARY KEY,title text NOT NULL,link text NOT NULL,description text,type text NOT NULL DEFAULT 'other',category text NOT NULL DEFAULT 'other',domain text,thumbnail text,"userId" text NOT NULL,"createdAt" timestamp DEFAULT now(),"updatedAt" timestamp DEFAULT now(),embedding vector(768),"embeddingGeneratedAt" timestamp);`);
    await db.exec(
      await readFile(
        new URL("../prisma/search-index.sql", import.meta.url),
        "utf8",
      ),
    );
    for (const sample of cases) {
      const began = performance.now();
      const result = await scrapeAndSummarize(sample.url);
      const topicSignal = sample.terms.some((term) =>
        `${result.title} ${result.summary} ${result.content}`
          .toLowerCase()
          .includes(term),
      );
      let embedding = null;
      if (result.extractionStatus !== "unavailable" && topicSignal) {
        try {
          embedding = await getEmbedding(
            documentEmbeddingText({
              title: result.title,
              description: result.summary,
              link: sample.url,
              extractedContent: result.content,
            }),
            "document",
            result.title,
          );
        } catch {
          /* Keyword-only results remain testable. */
        }
      }
      await db.query(
        'INSERT INTO "Content" (id,title,link,description,domain,"userId","extractedContent",embedding,"embeddingModel") VALUES ($1,$2,$3,$4,$5,$6,$7,$8::vector,$9)',
        [
          sample.id,
          result.title,
          sample.url,
          result.summary,
          new URL(sample.url).hostname,
          "benchmark",
          result.content,
          embedding ? JSON.stringify(embedding) : null,
          embedding ? EMBEDDING_VERSION : null,
        ],
      );
      const row = {
        id: sample.id,
        source: sample.source,
        url: sample.url,
        title: result.title,
        coverage: result.contentCoverage,
        summarySource: result.summarySource,
        contentCharacters: result.content.length,
        topicSignal,
        semanticIndexed: Boolean(embedding),
        processingMs: Math.round(performance.now() - began),
      };
      report.push(row);
      console.log(JSON.stringify(row));
    }
    for (const sample of cases) {
      const row = report.find((item) => item.id === sample.id);
      if (row.coverage === "unavailable" || !row.topicSignal) continue;
      const results = await searchLibrary("benchmark", sample.query, 10, {
        query: async (statement) =>
          (await db.query(statement.text, statement.values)).rows,
      });
      row.query = sample.query;
      row.top3 = results.results.slice(0, 3).map((item) => item.id);
      row.foundInTop3 = row.top3.includes(sample.id);
      row.semanticAvailable = results.semanticAvailable;
    }
    const evaluated = report.filter(
      (row) => typeof row.foundInTop3 === "boolean",
    );
    const summary = {
      samples: report.length,
      unavailable: report.filter((row) => row.coverage === "unavailable")
        .length,
      partial: report.filter((row) => row.coverage === "partial").length,
      retrievalEvaluated: evaluated.length,
      retrievedInTop3: evaluated.filter((row) => row.foundInTop3).length,
      elapsedMs: Math.round(performance.now() - start),
    };
    const index = process.argv.indexOf("--report");
    const reportPath =
      index >= 0
        ? process.argv[index + 1]
        : join(tmpdir(), "second-brain-link-report.json");
    if (!reportPath) throw new Error("--report needs a file path");
    await writeFile(
      reportPath,
      JSON.stringify({ summary, cases: report }, null, 2),
    );
    console.log(JSON.stringify({ summary, reportPath }));
  } finally {
    await db.close();
  }
}
