-- Migration: Create users_login table
-- Tạo bảng users_login

-- ============================================
-- Users Login
-- ============================================
CREATE TABLE IF NOT EXISTS "users_login" (
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

-- ============================================
-- Foreign Keys
-- ============================================
ALTER TABLE "users_login" ADD CONSTRAINT "users_login_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS "users_login_user_id_idx" ON "users_login" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "users_login_phone_idx" ON "users_login" USING btree ("phone");
CREATE INDEX IF NOT EXISTS "users_login_last_login_idx" ON "users_login" USING btree ("last_login_at");

