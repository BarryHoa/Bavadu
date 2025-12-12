-- Migration: Create employees table
-- Tạo bảng employees

CREATE TABLE "mdl_hrm"."employees" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
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
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
