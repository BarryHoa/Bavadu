-- Migration: Create cost_variances table
-- Tạo bảng cost_variances

-- ============================================
-- Cost Variances
-- ============================================
CREATE TABLE IF NOT EXISTS "cost_variances" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"purchase_order_line_id" uuid,
	"standard_cost" numeric(18, 4) NOT NULL,
	"actual_cost" numeric(18, 4) NOT NULL,
	"variance" numeric(18, 4) NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"total_variance" numeric(18, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "cost_variances" ADD CONSTRAINT "cost_variances_product_variant_id_product_variants_id_fk" 
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "cost_variances" ADD CONSTRAINT "cost_variances_purchase_order_line_id_purchase_order_lines_id_fk" 
FOREIGN KEY ("purchase_order_line_id") REFERENCES "public"."purchase_order_lines"("id") ON DELETE set null ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "cost_variance_variant_idx" ON "cost_variances" USING btree ("product_variant_id");
CREATE INDEX IF NOT EXISTS "cost_variance_purchase_line_idx" ON "cost_variances" USING btree ("purchase_order_line_id");
CREATE INDEX IF NOT EXISTS "cost_variance_variant_created_idx" ON "cost_variances" USING btree ("product_variant_id","created_at");

