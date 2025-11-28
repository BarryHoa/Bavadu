CREATE TABLE IF NOT EXISTS "currencies" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" jsonb NOT NULL,
	"symbol" varchar(10),
	"decimal_places" numeric(1,0) DEFAULT '2' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_code_idx" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_is_default_idx" ON "currencies" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_is_active_idx" ON "currencies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currencies_default_active_idx" ON "currencies" USING btree ("is_default","is_active");
--> statement-breakpoint
-- Partial unique index to ensure only one currency can be default at a time
CREATE UNIQUE INDEX IF NOT EXISTS "currencies_only_one_default_idx" 
ON "currencies" USING btree ("is_default") 
WHERE "is_default" = true;
--> statement-breakpoint
-- Currency Exchange Rate For VND table - Lưu lịch sử tỷ giá theo ngày
-- Tỷ giá luôn được quy đổi về VND (1 đơn vị currency = bao nhiêu VND)
-- Ví dụ: USD = 24500 VND, EUR = 26500 VND
-- VND luôn có tỷ giá = 1.0 (phải được đảm bảo ở application level)
CREATE TABLE IF NOT EXISTS "currency_exchange_rate_for_vnd" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"currency_id" uuid NOT NULL,
	"rate_date" date NOT NULL,
	"exchange_rate" numeric(18,8) NOT NULL,
	"source" varchar(100),
	"note" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "currency_exchange_rate_for_vnd_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE CASCADE
);
--> statement-breakpoint
-- Unique constraint: mỗi currency chỉ có một tỷ giá mỗi ngày
CREATE UNIQUE INDEX IF NOT EXISTS "currency_exchange_rate_for_vnd_currency_date_unique" 
ON "currency_exchange_rate_for_vnd" USING btree ("currency_id","rate_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currency_exchange_rate_for_vnd_currency_idx" ON "currency_exchange_rate_for_vnd" USING btree ("currency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currency_exchange_rate_for_vnd_date_idx" ON "currency_exchange_rate_for_vnd" USING btree ("rate_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "currency_exchange_rate_for_vnd_currency_date_idx" ON "currency_exchange_rate_for_vnd" USING btree ("currency_id","rate_date");

