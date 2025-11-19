CREATE INDEX "product_masters_type_active_idx" ON "product_masters" USING btree ("type","is_active");--> statement-breakpoint
CREATE INDEX "product_masters_category_active_idx" ON "product_masters" USING btree ("category_id","is_active");--> statement-breakpoint
CREATE INDEX "product_variants_master_active_idx" ON "product_variants" USING btree ("product_master_id","is_active");--> statement-breakpoint
CREATE INDEX "product_variants_cost_method_idx" ON "product_variants" USING btree ("cost_method");--> statement-breakpoint
CREATE INDEX "product_type_raw_material_supplier_reorder_idx" ON "product_type_raw_material" USING btree ("primary_supplier_id","default_reorder_point");--> statement-breakpoint
CREATE INDEX "product_type_tool_status_next_maintenance_idx" ON "product_type_tool" USING btree ("status","next_maintenance_date");--> statement-breakpoint
CREATE INDEX "product_type_tool_assigned_status_idx" ON "product_type_tool" USING btree ("assigned_to_user_id","status");--> statement-breakpoint
CREATE INDEX "product_type_asset_assigned_location_idx" ON "product_type_asset" USING btree ("assigned_to_user_id","location");--> statement-breakpoint
CREATE INDEX "stock_levels_warehouse_quantity_idx" ON "stock_levels" USING btree ("warehouse_id","quantity");--> statement-breakpoint
CREATE INDEX "stock_moves_product_type_idx" ON "stock_moves" USING btree ("product_id","type");--> statement-breakpoint
CREATE INDEX "stock_moves_product_created_idx" ON "stock_moves" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_moves_source_created_idx" ON "stock_moves" USING btree ("source_warehouse_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_moves_target_created_idx" ON "stock_moves" USING btree ("target_warehouse_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_settings_warehouse_reorder_idx" ON "stock_settings" USING btree ("warehouse_id","reorder_point");--> statement-breakpoint
CREATE INDEX "stock_lots_status_expiry_idx" ON "stock_lots" USING btree ("status","expiry_date");--> statement-breakpoint
CREATE INDEX "stock_lots_variant_status_idx" ON "stock_lots" USING btree ("product_variant_id","status");--> statement-breakpoint
CREATE INDEX "stock_lots_warehouse_status_idx" ON "stock_lots" USING btree ("warehouse_id","status");--> statement-breakpoint
CREATE INDEX "cost_variance_variant_created_idx" ON "cost_variances" USING btree ("product_variant_id","created_at");