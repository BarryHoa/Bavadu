CREATE TABLE "product_type_goods" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_sale_price" numeric(18, 4),
	"default_purchase_price" numeric(18, 4),
	"weight" numeric(10, 2),
	"dimensions" jsonb,
	"color" varchar(50),
	"style" varchar(100),
	"expiry_date" timestamp with time zone,
	"expiry_tracking" boolean DEFAULT false,
	"storage_conditions" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_goods_product_variant_id_unique" UNIQUE("product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "product_type_raw_material" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_purchase_price" numeric(18, 4),
	"specifications" jsonb,
	"quality_standard" text,
	"primary_supplier_id" uuid,
	"lead_time_days" integer,
	"safety_stock" numeric(14, 2),
	"default_reorder_point" numeric(14, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_raw_material_product_variant_id_unique" UNIQUE("product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "product_type_finished_good" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_sale_price" numeric(18, 4),
	"default_manufacturing_cost" numeric(18, 4),
	"bom_id" uuid,
	"production_time" integer,
	"production_unit" varchar(50),
	"quality_standard" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_finished_good_product_variant_id_unique" UNIQUE("product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "product_type_consumable" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_purchase_price" numeric(18, 4),
	"default_min_stock_level" numeric(14, 2),
	"default_reorder_point" numeric(14, 2),
	"expiry_tracking" boolean DEFAULT false,
	"storage_conditions" text,
	"packaging_unit" varchar(50),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_consumable_product_variant_id_unique" UNIQUE("product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "product_type_tool" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"serial_number" varchar(100),
	"model_number" varchar(100),
	"purchase_date" timestamp with time zone,
	"purchase_price" numeric(18, 4),
	"warranty_period_months" integer,
	"maintenance_interval_days" integer,
	"last_maintenance_date" timestamp with time zone,
	"next_maintenance_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'in-use',
	"location" varchar(200),
	"assigned_to_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_tool_product_variant_id_unique" UNIQUE("product_variant_id"),
	CONSTRAINT "product_type_tool_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "product_type_asset" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"asset_code" varchar(100),
	"purchase_date" timestamp with time zone,
	"purchase_price" numeric(18, 4),
	"depreciation_method" varchar(30),
	"useful_life_years" integer,
	"residual_value" numeric(18, 4),
	"depreciation_rate" numeric(5, 2),
	"depreciation_start_date" timestamp with time zone,
	"current_value" numeric(18, 4),
	"location" varchar(200),
	"assigned_to_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_asset_product_variant_id_unique" UNIQUE("product_variant_id"),
	CONSTRAINT "product_type_asset_asset_code_unique" UNIQUE("asset_code")
);
--> statement-breakpoint
CREATE TABLE "product_type_service" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"default_service_price" numeric(18, 4),
	"unit" varchar(20),
	"duration" integer,
	"detailed_description" text,
	"special_requirements" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_type_service_product_variant_id_unique" UNIQUE("product_variant_id")
);
--> statement-breakpoint
CREATE TABLE "stock_settings" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"min_stock_level" numeric(14, 2),
	"reorder_point" numeric(14, 2),
	"max_stock_level" numeric(14, 2),
	"lead_time" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_lots" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"lot_number" varchar(100),
	"batch_number" varchar(100),
	"purchase_order_line_id" uuid,
	"purchase_date" timestamp with time zone NOT NULL,
	"unit_cost" numeric(18, 4) NOT NULL,
	"quantity_received" numeric(14, 2) NOT NULL,
	"quantity_available" numeric(14, 2) NOT NULL,
	"quantity_reserved" numeric(14, 2) DEFAULT '0' NOT NULL,
	"expiry_date" timestamp with time zone,
	"manufacture_date" timestamp with time zone,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_lot_moves" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"stock_move_id" uuid NOT NULL,
	"stock_lot_id" uuid NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"unit_cost" numeric(18, 4) NOT NULL,
	"total_cost" numeric(18, 4) NOT NULL,
	"move_type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cost_variances" (
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
--> statement-breakpoint
ALTER TABLE "product_masters" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "product_masters" ALTER COLUMN "brand" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "cost_method" varchar(20) DEFAULT 'average' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "standard_cost" numeric(18, 4);--> statement-breakpoint
ALTER TABLE "stock_levels" ADD COLUMN "average_cost" numeric(18, 4) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD COLUMN "total_cost_value" numeric(18, 4) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_type_goods" ADD CONSTRAINT "product_type_goods_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_raw_material" ADD CONSTRAINT "product_type_raw_material_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_finished_good" ADD CONSTRAINT "product_type_finished_good_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_consumable" ADD CONSTRAINT "product_type_consumable_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_tool" ADD CONSTRAINT "product_type_tool_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_asset" ADD CONSTRAINT "product_type_asset_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_service" ADD CONSTRAINT "product_type_service_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_settings" ADD CONSTRAINT "stock_settings_product_id_product_masters_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_masters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_settings" ADD CONSTRAINT "stock_settings_warehouse_id_stock_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_warehouse_id_stock_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."stock_warehouses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_lots" ADD CONSTRAINT "stock_lots_purchase_order_line_id_purchase_order_lines_id_fk" FOREIGN KEY ("purchase_order_line_id") REFERENCES "public"."purchase_order_lines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_lot_moves" ADD CONSTRAINT "stock_lot_moves_stock_move_id_stock_moves_id_fk" FOREIGN KEY ("stock_move_id") REFERENCES "public"."stock_moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_lot_moves" ADD CONSTRAINT "stock_lot_moves_stock_lot_id_stock_lots_id_fk" FOREIGN KEY ("stock_lot_id") REFERENCES "public"."stock_lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_variances" ADD CONSTRAINT "cost_variances_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_variances" ADD CONSTRAINT "cost_variances_purchase_order_line_id_purchase_order_lines_id_fk" FOREIGN KEY ("purchase_order_line_id") REFERENCES "public"."purchase_order_lines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_type_goods_variant_idx" ON "product_type_goods" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_type_goods_expiry_idx" ON "product_type_goods" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "product_type_raw_material_variant_idx" ON "product_type_raw_material" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_type_raw_material_supplier_idx" ON "product_type_raw_material" USING btree ("primary_supplier_id");--> statement-breakpoint
CREATE INDEX "product_type_finished_good_variant_idx" ON "product_type_finished_good" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_type_finished_good_bom_idx" ON "product_type_finished_good" USING btree ("bom_id");--> statement-breakpoint
CREATE INDEX "product_type_consumable_variant_idx" ON "product_type_consumable" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_type_tool_variant_idx" ON "product_type_tool" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_type_tool_serial_idx" ON "product_type_tool" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX "product_type_tool_status_idx" ON "product_type_tool" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_type_tool_assigned_idx" ON "product_type_tool" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "product_type_asset_variant_idx" ON "product_type_asset" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_type_asset_code_idx" ON "product_type_asset" USING btree ("asset_code");--> statement-breakpoint
CREATE INDEX "product_type_asset_assigned_idx" ON "product_type_asset" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "product_type_service_variant_idx" ON "product_type_service" USING btree ("product_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_settings_product_warehouse_unique" ON "stock_settings" USING btree ("product_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_settings_product_idx" ON "stock_settings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_settings_warehouse_idx" ON "stock_settings" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_settings_min_stock_idx" ON "stock_settings" USING btree ("min_stock_level");--> statement-breakpoint
CREATE INDEX "stock_lots_variant_warehouse_idx" ON "stock_lots" USING btree ("product_variant_id","warehouse_id");--> statement-breakpoint
CREATE INDEX "stock_lots_lot_number_idx" ON "stock_lots" USING btree ("lot_number");--> statement-breakpoint
CREATE INDEX "stock_lots_purchase_date_idx" ON "stock_lots" USING btree ("purchase_date");--> statement-breakpoint
CREATE INDEX "stock_lots_expiry_idx" ON "stock_lots" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "stock_lots_status_idx" ON "stock_lots" USING btree ("status");--> statement-breakpoint
CREATE INDEX "stock_lots_purchase_order_line_idx" ON "stock_lots" USING btree ("purchase_order_line_id");--> statement-breakpoint
CREATE INDEX "stock_lot_moves_stock_move_idx" ON "stock_lot_moves" USING btree ("stock_move_id");--> statement-breakpoint
CREATE INDEX "stock_lot_moves_stock_lot_idx" ON "stock_lot_moves" USING btree ("stock_lot_id");--> statement-breakpoint
CREATE INDEX "stock_lot_moves_type_idx" ON "stock_lot_moves" USING btree ("move_type");--> statement-breakpoint
CREATE INDEX "cost_variance_variant_idx" ON "cost_variances" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "cost_variance_purchase_line_idx" ON "cost_variances" USING btree ("purchase_order_line_id");