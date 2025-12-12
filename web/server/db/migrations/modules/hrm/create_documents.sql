-- Migration: Create documents table
-- Tạo bảng documents

CREATE TABLE "mdl_hrm"."documents" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"document_number" varchar(100),
	"document_type" varchar(50) NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb,
	"employee_id" uuid,
	"file_url" varchar(500) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"signed_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"is_digital_signature" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "documents_document_number_unique" UNIQUE("document_number")
);
