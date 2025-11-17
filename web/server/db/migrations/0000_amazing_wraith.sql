CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
  SELECT gen_random_uuid();
$$ LANGUAGE sql STABLE;
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"avatar" varchar(512),
	"gender" varchar(10),
	"date_of_birth" timestamp with time zone,
	"bio" varchar(120),
	"first_name" varchar(50),
	"last_name" varchar(50),
	"phones" varchar(20)[],
	"addresses" varchar(225)[],
	"emails" varchar(255)[],
	"position" varchar(100),
	"department" varchar(100),
	"joined_at" timestamp with time zone,
	"salary" varchar(50),
	"address" jsonb,
	"notes" varchar(255),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "users_login" (
	"user_id" uuid NOT NULL,
	"username" varchar(50),
	"email" varchar(255),
	"phone" varchar(20),
	"password_hash" varchar(255) NOT NULL,
	"last_login_at" timestamp with time zone,
	"last_login_ip" varchar(45),
	"last_login_user_agent" varchar(255),
	"last_login_location" varchar(255),
	"last_login_device" varchar(255),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "users_login_username_unique" UNIQUE("username"),
	CONSTRAINT "users_login_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dynamic_entities" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"model" varchar(30) NOT NULL,
	"data_type" varchar(20) NOT NULL,
	"options" jsonb,
	"default_value" jsonb,
	"is_required" boolean DEFAULT false NOT NULL,
	"validation" jsonb,
	"use_in" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "product_masters" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"image" text,
	"description" text,
	"type" varchar(20) NOT NULL,
	"features" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"brand" text,
	"category_id" uuid,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "product_masters_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_master_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" text,
	"images" jsonb,
	"sku" varchar(100),
	"barcode" varchar(100),
	"manufacturer" jsonb,
	"base_uom_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "product_packings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"parent_id" uuid,
	"level" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "product_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "units_of_measure" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" jsonb NOT NULL,
	"symbol" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "uom_conversions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"uom_id" uuid NOT NULL,
	"conversion_ratio" numeric(15, 6) NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"vendor_name" varchar(128) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"expected_date" timestamp with time zone,
	"warehouse_id" uuid,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(8) DEFAULT 'USD',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "purchase_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" varchar(256),
	"quantity_ordered" numeric(14, 2) DEFAULT '0' NOT NULL,
	"quantity_received" numeric(14, 2) DEFAULT '0' NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"customer_name" varchar(128) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"warehouse_id" uuid,
	"expected_date" timestamp with time zone,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(8) DEFAULT 'USD',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "sales_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" varchar(256),
	"quantity_ordered" numeric(14, 2) DEFAULT '0' NOT NULL,
	"quantity_delivered" numeric(14, 2) DEFAULT '0' NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_warehouses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"type_code" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"company_id" uuid,
	"manager_id" uuid,
	"contact_id" uuid,
	"address" jsonb NOT NULL,
	"valuation_method" varchar(10) DEFAULT 'FIFO' NOT NULL,
	"min_stock" numeric(18, 4) DEFAULT '0' NOT NULL,
	"max_stock" numeric(18, 4),
	"account_inventory" varchar(30),
	"account_adjustment" varchar(30),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_warehouses_status_check" CHECK ("stock_warehouses"."status" IN ('ACTIVE', 'MAINTENANCE', 'SUSPENDED', 'CLOSED')),
	CONSTRAINT "stock_warehouses_valuation_check" CHECK ("stock_warehouses"."valuation_method" IN ('FIFO', 'LIFO', 'AVG')),
	CONSTRAINT "stock_warehouses_min_stock_check" CHECK ("stock_warehouses"."min_stock"::numeric >= 0),
	CONSTRAINT "stock_warehouses_min_max_check" CHECK (("stock_warehouses"."max_stock" IS NULL) OR ("stock_warehouses"."max_stock"::numeric >= "stock_warehouses"."min_stock"::numeric))
);
--> statement-breakpoint
CREATE TABLE "stock_levels" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity" numeric(14, 2) DEFAULT '0' NOT NULL,
	"reserved_quantity" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_moves" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"type" varchar(32) NOT NULL,
	"source_warehouse_id" uuid,
	"target_warehouse_id" uuid,
	"reference" varchar(128),
	"note" varchar(256),
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36)
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
ALTER TABLE "users_login" ADD CONSTRAINT "users_login_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dynamic_entities" ADD CONSTRAINT "dynamic_entities_parent_id_dynamic_entities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dynamic_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_masters" ADD CONSTRAINT "product_masters_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_master_id_product_masters_id_fk" FOREIGN KEY ("product_master_id") REFERENCES "public"."product_masters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_base_uom_id_units_of_measure_id_fk" FOREIGN KEY ("base_uom_id") REFERENCES "public"."units_of_measure"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_packings" ADD CONSTRAINT "product_packings_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_administrative_units" ADD CONSTRAINT "location_administrative_units_country_id_location_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."location_countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_administrative_units" ADD CONSTRAINT "location_administrative_units_parent_id_location_administrative_units_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."location_administrative_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uom_conversions" ADD CONSTRAINT "uom_conversions_uom_id_units_of_measure_id_fk" FOREIGN KEY ("uom_id") REFERENCES "public"."units_of_measure"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_order_id_purchase_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_product_id_product_masters_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_product_id_product_masters_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_warehouses" ADD CONSTRAINT "stock_warehouses_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_warehouses" ADD CONSTRAINT "stock_warehouses_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_product_id_product_masters_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_warehouse_id_stock_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_product_id_product_masters_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_source_warehouse_id_stock_warehouses_id_fk" FOREIGN KEY ("source_warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_target_warehouse_id_stock_warehouses_id_fk" FOREIGN KEY ("target_warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_department_idx" ON "users" USING btree ("department");--> statement-breakpoint
CREATE INDEX "users_joined_idx" ON "users" USING btree ("joined_at");--> statement-breakpoint
CREATE INDEX "users_lastname_idx" ON "users" USING btree ("last_name");--> statement-breakpoint
CREATE INDEX "users_login_user_id_idx" ON "users_login" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_login_phone_idx" ON "users_login" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_login_last_login_idx" ON "users_login" USING btree ("last_login_at");--> statement-breakpoint
CREATE INDEX "dynamic_entities_model_idx" ON "dynamic_entities" USING btree ("model");--> statement-breakpoint
CREATE INDEX "dynamic_entities_parent_idx" ON "dynamic_entities" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "dynamic_entities_active_idx" ON "dynamic_entities" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_masters_category_idx" ON "product_masters" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_masters_type_idx" ON "product_masters" USING btree ("type");--> statement-breakpoint
CREATE INDEX "product_masters_active_idx" ON "product_masters" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_variants_master_idx" ON "product_variants" USING btree ("product_master_id");--> statement-breakpoint
CREATE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_variants_barcode_idx" ON "product_variants" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "product_variants_active_idx" ON "product_variants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_variants_base_uom_idx" ON "product_variants" USING btree ("base_uom_id");--> statement-breakpoint
CREATE INDEX "product_packings_variant_idx" ON "product_packings" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_packings_active_idx" ON "product_packings" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_attributes_variant_idx" ON "product_attributes" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_attributes_code_idx" ON "product_attributes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_categories_parent_idx" ON "product_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "product_categories_active_idx" ON "product_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "units_of_measure_symbol_idx" ON "units_of_measure" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "units_of_measure_active_idx" ON "units_of_measure" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "uom_conversions_uom_idx" ON "uom_conversions" USING btree ("uom_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_code_idx" ON "purchase_orders" USING btree ("code");--> statement-breakpoint
CREATE INDEX "purchase_orders_vendor_idx" ON "purchase_orders" USING btree ("vendor_name");--> statement-breakpoint
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchase_orders_warehouse_idx" ON "purchase_orders" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_expected_idx" ON "purchase_orders" USING btree ("expected_date");--> statement-breakpoint
CREATE INDEX "purchase_orders_created_idx" ON "purchase_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "purchase_order_lines_order_idx" ON "purchase_order_lines" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "purchase_order_lines_product_idx" ON "purchase_order_lines" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sales_orders_code_idx" ON "sales_orders" USING btree ("code");--> statement-breakpoint
CREATE INDEX "sales_orders_customer_idx" ON "sales_orders" USING btree ("customer_name");--> statement-breakpoint
CREATE INDEX "sales_orders_status_idx" ON "sales_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_orders_warehouse_idx" ON "sales_orders" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "sales_orders_expected_idx" ON "sales_orders" USING btree ("expected_date");--> statement-breakpoint
CREATE INDEX "sales_orders_created_idx" ON "sales_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sales_order_lines_order_idx" ON "sales_order_lines" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "sales_order_lines_product_idx" ON "sales_order_lines" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_warehouses_code_unique" ON "stock_warehouses" USING btree ("code");--> statement-breakpoint
CREATE INDEX "stock_warehouses_company_idx" ON "stock_warehouses" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "stock_warehouses_status_idx" ON "stock_warehouses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_warehouses_type_idx" ON "stock_warehouses" USING btree ("type_code");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_levels_product_warehouse_unique" ON "stock_levels" USING btree ("product_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_levels_product_idx" ON "stock_levels" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_levels_warehouse_idx" ON "stock_levels" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_moves_product_idx" ON "stock_moves" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_moves_type_idx" ON "stock_moves" USING btree ("type");--> statement-breakpoint
CREATE INDEX "stock_moves_source_idx" ON "stock_moves" USING btree ("source_warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_moves_target_idx" ON "stock_moves" USING btree ("target_warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_moves_created_idx" ON "stock_moves" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "location_administrative_units_country_idx" ON "location_administrative_units" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "location_administrative_units_parent_idx" ON "location_administrative_units" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "location_administrative_units_level_idx" ON "location_administrative_units" USING btree ("level");--> statement-breakpoint
CREATE INDEX "location_administrative_units_type_idx" ON "location_administrative_units" USING btree ("type");--> statement-breakpoint
CREATE INDEX "location_administrative_units_active_idx" ON "location_administrative_units" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "location_countries_code_idx" ON "location_countries" USING btree ("code");--> statement-breakpoint
CREATE INDEX "location_countries_is_active_idx" ON "location_countries" USING btree ("is_active");