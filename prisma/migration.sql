-- =====================================================
-- Migration: Old schema → New schema
-- Run this in Supabase SQL Editor (or via psql)
-- =====================================================
BEGIN;

-- ============================================
-- 1. Create new tables
-- ============================================

CREATE TABLE IF NOT EXISTS "moneyjournal"."category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "deleted_at" TIMESTAMP(6),
    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "moneyjournal"."wallet_payment_source" (
    "wallet_id" UUID NOT NULL,
    "payment_source_id" UUID NOT NULL,
    CONSTRAINT "wallet_payment_source_pkey" PRIMARY KEY ("wallet_id", "payment_source_id")
);

-- ============================================
-- 2. Add new columns to transaction
-- ============================================

ALTER TABLE "moneyjournal"."transaction"
    ADD COLUMN IF NOT EXISTS "category_id" UUID,
    ADD COLUMN IF NOT EXISTS "wallet_id" UUID;

-- ============================================
-- 3. Create categories from old transaction & wallet data
-- ============================================

-- Insert categories from transaction.category (per user)
INSERT INTO "moneyjournal"."category" ("user_id", "name", "icon", "color")
SELECT DISTINCT tx."user_id", tx."category", 'tag', '#6366f1'
FROM "moneyjournal"."transaction" tx
WHERE tx."category" IS NOT NULL
  AND tx."user_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "moneyjournal"."category" c
    WHERE c."user_id" = tx."user_id" AND c."name" = tx."category"
  );

-- Insert categories from wallet.category (per user)
INSERT INTO "moneyjournal"."category" ("user_id", "name", "icon", "color")
SELECT DISTINCT w."user_id", w."category", 'tag', '#6366f1'
FROM "moneyjournal"."wallet" w
WHERE w."category" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "moneyjournal"."category" c
    WHERE c."user_id" = w."user_id" AND c."name" = w."category"
  );

-- ============================================
-- 4. Set category_id on transactions
-- ============================================

UPDATE "moneyjournal"."transaction" tx
SET "category_id" = c."id"
FROM "moneyjournal"."category" c
WHERE tx."user_id" = c."user_id"
  AND tx."category" = c."name"
  AND tx."category_id" IS NULL;

-- ============================================
-- 5. Set wallet_id on transactions (from savingsContainer)
-- ============================================

UPDATE "moneyjournal"."transaction"
SET "wallet_id" = "savingsContainer"::uuid
WHERE "savingsContainer" IS NOT NULL;

-- For isSavings transactions without savingsContainer,
-- assign to the first wallet of that user
UPDATE "moneyjournal"."transaction" tx
SET "wallet_id" = w."id"
FROM (
  SELECT DISTINCT ON ("user_id") "id", "user_id"
  FROM "moneyjournal"."wallet"
  WHERE "deleted_at" IS NULL
  ORDER BY "user_id", "created_at" ASC
) w
WHERE tx."wallet_id" IS NULL
  AND tx."isSavings" = true
  AND tx."user_id" = w."user_id";

-- ============================================
-- 6. Fix NULL payment_source_ids
--    Assign each user's first payment source as default
-- ============================================

-- Create a default payment source for users who have none
INSERT INTO "moneyjournal"."payment_source" ("user_id", "name", "icon", "default")
SELECT u."id", 'Default', 'wallet', true
FROM "moneyjournal"."users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "moneyjournal"."payment_source" ps
  WHERE ps."user_id" = u."id"
);

-- Update transactions with NULL payment_source_id
UPDATE "moneyjournal"."transaction" tx
SET "payment_source_id" = (
  SELECT ps."id"
  FROM "moneyjournal"."payment_source" ps
  WHERE ps."user_id" = tx."user_id"
  ORDER BY ps."created_at" ASC
  LIMIT 1
)
WHERE tx."payment_source_id" IS NULL;

-- ============================================
-- 7. Link wallets to their default payment source
-- ============================================

INSERT INTO "moneyjournal"."wallet_payment_source" ("wallet_id", "payment_source_id")
SELECT w."id", w."default_payment_source_id"
FROM "moneyjournal"."wallet" w
WHERE w."default_payment_source_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Also link ALL user payment sources to ALL user wallets
INSERT INTO "moneyjournal"."wallet_payment_source" ("wallet_id", "payment_source_id")
SELECT w."id", ps."id"
FROM "moneyjournal"."wallet" w
JOIN "moneyjournal"."payment_source" ps ON ps."user_id" = w."user_id"
WHERE ps."deleted_at" IS NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. Add NOT NULL constraints & foreign keys
-- ============================================

-- Add foreign keys
-- (drop old constraint names that may exist from before table rename)
ALTER TABLE "moneyjournal"."wallet"
    DROP CONSTRAINT IF EXISTS "monthly_outcome_default_payment_source_id_fkey";

ALTER TABLE "moneyjournal"."category"
    ADD CONSTRAINT "category_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "moneyjournal"."users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "moneyjournal"."transaction"
    DROP CONSTRAINT IF EXISTS "transaction_payment_source_id_fkey";

ALTER TABLE "moneyjournal"."transaction"
    ADD CONSTRAINT "transaction_payment_source_id_fkey"
    FOREIGN KEY ("payment_source_id") REFERENCES "moneyjournal"."payment_source"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "moneyjournal"."transaction"
    ADD CONSTRAINT "transaction_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "moneyjournal"."category"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "moneyjournal"."transaction"
    ADD CONSTRAINT "transaction_wallet_id_fkey"
    FOREIGN KEY ("wallet_id") REFERENCES "moneyjournal"."wallet"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "moneyjournal"."wallet_payment_source"
    ADD CONSTRAINT "wallet_payment_source_wallet_id_fkey"
    FOREIGN KEY ("wallet_id") REFERENCES "moneyjournal"."wallet"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "moneyjournal"."wallet_payment_source"
    ADD CONSTRAINT "wallet_payment_source_payment_source_id_fkey"
    FOREIGN KEY ("payment_source_id") REFERENCES "moneyjournal"."payment_source"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 9. Drop old columns
-- ============================================

ALTER TABLE "moneyjournal"."transaction"
    DROP COLUMN IF EXISTS "category",
    DROP COLUMN IF EXISTS "isSavings",
    DROP COLUMN IF EXISTS "savingsContainer";

ALTER TABLE "moneyjournal"."wallet"
    DROP COLUMN IF EXISTS "category",
    DROP COLUMN IF EXISTS "default_payment_source_id";

COMMIT;
