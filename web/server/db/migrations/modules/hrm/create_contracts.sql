-- Migration: Create contracts table
-- Tạo bảng contracts

CREATE TABLE "mdl_hrm"."contracts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"contract_number" varchar(100) NOT NULL,
	"employee_id" uuid NOT NULL,
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
