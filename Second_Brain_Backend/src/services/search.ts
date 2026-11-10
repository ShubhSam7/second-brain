import { Prisma } from "@prisma/client";
import {
  EMBEDDING_VERSION,
  getEmbedding,
  normalizeEmbedding,
} from "./embeddings.js";

export interface SearchRow {
  id: string;
  title: string;
  link: string;
  description: string | null;
  type: string;
  category: string;
  domain: string | null;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
  similarity?: number;
  exactMatch?: boolean;
}
export type QueryDatabase = <T>(query: Prisma.Sql) => Promise<T[]>;
export const SEARCH_CANDIDATES = 60;

export function lexicalSearchQuery(userId: string, query: string): Prisma.Sql {
  // Escape LIKE wildcards: a user searching for "%" must not match their whole library.
  const pattern = `%${query.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;
  return Prisma.sql`
    WITH terms AS (SELECT websearch_to_tsquery('english', ${query}) AS query)
    SELECT id, title, link, description, type, category, domain, thumbnail, "createdAt", "updatedAt",
      (LOWER(title) LIKE ${pattern} OR LOWER(link) LIKE ${pattern}) AS "exactMatch"
    FROM "Content", terms
    WHERE "userId" = ${userId} AND (
      "searchDocument" @@ terms.query OR "searchText" LIKE ${pattern}
    )
    ORDER BY "exactMatch" DESC, ts_rank_cd("searchDocument", terms.query, 32) DESC, "createdAt" DESC, id
    LIMIT ${SEARCH_CANDIDATES}`;
}

export function semanticSearchQuery(
  userId: string,
  vector: number[],
): Prisma.Sql {
  const serialized = `[${normalizeEmbedding(vector).join(",")}]`;
  return Prisma.sql`
    SELECT id, title, link, description, type, category, domain, thumbnail, "createdAt", "updatedAt",
      1 - (embedding <=> ${serialized}::vector) AS similarity
    FROM "Content"
    WHERE "userId" = ${userId} AND "embeddingModel" = ${EMBEDDING_VERSION} AND embedding IS NOT NULL
      AND 1 - (embedding <=> ${serialized}::vector) >= 0.45
    ORDER BY embedding <=> ${serialized}::vector, id
    LIMIT ${SEARCH_CANDIDATES}`;
}

export function rankSearchResults(
  lexical: SearchRow[],
  semantic: SearchRow[],
  limit: number,
) {
  const merged = new Map<
    string,
    { row: SearchRow; score: number; lexical: boolean; semantic: boolean }
  >();
  for (const [rows, kind, weight] of [
    [lexical, "lexical", 1.25],
    [semantic, "semantic", 1],
  ] as const) {
    rows.forEach((row, index) => {
      const entry = merged.get(row.id) || {
        row,
        score: 0,
        lexical: false,
        semantic: false,
      };
      // Reciprocal rank fusion avoids treating lexical rank as a cosine similarity.
      entry.score += weight / (60 + index + 1);
      if (kind === "lexical" && row.exactMatch) entry.score += 0.05;
      if (kind === "semantic")
        entry.row = { ...entry.row, similarity: row.similarity };
      entry[kind] = true;
      merged.set(row.id, entry);
    });
  }
  return [...merged.values()]
    .sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id))
    .slice(0, limit)
    .map((entry) => {
      const { exactMatch: _exact, ...row } = entry.row;
      return {
        ...row,
        similarity: row.similarity ?? null,
        score: entry.score,
        matchType:
          entry.lexical && entry.semantic
            ? ("hybrid" as const)
            : entry.lexical
              ? ("keyword" as const)
              : ("semantic" as const),
      };
    });
}

export async function searchLibrary(
  userId: string,
  query: string,
  limit: number,
  dependencies: {
    query: QueryDatabase;
    embed?: (text: string) => Promise<number[]>;
  },
) {
  let semanticAvailable = true;
  const lexicalPromise = dependencies.query<SearchRow>(
    lexicalSearchQuery(userId, query),
  );
  const semanticPromise = (
    dependencies.embed || ((text) => getEmbedding(text, "query"))
  )(query)
    .then((vector) =>
      dependencies.query<SearchRow>(semanticSearchQuery(userId, vector)),
    )
    .catch(() => {
      semanticAvailable = false;
      console.warn(
        "[Search] Semantic search unavailable; keeping keyword matches",
      );
      return [] as SearchRow[];
    });
  const [lexical, semantic] = await Promise.all([
    lexicalPromise,
    semanticPromise,
  ]);
  const results = rankSearchResults(lexical, semantic, limit);
  const hasLexical = results.some((row) => row.matchType !== "semantic");
  const hasSemantic = results.some((row) => row.matchType !== "keyword");
  return {
    results,
    semanticAvailable,
    matchType:
      hasLexical && hasSemantic
        ? ("hybrid" as const)
        : hasSemantic
          ? ("semantic" as const)
          : ("keyword" as const),
  };
}
