-- Migration: Create certificates table
-- Tạo bảng certificates

CREATE TABLE "mdl_hrm"."certificates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE CASCADE,
	"name" jsonb NOT NULL,
	"issuer" varchar(255) NOT NULL,
	"certificate_number" varchar(100),
	"issue_date" date NOT NULL,
	"expiry_date" date,
	"document_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);

CREATE INDEX IF NOT EXISTS "certificates_user_idx" ON "mdl_hrm"."certificates"("user_id");
CREATE INDEX IF NOT EXISTS "certificates_expiry_idx" ON "mdl_hrm"."certificates"("expiry_date");
CREATE INDEX IF NOT EXISTS "certificates_active_idx" ON "mdl_hrm"."certificates"("is_active");
