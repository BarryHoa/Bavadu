CREATE TABLE "location_administrative_units" (
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
--> statement-breakpoint
CREATE TABLE "location_countries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(2) NOT NULL,
	"name" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "location_countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "stock_warehouses" DROP CONSTRAINT "stock_warehouses_status_check";--> statement-breakpoint
ALTER TABLE "stock_warehouses" DROP CONSTRAINT "stock_warehouses_valuation_check";--> statement-breakpoint
ALTER TABLE "location_administrative_units" ADD CONSTRAINT "location_administrative_units_country_id_location_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."location_countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_administrative_units" ADD CONSTRAINT "location_administrative_units_parent_id_location_administrative_units_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."location_administrative_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "location_administrative_units_country_idx" ON "location_administrative_units" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "location_administrative_units_parent_idx" ON "location_administrative_units" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "location_administrative_units_level_idx" ON "location_administrative_units" USING btree ("level");--> statement-breakpoint
CREATE INDEX "location_administrative_units_type_idx" ON "location_administrative_units" USING btree ("type");--> statement-breakpoint
CREATE INDEX "location_administrative_units_active_idx" ON "location_administrative_units" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "location_countries_code_idx" ON "location_countries" USING btree ("code");--> statement-breakpoint
CREATE INDEX "location_countries_is_active_idx" ON "location_countries" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "stock_warehouses" ADD CONSTRAINT "stock_warehouses_status_check" CHECK ("stock_warehouses"."status" IN ('ACTIVE', 'MAINTENANCE', 'SUSPENDED', 'CLOSED'));--> statement-breakpoint
ALTER TABLE "stock_warehouses" ADD CONSTRAINT "stock_warehouses_valuation_check" CHECK ("stock_warehouses"."valuation_method" IN ('FIFO', 'LIFO', 'AVG'));