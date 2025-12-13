-- Migration: Create employees table
-- Tạo bảng employees

CREATE TABLE "mdl_hrm"."employees" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid,
	"employee_code" varchar(100) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"full_name" jsonb NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"date_of_birth" date,
	"gender" varchar(20),
	"national_id" varchar(50),
	"tax_id" varchar(50),
	"address" jsonb,
	"position_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"manager_id" uuid,
	"employment_status" varchar(50) DEFAULT 'active' NOT NULL,
	"employment_type" varchar(50),
	"hire_date" date NOT NULL,
	"probation_end_date" date,
	"base_salary" integer,
	"currency" varchar(10) DEFAULT 'VND',
	"location_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "employees_email_unique" UNIQUE("email"),
	CONSTRAINT "employees_user_id_base_users_id_fk" FOREIGN KEY ("user_id") 
		REFERENCES "md_base"."users"("id") 
		ON DELETE SET NULL
);

-- Add foreign key constraints
ALTER TABLE "mdl_hrm"."employees"
	ADD CONSTRAINT "employees_position_id_positions_id_fk"
	FOREIGN KEY ("position_id") 
	REFERENCES "mdl_hrm"."positions"("id") 
	ON DELETE RESTRICT;

ALTER TABLE "mdl_hrm"."employees"
	ADD CONSTRAINT "employees_department_id_departments_id_fk"
	FOREIGN KEY ("department_id") 
	REFERENCES "mdl_hrm"."departments"("id") 
	ON DELETE RESTRICT;

ALTER TABLE "mdl_hrm"."employees"
	ADD CONSTRAINT "employees_manager_id_employees_id_fk"
	FOREIGN KEY ("manager_id") 
	REFERENCES "mdl_hrm"."employees"("id") 
	ON DELETE NO ACTION;

-- Add indexes
CREATE INDEX IF NOT EXISTS "employees_user_idx" ON "mdl_hrm"."employees"("user_id");
CREATE INDEX IF NOT EXISTS "employees_code_idx" ON "mdl_hrm"."employees"("employee_code");
CREATE INDEX IF NOT EXISTS "employees_email_idx" ON "mdl_hrm"."employees"("email");
CREATE INDEX IF NOT EXISTS "employees_position_idx" ON "mdl_hrm"."employees"("position_id");
CREATE INDEX IF NOT EXISTS "employees_department_idx" ON "mdl_hrm"."employees"("department_id");
CREATE INDEX IF NOT EXISTS "employees_manager_idx" ON "mdl_hrm"."employees"("manager_id");
CREATE INDEX IF NOT EXISTS "employees_status_idx" ON "mdl_hrm"."employees"("employment_status");
CREATE INDEX IF NOT EXISTS "employees_active_idx" ON "mdl_hrm"."employees"("is_active");
