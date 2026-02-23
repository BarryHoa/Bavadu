-- Create employees table (HR extension of user; personal data on user)
CREATE TABLE IF NOT EXISTS "mdl_hrm"."employees" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid,
	"code" varchar(100) NOT NULL,
	"status" varchar(50) NOT NULL DEFAULT 'active',
	"type" varchar(50),
	"national_id" varchar(50),
	"tax_id" varchar(50),
	"position_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"manager_id" uuid,
	"hire_date" date NOT NULL,
	"probation_end_date" date,
	"base_salary" integer,
	"currency" varchar(10) DEFAULT 'VND',
	"location_id" uuid,
	"bank_account" varchar(100),
	"bank_name" varchar(255),
	"bank_branch" varchar(255),
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(50),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	CONSTRAINT "employees_employee_code_unique" UNIQUE("employee_code"),
	CONSTRAINT "employees_user_id_base_users_id_fk" FOREIGN KEY ("user_id")
		REFERENCES "md_base"."users"("id")
		ON DELETE SET NULL
);

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
	REFERENCES "md_base"."users"("id")
	ON DELETE NO ACTION;

-- Add indexes
CREATE INDEX IF NOT EXISTS "employees_user_idx" ON "mdl_hrm"."employees"("user_id");
CREATE INDEX IF NOT EXISTS "employees_code_idx" ON "mdl_hrm"."employees"("code");
CREATE INDEX IF NOT EXISTS "employees_position_idx" ON "mdl_hrm"."employees"("position_id");
CREATE INDEX IF NOT EXISTS "employees_department_idx" ON "mdl_hrm"."employees"("department_id");
CREATE INDEX IF NOT EXISTS "employees_manager_idx" ON "mdl_hrm"."employees"("manager_id");
CREATE INDEX IF NOT EXISTS "employees_status_idx" ON "mdl_hrm"."employees"("status");
