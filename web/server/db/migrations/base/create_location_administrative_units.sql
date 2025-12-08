-- Migration: Create location_administrative_units table
-- Tạo bảng location_administrative_units

-- ============================================
-- Location Administrative Units
-- ============================================
CREATE TABLE IF NOT EXISTS "location_administrative_units" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"country_id" uuid NOT NULL,
	"code" varchar(50),
	"name" jsonb NOT NULL,
	"type" varchar(20) NOT NULL,
	"level" integer NOT NULL,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "location_administrative_units" ADD CONSTRAINT "location_administrative_units_country_id_location_countries_id_fk" 
FOREIGN KEY ("country_id") REFERENCES "public"."location_countries"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "location_administrative_units" ADD CONSTRAINT "location_administrative_units_parent_id_location_administrative_units_id_fk" 
FOREIGN KEY ("parent_id") REFERENCES "public"."location_administrative_units"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "location_administrative_units_country_idx" ON "location_administrative_units" USING btree ("country_id");
CREATE INDEX IF NOT EXISTS "location_administrative_units_parent_idx" ON "location_administrative_units" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "location_administrative_units_level_idx" ON "location_administrative_units" USING btree ("level");
CREATE INDEX IF NOT EXISTS "location_administrative_units_type_idx" ON "location_administrative_units" USING btree ("type");
CREATE INDEX IF NOT EXISTS "location_administrative_units_active_idx" ON "location_administrative_units" USING btree ("is_active");

