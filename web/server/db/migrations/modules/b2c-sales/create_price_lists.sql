-- Migration: Create price_lists table
-- Tạo bảng price_lists

CREATE TABLE "mdl_sale_b2c"."price_lists" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"type" varchar(20) DEFAULT 'standard' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"currency_id" uuid,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_to" timestamp with time zone,
	"is_default" boolean DEFAULT false NOT NULL,
	"applicable_to" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "price_lists_code_unique" UNIQUE("code"),
	CONSTRAINT "price_lists_valid_dates_check" CHECK (("mdl_sale_b2c"."price_lists"."valid_to" IS NULL) OR ("mdl_sale_b2c"."price_lists"."valid_to" >= "mdl_sale_b2c"."price_lists"."valid_from")),
	CONSTRAINT "price_lists_valid_to_required_check" CHECK (("mdl_sale_b2c"."price_lists"."type" = 'standard') OR ("mdl_sale_b2c"."price_lists"."valid_to" IS NOT NULL))
);
