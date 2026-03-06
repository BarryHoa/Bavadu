-- Migration: Create contracts table
-- Tạo bảng contracts

CREATE TABLE "mdl_hrm"."contracts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"contract_number" varchar(100) NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "md_base"."users"("id") ON DELETE RESTRICT,
	"contract_type" varchar(50) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"base_salary" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'VND',
	"working_hours" integer DEFAULT 40,
	"probation_period" integer,
	"probation_end_date" date,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"document_url" varchar(500),
	"signed_date" date,
	"signed_by" uuid,
	"notes" text,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number")
);

CREATE INDEX IF NOT EXISTS "contracts_number_idx" ON "mdl_hrm"."contracts"("contract_number");
CREATE INDEX IF NOT EXISTS "contracts_user_idx" ON "mdl_hrm"."contracts"("user_id");
CREATE INDEX IF NOT EXISTS "contracts_type_idx" ON "mdl_hrm"."contracts"("contract_type");
CREATE INDEX IF NOT EXISTS "contracts_status_idx" ON "mdl_hrm"."contracts"("status");
CREATE INDEX IF NOT EXISTS "contracts_dates_idx" ON "mdl_hrm"."contracts"("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "contracts_active_idx" ON "mdl_hrm"."contracts"("is_active");
