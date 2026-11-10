import { convert } from "html-to-text";
import type { ScrapedDocument } from "./contentText.js";

type Request = typeof fetch;
const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

/** Only fixed public API origins are requested; arbitrary saved hosts never enter fetch(). */
export function createPublicSourceReader(request: Request = fetch) {
  async function read(endpoint: URL, accept = "application/json") {
    const response = await request(endpoint, {
      headers: {
        Accept: accept,
        "User-Agent": "SecondBrain-BookmarkReader/1.0",
      },
      redirect: "error",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok)
      throw new Error(`Public source returned HTTP ${response.status}`);
    const limit = 512_000;
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Public source returned no body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > limit)
          throw new Error("Public source response is too large");
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  return async (savedUrl: string): Promise<ScrapedDocument | null> => {
    const url = new URL(savedUrl);
    const host = url.hostname
      .toLowerCase()
      .replace(/^(?:www\.|m\.|mobile\.)/, "");
    if (host === "github.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (
        parts.length !== 2 ||
        !parts.every(
          (part) => /^[\w.-]+$/.test(part) && ![".", ".."].includes(part),
        )
      )
        return null;
      const [owner, repo] = parts;
      const endpoint = new URL(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
      );
      const markdown = await read(endpoint, "application/vnd.github.raw+json");
      return {
        markdown,
        contentScope: "readme",
        metadata: { title: `${owner}/${repo}`, statusCode: 200 },
      };
    }
    if (host === "x.com" || host === "twitter.com") {
      const match = url.pathname.match(
        /^\/(?:[\w]+\/status|i\/web\/status)\/(\d+)(?:\/(?:photo|video)\/\d+)?\/?$/,
      );
      if (!match) return null;
      const endpoint = new URL("https://publish.x.com/oembed");
      endpoint.searchParams.set(
        "url",
        `https://x.com/i/web/status/${match[1]}`,
      );
      endpoint.searchParams.set("omit_script", "true");
      endpoint.searchParams.set("hide_thread", "true");
      endpoint.searchParams.set("dnt", "true");
      const data = JSON.parse(await read(endpoint)) as Record<string, unknown>;
      const html = text(data.html);
      // oEmbed attribution is outside <p>; use just the actual post paragraph.
      const paragraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
      if (!paragraph) return null;
      const markdown = convert(paragraph, {
        wordwrap: false,
        selectors: [
          { selector: "a", options: { ignoreHref: true } },
          { selector: "script", format: "skip" },
        ],
      }).trim();
      if (!markdown) return null;
      const author = text(data.author_name);
      return {
        markdown,
        contentScope: "post",
        metadata: {
          title: author ? `Post by ${author}` : "Saved X post",
          description: markdown,
          statusCode: 200,
        },
      };
    }
    if (host === "youtube.com" || host === "youtu.be") {
      const id =
        host === "youtu.be"
          ? url.pathname.slice(1)
          : url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
      if (!id || !/^[\w-]{11}$/.test(id)) return null;
      const endpoint = new URL("https://www.youtube.com/oembed");
      endpoint.searchParams.set("url", `https://www.youtube.com/watch?v=${id}`);
      endpoint.searchParams.set("format", "json");
      const data = JSON.parse(await read(endpoint)) as Record<string, unknown>;
      const title = text(data.title),
        author = text(data.author_name);
      if (!title) return null;
      return {
        contentScope: "metadata",
        metadata: {
          title,
          description: `${title}${author ? ` — ${author}` : ""}. Video details only; no transcript was available.`,
          ogImage: text(data.thumbnail_url),
          statusCode: 200,
        },
      };
    }
    return null;
  };
}
export const readPublicSource = createPublicSourceReader();
