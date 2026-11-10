import "dotenv/config";

export const EMBEDDING_MODEL = "gemini-embedding-2";
export const EMBEDDING_DIMENSIONS = 768;
// Version the input format as well as the model: old vectors must never be compared to new ones.
export const EMBEDDING_VERSION = `${EMBEDDING_MODEL}:retrieval-v1:${EMBEDDING_DIMENSIONS}`;
export type EmbeddingTask = "document" | "query";

export function normalizeEmbedding(values: unknown): number[] {
  if (
    !Array.isArray(values) ||
    values.length !== EMBEDDING_DIMENSIONS ||
    !values.every(
      (value) => typeof value === "number" && Number.isFinite(value),
    )
  )
    throw new Error("Invalid embedding dimensions or values");
  const norm = Math.hypot(...values);
  if (!Number.isFinite(norm) || norm === 0)
    throw new Error("Invalid zero embedding");
  return values.map((value) => value / norm);
}

export function createEmbeddingService(options: {
  apiKey: () => string | undefined;
  request?: typeof fetch;
  cacheTtlMs?: number;
  now?: () => number;
}) {
  const request = options.request || fetch;
  const now = options.now || Date.now;
  const ttl = options.cacheTtlMs ?? 5 * 60_000;
  const queryCache = new Map<
    string,
    { expires: number; result: Promise<number[]> }
  >();
  const generate = async (
    text: string,
    task: EmbeddingTask,
    title?: string,
  ) => {
    const key = options.apiKey();
    if (!key) throw new Error("Google embedding API key is not configured");
    const input =
      task === "query"
        ? `task: search result | query: ${text}`
        : `title: ${title || "none"} | text: ${text}`;
    const response = await request(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          content: { parts: [{ text: input }] },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
        signal: AbortSignal.timeout(task === "query" ? 3500 : 8000),
      },
    );
    if (!response.ok)
      throw new Error(`Embedding provider returned HTTP ${response.status}`);
    const data = (await response.json()) as {
      embedding?: { values?: unknown };
    };
    return normalizeEmbedding(data.embedding?.values);
  };
  return (
    text: string,
    task: EmbeddingTask = "document",
    title?: string,
  ): Promise<number[]> => {
    const normalized = text.normalize("NFKC").trim().replace(/\s+/g, " ");
    if (!normalized)
      return Promise.reject(new Error("Embedding input is empty"));
    if (task === "document") return generate(normalized, task, title);
    const cached = queryCache.get(normalized);
    if (cached && cached.expires > now()) return cached.result;
    queryCache.delete(normalized);
    if (queryCache.size >= 200)
      queryCache.delete(queryCache.keys().next().value!);
    const result = generate(normalized, task, title).catch((error) => {
      if (queryCache.get(normalized)?.result === result)
        queryCache.delete(normalized);
      throw error;
    });
    queryCache.set(normalized, { expires: now() + ttl, result });
    return result;
  };
}

export const getEmbedding = createEmbeddingService({
  apiKey: () => process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
});
