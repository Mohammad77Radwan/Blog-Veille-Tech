-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Comment"
ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dislikes" INTEGER NOT NULL DEFAULT 0;

-- Backfill post likes from existing Like rows
UPDATE "Post" p
SET "likes" = COALESCE(l.cnt, 0)
FROM (
  SELECT "postId", COUNT(*)::int AS cnt
  FROM "Like"
  GROUP BY "postId"
) AS l
WHERE p."id" = l."postId";
