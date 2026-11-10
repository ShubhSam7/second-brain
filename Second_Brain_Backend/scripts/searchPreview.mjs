/** Actual Express + Prisma checks on disposable PostgreSQL. External providers are disabled. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const db = new PGlite({ extensions: { vector, pg_trgm } });
await db.exec(`CREATE EXTENSION vector;
CREATE TABLE "User" (id text PRIMARY KEY,username text UNIQUE NOT NULL,password text NOT NULL,"createdAt" timestamp(3) DEFAULT now(),"updatedAt" timestamp(3) DEFAULT now());
CREATE TABLE "Content" (id text PRIMARY KEY,title text NOT NULL,link text NOT NULL,description text,type text NOT NULL DEFAULT 'other',category text NOT NULL DEFAULT 'other',domain text,thumbnail text,"userId" text NOT NULL REFERENCES "User"(id),"createdAt" timestamp(3) DEFAULT now(),"updatedAt" timestamp(3) DEFAULT now(),embedding vector(768),"embeddingGeneratedAt" timestamp(3));
CREATE TABLE "Link" (id text PRIMARY KEY,hash text UNIQUE NOT NULL,"userId" text UNIQUE NOT NULL REFERENCES "User"(id),"createdAt" timestamp(3) DEFAULT now());`);
await db.exec(
  await readFile(
    new URL("../prisma/search-index.sql", import.meta.url),
    "utf8",
  ),
);
await db.query('INSERT INTO "User" (id,username,password) VALUES ($1,$2,$3)', [
  "fixture-user",
  "preview-user",
  await bcrypt.hash("preview-password", 4),
]);
await db.query('INSERT INTO "User" (id,username,password) VALUES ($1,$2,$3)', [
  "fixture-other",
  "other-user",
  "unused",
]);
const socket = new PGLiteSocketServer({
  db,
  port: 43103,
  host: "127.0.0.1",
  maxConnections: 10,
});
await socket.start();
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:43103/postgres";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.JWT_SECRET = "isolated-search-preview-only";
process.env.VERCEL = "1";
for (const key of [
  "GOOGLE_API_KEY",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "FIRECRAWL_KEY",
])
  process.env[key] = "";
const { default: app } = await import("../dist/index.js");
const { default: prisma } = await import("../dist/db.js");
const server = app.listen(43102, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = "http://127.0.0.1:43102/api/v1";
const request = async (path, options = {}, token) => {
  const r = await fetch(base + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
  });
  return { status: r.status, body: await r.json() };
};
let vite;
const stop = async () => {
  await vite?.close();
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
  await socket.stop();
  await db.close();
};
if (process.argv.includes("--serve")) {
  const { createServer } =
    await import("../../Second_Brain_Frontend/node_modules/vite/dist/node/index.js");
  const root = new URL("../../Second_Brain_Frontend/", import.meta.url)
    .pathname;
  process.chdir(root);
  process.env.VITE_API_BASE_URL = base;
  vite = await createServer({
    root,
    server: { port: 5174, host: "127.0.0.1", strictPort: true },
  });
  await vite.listen();
  console.log(
    "Isolated preview: http://127.0.0.1:5174/signin (preview-user / preview-password). No user database or external providers.",
  );
  process.on("SIGINT", async () => {
    await stop();
    process.exit(0);
  });
} else {
  try {
    const login = await request("/signin", {
      method: "POST",
      body: JSON.stringify({
        username: "preview-user",
        password: "preview-password",
      }),
    });
    assert.equal(login.status, 200);
    const token = login.body.token;
    const created = await request(
      "/content",
      {
        method: "POST",
        body: JSON.stringify({
          link: "https://instagram.com/p/fixture/",
          sourceText:
            "Grow basil and mint on a sunny balcony. These herbs need light and regular watering.",
        }),
      },
      token,
    );
    assert.equal(created.status, 201);
    assert.equal(created.body.processing.inputSource, "provided");
    assert.equal(created.body.processing.indexed, false);
    let found = await request("/brain/search?q=balcony%20herbs", {}, token);
    assert.equal(found.status, 200);
    assert.equal(found.body.results[0].id, created.body.content.id);
    assert.equal(found.body.semanticAvailable, false);
    const edited = await request(
      `/content/${created.body.content.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          title: "Fixing a puncture",
          sourceText:
            "Repair a bicycle puncture with a spare tube and tire levers. Check the tire for sharp objects.",
        }),
      },
      token,
    );
    assert.equal(edited.status, 200);
    found = await request("/brain/search?q=puncture%20repair", {}, token);
    assert.equal(found.body.results[0].id, created.body.content.id);
    assert.equal(
      (await request("/brain/search?q=balcony%20herbs", {}, token)).body.results
        .length,
      0,
    );
    const stranger = jwt.sign({ id: "fixture-other" }, process.env.JWT_SECRET);
    assert.equal(
      (await request("/brain/search?q=puncture", {}, stranger)).body.results
        .length,
      0,
    );
    assert.equal(
      (
        await request(
          `/content/${created.body.content.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              sourceText: "Trying to replace another user’s private bookmark.",
            }),
          },
          stranger,
        )
      ).status,
      404,
    );
    const linkOnly = await request(
      "/content",
      {
        method: "POST",
        body: JSON.stringify({ link: "https://linkedin.com/posts/fixture" }),
      },
      token,
    );
    assert.equal(linkOnly.status, 201);
    assert.equal(linkOnly.body.processing.extraction, "unavailable");
    console.log(
      "API integration passed: sign-in, capture, keyword fallback, update, stale-text removal, user isolation, and link-only fallback.",
    );
  } finally {
    await stop();
  }
  process.exit(0);
}
