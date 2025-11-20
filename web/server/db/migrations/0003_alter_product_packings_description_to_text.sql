-- Alter product_packings.description from jsonb to text
-- Migration data: extract text from jsonb (prefer 'en', fallback to 'vi')

--> statement-breakpoint
-- Alter column type from jsonb to text and migrate existing data
ALTER TABLE "product_packings" 
ALTER COLUMN "description" TYPE text 
USING CASE
  WHEN "description" IS NULL THEN NULL::text
  WHEN "description"::jsonb ? 'en' THEN "description"::jsonb->>'en'
  WHEN "description"::jsonb ? 'vi' THEN "description"::jsonb->>'vi'
  ELSE NULL::text
END;

