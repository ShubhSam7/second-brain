import { Prisma } from "@prisma/client";
import { scrapeAndSummarize } from "./aiPipeline.js";
import { documentEmbeddingText } from "./contentText.js";
import {
  EMBEDDING_VERSION,
  getEmbedding,
  normalizeEmbedding,
} from "./embeddings.js";

export async function prepareBookmark(
  input: {
    link: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    sourceText?: string;
  },
  dependencies = { extract: scrapeAndSummarize, embed: getEmbedding },
) {
  const extracted = await dependencies.extract(input.link, input.sourceText);
  const title = input.title || extracted.title || new URL(input.link).hostname;
  const description = input.description || extracted.summary;
  let vector: number[] | null = null;
  try {
    vector = normalizeEmbedding(
      await dependencies.embed(
        documentEmbeddingText({
          title,
          description,
          link: input.link,
          extractedContent: extracted.content,
        }),
        "document",
        title,
      ),
    );
  } catch {
    console.warn(
      "[Content] Semantic indexing unavailable; full-text search remains available",
    );
  }
  return {
    title,
    description,
    thumbnail: input.thumbnail || extracted.thumbnail,
    extractedContent: extracted.content || null,
    contentSource: input.sourceText ? "provided" : "link",
    vector,
    processing: {
      extraction: extracted.extractionStatus,
      coverage: extracted.contentCoverage,
      inputSource: input.sourceText ? "provided" : "link",
      summary: input.description ? "provided" : extracted.summarySource,
      indexed: vector !== null,
    },
  };
}

export function embeddingUpdateQuery(id: string, vector: number[] | null) {
  const serialized = vector
    ? `[${normalizeEmbedding(vector).join(",")}]`
    : null;
  // Clear stale semantic data if updated source text could not be embedded.
  return Prisma.sql`UPDATE "Content" SET embedding = ${serialized}::vector,
    "embeddingModel" = ${vector ? EMBEDDING_VERSION : null},
    "embeddingGeneratedAt" = ${vector ? new Date() : null} WHERE id = ${id}`;
}
