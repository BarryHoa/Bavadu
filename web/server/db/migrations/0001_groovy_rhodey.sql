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
CREATE INDEX IF NOT EXISTS "product_type_goods_variant_idx" ON "product_type_goods" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_goods_expiry_idx" ON "product_type_goods" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_raw_material_variant_idx" ON "product_type_raw_material" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_raw_material_supplier_idx" ON "product_type_raw_material" USING btree ("primary_supplier_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_finished_good_variant_idx" ON "product_type_finished_good" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_finished_good_bom_idx" ON "product_type_finished_good" USING btree ("bom_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_consumable_variant_idx" ON "product_type_consumable" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_tool_variant_idx" ON "product_type_tool" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_tool_serial_idx" ON "product_type_tool" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_tool_status_idx" ON "product_type_tool" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_tool_assigned_idx" ON "product_type_tool" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_asset_variant_idx" ON "product_type_asset" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_asset_code_idx" ON "product_type_asset" USING btree ("asset_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_asset_assigned_idx" ON "product_type_asset" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_type_service_variant_idx" ON "product_type_service" USING btree ("product_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stock_settings_product_warehouse_unique" ON "stock_settings" USING btree ("product_id","warehouse_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_settings_product_idx" ON "stock_settings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_settings_warehouse_idx" ON "stock_settings" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_settings_min_stock_idx" ON "stock_settings" USING btree ("min_stock_level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lots_variant_warehouse_idx" ON "stock_lots" USING btree ("product_variant_id","warehouse_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lots_lot_number_idx" ON "stock_lots" USING btree ("lot_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lots_purchase_date_idx" ON "stock_lots" USING btree ("purchase_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lots_expiry_idx" ON "stock_lots" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lots_status_idx" ON "stock_lots" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lots_purchase_order_line_idx" ON "stock_lots" USING btree ("purchase_order_line_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lot_moves_stock_move_idx" ON "stock_lot_moves" USING btree ("stock_move_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lot_moves_stock_lot_idx" ON "stock_lot_moves" USING btree ("stock_lot_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_lot_moves_type_idx" ON "stock_lot_moves" USING btree ("move_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cost_variance_variant_idx" ON "cost_variances" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cost_variance_purchase_line_idx" ON "cost_variances" USING btree ("purchase_order_line_id");