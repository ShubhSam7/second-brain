import test from "node:test";
import assert from "node:assert/strict";
import { createPublicSourceReader } from "../dist/services/sourceRetrieval.js";
import { createContentPipeline } from "../dist/services/aiPipeline.js";
import { extractDocument } from "../dist/services/contentText.js";

test("public GitHub repository links fetch the README rather than the website interface", async () => {
  let endpoint;
  const read = createPublicSourceReader(async (url, options) => {
    endpoint = url.href;
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Accept, "application/vnd.github.raw+json");
    return new Response("# Demo project\nA useful command-line tool.");
  });
  const result = await read(
    "https://github.com/example/demo?tab=readme-ov-file",
  );
  assert.equal(endpoint, "https://api.github.com/repos/example/demo/readme");
  assert.equal(result.contentScope, "readme");
  assert.match(result.markdown, /command-line/);
});

test("source readers never fetch arbitrary hosts or replace a specific GitHub file with a repo README", async () => {
  let calls = 0;
  const read = createPublicSourceReader(async () => {
    calls++;
    throw new Error("unexpected");
  });
  for (const url of [
    "https://github.com.evil.example/user/repo",
    "https://example.com",
    "https://github.com/example/demo/blob/main/code.ts",
    "https://github.com/example/demo/issues/3",
  ])
    assert.equal(await read(url), null);
  assert.equal(calls, 0);
});

test("X embeds retain the actual post and decode entities without executing embedded markup", async () => {
  const read = createPublicSourceReader(async () =>
    Response.json({
      author_name: "Sample Author",
      html: "<blockquote><p>Build small &amp; useful tools.<br>Keep learning.</p>— attribution<script>ignore()</script></blockquote>",
    }),
  );
  const result = await read("https://x.com/sample/status/1234567890");
  assert.match(result.markdown, /Build small & useful tools/);
  assert.doesNotMatch(result.markdown, /attribution|ignore/);
  assert.equal(
    extractDocument("https://x.com/sample/status/1234567890", result)
      .extractionStatus,
    "content",
  );
});

test("YouTube oEmbed is explicitly metadata, not a video transcript", async () => {
  const read = createPublicSourceReader(async () =>
    Response.json({
      title: "Understanding ecosystems",
      author_name: "Sample Channel",
      thumbnail_url: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
    }),
  );
  const result = await read("https://youtu.be/abcdefghijk");
  const extracted = extractDocument("https://youtu.be/abcdefghijk", result);
  assert.equal(extracted.extractionStatus, "metadata");
  assert.equal(extracted.contentCoverage, "metadata");
  assert.match(extracted.metadataDescription, /no transcript/);
});

test("empty social templates are unavailable instead of being summarized as posts", () => {
  const result = extractDocument("https://x.com/sample/status/1234567890", {
    markdown:
      "# X/Twitter Post\n\n## Post\n\n## Top Comments\n\nNo top comments were returned.",
    metadata: { title: "X/Twitter Post" },
  });
  assert.equal(result.extractionStatus, "unavailable");
  assert.equal(result.content, "");
});

test("short, genuine social posts bypass the article length threshold", async () => {
  let scrapeCalls = 0;
  const pipeline = createContentPipeline({
    publicSource: async () => ({
      markdown: "Practice a little every day. Keep a record.",
      contentScope: "post",
      metadata: { title: "Post by Sample Author" },
    }),
    scrape: async () => {
      scrapeCalls++;
      throw new Error("should not scrape");
    },
    summarize: async () => "Practice daily and track progress.",
  });
  const result = await pipeline("https://x.com/sample/status/1234567890");
  assert.equal(scrapeCalls, 0);
  assert.equal(result.summarySource, "ai");
  assert.equal(result.contentCoverage, "full");
});

test("paywalled Medium previews are labeled and the signup wall is excluded", async () => {
  const pipeline = createContentPipeline({
    scrape: async () => ({
      markdown:
        "# A useful article\n\n" +
        "The visible introduction explains a practical idea. ".repeat(5) +
        "\n\n## Create an account to read the full story.\nSign up and pay for access.",
      metadata: { title: "A useful article" },
    }),
    summarize: async () =>
      "The visible introduction discusses a practical idea.",
  });
  const result = await pipeline("https://medium.com/@sample/article");
  assert.equal(result.contentCoverage, "partial");
  assert.match(result.summary, /^From the available preview:/);
  assert.doesNotMatch(result.content, /pay for access/);
});

test("video descriptions are partial, while explicit transcripts are full source text", () => {
  const url = "https://www.youtube.com/watch?v=abcdefghijk";
  const description =
    "This video introduces practical ideas about ecosystems. ".repeat(5);
  assert.equal(
    extractDocument(url, {
      markdown: description,
      metadata: { title: "Ecosystems" },
    }).contentCoverage,
    "partial",
  );
  assert.equal(
    extractDocument(url, {
      markdown: description + "\n## Transcript\n" + description,
      metadata: { title: "Ecosystems" },
    }).contentCoverage,
    "full",
  );
});

test("newsletter discussion and recipe recommendations do not pollute the saved article", () => {
  for (const ending of [
    "#### Discussion about this post",
    "## Try These Chicken Pasta Recipes Next:",
  ]) {
    const result = extractDocument("https://blog.example/article", {
      markdown:
        "# Article\n" +
        "Useful main article content. ".repeat(5) +
        "\n" +
        ending +
        "\nUnrelated recommendations.",
      metadata: { title: "Article" },
    });
    assert.doesNotMatch(result.content, /Unrelated recommendations/);
    assert.match(result.content, /Useful main article/);
  }
});

test("login screens are unavailable even when their metadata contains a description", () => {
  const result = extractDocument("https://www.instagram.com/p/example/", {
    markdown: "Log in to see photos from your friends. ".repeat(8),
    metadata: {
      title: "Log in to Instagram",
      description: "Create an account or log in to Instagram.",
    },
  });
  assert.equal(result.extractionStatus, "unavailable");
  assert.equal(result.metadataDescription, "");
});

test("oversized model output is bounded without throwing away a successful extraction", async () => {
  const pipeline = createContentPipeline({
    scrape: async () => ({ markdown: "Useful source content. ".repeat(20) }),
    summarize: async () => "A useful sentence about the source. ".repeat(80),
  });
  const result = await pipeline("https://blog.example/article");
  assert.equal(result.summarySource, "ai");
  assert.ok(result.summary.length <= 1600);
});
