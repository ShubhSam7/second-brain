CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Additive and repeatable: also supports existing installations with no Prisma migration baseline.
ALTER TABLE "Content"
  ADD COLUMN IF NOT EXISTS "extractedContent" TEXT,
  ADD COLUMN IF NOT EXISTS "embeddingModel" TEXT,
  ADD COLUMN IF NOT EXISTS "contentSource" TEXT NOT NULL DEFAULT 'link';

ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "searchDocument" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(domain, '') || ' ' || link), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce("extractedContent", '')), 'C')
  ) STORED;

ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "searchText" TEXT
  GENERATED ALWAYS AS (lower(title || ' ' || coalesce(description, '') || ' ' || coalesce(domain, '') || ' ' || link)) STORED;
CREATE INDEX IF NOT EXISTS "Content_searchText_idx" ON "Content" USING GIN ("searchText" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Content_searchDocument_idx" ON "Content" USING GIN ("searchDocument");
CREATE INDEX IF NOT EXISTS "Content_userId_embeddingModel_idx" ON "Content" ("userId", "embeddingModel");
