-- Migration: Create sessions table
-- Tạo bảng sessions

-- ============================================
-- Sessions
-- ============================================
CREATE TABLE IF NOT EXISTS "md_base"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "md_base"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "md_base"."users"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "md_base"."sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "md_base"."sessions" USING btree ("session_token");
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "md_base"."sessions" USING btree ("expires_at");

