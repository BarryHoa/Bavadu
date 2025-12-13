-- Migration: Create menu_items table
-- Tạo bảng menu_items để quản lý menu động với permission-based visibility

CREATE TABLE "md_base"."menu_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"module" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"parent_id" uuid,
	"name" jsonb NOT NULL,
	"icon" varchar(50),
	"order" integer DEFAULT 0 NOT NULL,
	"badge" varchar(20),
	"path" varchar(255),
	"as" varchar(255),
	"type" varchar(20) DEFAULT 'mdl' NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"required_permissions" jsonb,
	"permission_mode" varchar(20) DEFAULT 'any',
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "menu_items_module_key_unique" UNIQUE("module", "key")
);

CREATE INDEX "menu_items_parent_idx" ON "md_base"."menu_items"("parent_id");
CREATE INDEX "menu_items_module_idx" ON "md_base"."menu_items"("module");
CREATE INDEX "menu_items_active_idx" ON "md_base"."menu_items"("is_active", "is_visible");
CREATE INDEX "menu_items_order_idx" ON "md_base"."menu_items"("order");

-- Add foreign key constraint for self-referencing parent_id
ALTER TABLE "md_base"."menu_items"
	ADD CONSTRAINT "menu_items_parent_id_fk"
	FOREIGN KEY ("parent_id") 
	REFERENCES "md_base"."menu_items"("id") 
	ON DELETE CASCADE;

