import { convert } from "html-to-text";

/** Bound storage and provider inputs without throwing away the end of long pages. */
export const MAX_CONTENT_CHARACTERS = 80_000;
export const SUMMARY_CONTEXT_CHARACTERS = 20_000;

export interface ScrapedDocument {
  markdown?: string;
  contentScope?: "post" | "readme" | "metadata" | "provided";
  metadata?: {
    title?: string;
    ogTitle?: string;
    description?: string;
    ogDescription?: string;
    ogImage?: string;
    statusCode?: number;
    [key: string]: unknown;
  };
}

export function cleanText(text: string): string {
  const seen = new Set<string>();
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (
        /^(?:accept (?:all )?cookies|reject (?:all )?cookies|manage (?:cookies|preferences)|skip to (?:main )?content|all rights reserved)[.!\s]*$/i.test(
          trimmed,
        )
      )
        return false;
      if (
        /^(?:\[)?(?:skip to (?:main )?content|sitemap|open in app|sign in|sign up)(?:\]\([^)]*\))?$/i.test(
          trimmed,
        )
      )
        return false;
      if (/^[|:\-\s]+$/.test(trimmed)) return false;
      // Remove repeated navigation, while preserving repeated prose and code indentation.
      if (trimmed.length < 180 && /\]\(https?:\/\//.test(trimmed)) {
        if (seen.has(trimmed)) return false;
        seen.add(trimmed);
      }
      return true;
    })
    .join("\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function selectContext(text: string, budget: number): string {
  if (text.length <= budget) return text;
  const marker = "\n\n[… excerpt …]\n\n";
  const available = Math.max(0, budget - marker.length * 2);
  const beginning = Math.floor(available * 0.5);
  const middle = Math.floor(available * 0.25);
  const end = available - beginning - middle;
  const midpoint = Math.floor(text.length / 2 - middle / 2);
  return (
    text.slice(0, beginning) +
    marker +
    text.slice(midpoint, midpoint + middle) +
    marker +
    text.slice(-end)
  );
}

function metadataText(value: unknown): string {
  return typeof value === "string"
    ? cleanText(value).replace(/\s+/g, " ").trim()
    : "";
}

export function extractDocument(url: string, document: ScrapedDocument) {
  const metadata = document.metadata || {};
  if (document.contentScope === "provided") {
    const content = selectContext(
      cleanText(document.markdown || ""),
      MAX_CONTENT_CHARACTERS,
    );
    return {
      title:
        metadataText(metadata.title).slice(0, 200) || new URL(url).hostname,
      content,
      metadataDescription: "",
      thumbnail: undefined,
      extractionStatus: "content" as const,
      contentCoverage: "partial" as const,
      coverageNote:
        "The user supplied this text. Summarize only these notes or caption, not unseen page or video content.",
    };
  }
  const hostname = new URL(url).hostname.replace(/^(?:www\.|m\.|mobile\.)/, "");
  const socialPost =
    document.contentScope === "post" ||
    ["x.com", "twitter.com", "instagram.com", "linkedin.com"].includes(
      hostname,
    );
  let markdown = cleanText(document.markdown || "");
  let partial = false;
  let coverageNote = "";
  const paywall =
    /^(?:#{1,6}\s*)?(?:create an account to read(?:[\s\u00a0]+the)?[\s\u00a0]+full[\s\u00a0]+story|subscribe to (?:keep|continue) reading|this post is for paid subscribers)[.!\s]*$/im.exec(
      markdown,
    );
  if (paywall) {
    markdown = markdown.slice(0, paywall.index).trim();
    partial = true;
    coverageNote = "Only the publicly visible preview was available.";
  }
  const discussion =
    /^#{2,6}\s+(?:Discussion about this post|Try These .* Recipes Next:|More One Pot Pasta Recipes)\s*$/im.exec(
      markdown,
    );
  if (discussion) markdown = markdown.slice(0, discussion.index).trim();
  // Empty social templates are not post text, even when headings exceed a length threshold.
  if (["x.com", "twitter.com"].includes(hostname))
    markdown = markdown
      .replace(/^#{1,6}\s*(?:X\/Twitter Post|Post|Top Comments)\s*$/gim, "")
      .replace(/^No top comments were returned[.!\s]*$/gim, "")
      .trim();
  if (
    ["youtube.com", "youtu.be"].includes(hostname) &&
    document.contentScope !== "metadata"
  ) {
    const transcript = /^#{1,6}\s+(?:Transcript|Captions)\s*$/im.exec(markdown);
    const transcriptText = transcript
      ? markdown.slice(transcript.index + transcript[0].length).trim()
      : "";
    if (
      transcriptText.length < 100 ||
      /^(?:no (?:transcript|captions)|transcript (?:is )?unavailable)/i.test(
        transcriptText,
      )
    ) {
      partial = true;
      coverageNote =
        "Only the video description was available, not a transcript.";
    }
  }
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1];
  const title = (
    metadataText(metadata.ogTitle) ||
    metadataText(metadata.title) ||
    metadataText(heading) ||
    new URL(url).hostname
  ).slice(0, 200);
  let description = (
    metadataText(metadata.ogDescription) || metadataText(metadata.description)
  ).slice(0, 1000);
  if (
    socialPost &&
    /^(?:from breaking news|make the most of your professional life|create an account or log in to instagram|join instagram)/i.test(
      description,
    )
  )
    description = "";
  const genericTitle =
    /^(?:X\/Twitter Post|X|Twitter|Instagram|LinkedIn|YouTube)$/i.test(title);
  const blocked =
    (metadata.statusCode || 200) >= 400 ||
    /^(?:just a moment[.!…]*|access denied|attention required[.!…]*|sign in(?: to .+)?|log in(?: to .+)?|login(?: .+)?|page not found|security verification)$/i.test(
      title,
    ) ||
    (markdown.length < 2000 &&
      /^(?:#\s*)?(?:verify you are human|enable javascript and cookies to continue|access denied)[.!\s]*$/im.test(
        markdown,
      ));
  if (blocked) description = "";
  const content = blocked
    ? ""
    : selectContext(markdown, MAX_CONTENT_CHARACTERS);
  const hasContent =
    document.contentScope !== "metadata" &&
    content.length >= (socialPost ? 20 : 100);
  const coverage =
    blocked || (!content && !description && genericTitle)
      ? ("unavailable" as const)
      : hasContent
        ? partial
          ? ("partial" as const)
          : ("full" as const)
        : description || content
          ? ("metadata" as const)
          : ("unavailable" as const);
  return {
    contentCoverage: coverage,
    coverageNote,
    title:
      blocked || (coverage === "unavailable" && genericTitle)
        ? new URL(url).hostname
        : title,
    content,
    metadataDescription: blocked ? "" : description,
    thumbnail: blocked ? undefined : httpImage(metadata.ogImage),
    extractionStatus: hasContent
      ? ("content" as const)
      : description || content
        ? ("metadata" as const)
        : ("unavailable" as const),
  };
}

function httpImage(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function fallbackSummary(content: string, description: string): string {
  if (description) return description;
  // An honest excerpt is more useful than invented details when an LLM is unavailable.
  const plain = convert(content, {
    wordwrap: false,
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
  })
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain)
    return "The page content could not be extracted. Open the original link to read it.";
  return plain.length <= 900 ? plain : plain.slice(0, 897).trimEnd() + "…";
}

export function documentEmbeddingText(item: {
  title: string;
  description?: string | null;
  link: string;
  extractedContent?: string | null;
}): string {
  return `URL: ${item.link}\nSummary: ${item.description || ""}\nPage content:\n${selectContext(item.extractedContent || "", 12_000)}`;
}
