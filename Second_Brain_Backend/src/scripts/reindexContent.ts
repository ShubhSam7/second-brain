import "dotenv/config";
import prisma from "../db.js";
import { EMBEDDING_VERSION, getEmbedding } from "../services/embeddings.js";
import { documentEmbeddingText } from "../services/contentText.js";
import { scrapeAndSummarize } from "../services/aiPipeline.js";

const args = process.argv.slice(2);
const write = args.includes("--write");
const refresh = args.includes("--refresh-summaries");
const includeCurrent = args.includes("--all");
const value = (name: string) => {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
};
const userId = value("--user-id");
const limit = Number(value("--limit") || 100);
if (!Number.isInteger(limit) || limit < 1 || limit > 10_000)
  throw new Error("--limit must be an integer between 1 and 10000");
if (args.includes("--user-id") && (!userId || userId.startsWith("--")))
  throw new Error("--user-id needs a value");

try {
  const rows = await prisma.content.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(includeCurrent
        ? {}
        : {
            OR: [
              { embeddingModel: null },
              { embeddingModel: { not: EMBEDDING_VERSION } },
            ],
          }),
    },
    orderBy: { id: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      link: true,
      description: true,
      thumbnail: true,
      extractedContent: true,
      contentSource: true,
      updatedAt: true,
    },
  });
  console.log(
    `${write ? "Updating" : "Dry run:"} ${rows.length} bookmark(s). Model: ${EMBEDDING_VERSION}. Refresh summaries: ${refresh}.`,
  );
  if (!write)
    console.log(
      "No provider calls or writes made. Add --write to proceed. --refresh-summaries re-extracts pages and replaces generated or custom summaries when extraction succeeds.",
    );
  let failed = 0;
  if (write)
    for (const item of rows) {
      try {
        const extracted =
          refresh && item.contentSource !== "provided"
            ? await scrapeAndSummarize(item.link)
            : undefined;
        // Never replace a saved summary with a blocked page or failed extraction.
        const usable =
          extracted?.extractionStatus === "content" &&
          extracted.contentCoverage === "full";
        const description = usable ? extracted.summary : item.description;
        const extractedContent = usable
          ? extracted.content
          : item.extractedContent;
        const vector = await getEmbedding(
          documentEmbeddingText({ ...item, description, extractedContent }),
          "document",
          item.title,
        );
        const written = await prisma.$transaction(async (tx) => {
          // Avoid overwriting a bookmark modified since this job read it.
          const update = await tx.content.updateMany({
            where: { id: item.id, updatedAt: item.updatedAt },
            data: {
              description,
              extractedContent,
              thumbnail:
                item.thumbnail || (usable ? extracted.thumbnail : undefined),
            },
          });
          if (!update.count) return false;
          await tx.$executeRaw`UPDATE "Content" SET embedding = ${`[${vector.join(",")}]`}::vector,
          "embeddingModel" = ${EMBEDDING_VERSION}, "embeddingGeneratedAt" = NOW() WHERE id = ${item.id}`;
          return true;
        });
        console.log(
          written
            ? `Indexed ${item.id}`
            : `Skipped ${item.id}: bookmark changed during indexing.`,
        );
      } catch {
        failed += 1;
        console.error(
          `Could not index ${item.id}; previous data preserved. Rerun to retry.`,
        );
      }
    }
  if (failed) process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
