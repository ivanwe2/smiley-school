-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "date" DATE,
ADD COLUMN     "teacherId" TEXT;

-- Carry the old free-text teacher names over to the new teachers table
INSERT INTO "teachers" ("id", "name", "color", "order")
SELECT
    'mig_' || md5(t.name),
    t.name,
    (ARRAY['green', 'blue', 'red', 'purple', 'amber', 'teal'])[((t.rn - 1) % 6)::int + 1],
    (t.rn - 1)::int
FROM (
    SELECT d.name, ROW_NUMBER() OVER (ORDER BY d.name) AS rn
    FROM (
        SELECT DISTINCT btrim("teacher") AS name
        FROM "classes"
        WHERE "teacher" IS NOT NULL AND btrim("teacher") <> ''
    ) d
) t;

UPDATE "classes" c
SET "teacherId" = t."id"
FROM "teachers" t
WHERE btrim(c."teacher") = t."name";

-- Lessons used to be soft-deleted via isActive; they are now deleted outright
DELETE FROM "classes" WHERE "isActive" = false;

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "color",
DROP COLUMN "isActive",
DROP COLUMN "level",
DROP COLUMN "room",
DROP COLUMN "teacher";

-- AlterTable
ALTER TABLE "class_overrides" DROP COLUMN "overrideRoom",
ADD COLUMN     "newDate" DATE;

-- CreateIndex
CREATE INDEX "classes_date_idx" ON "classes"("date");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
