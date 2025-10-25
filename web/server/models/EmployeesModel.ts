import { db } from "@serv/db";
import { employees } from "@serv/db/schemas";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";

import { GetEmployeeListReq } from "./interfaces/EmployeeInterface";
import { ModalController } from "./ModalController";

class EmployeesModel extends ModalController {
  public async getEmployees(params: GetEmployeeListReq) {
    const { filters = {}, search, sorts = [], offset = 0, limit = 10 } = params;
    let query: any = db
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        phone: employees.phone,
        position: employees.position,
        department: employees.department,
        status: employees.status,
        avatar: employees.avatar,
        joinDate: employees.joinDate,
        salary: employees.salary,
        address: employees.address,
        dateOfBirth: employees.dateOfBirth,
        emergencyContact: employees.emergencyContact,
        emergencyPhone: employees.emergencyPhone,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        total: sql<number>`count(*) OVER()`,
      })
      .from(employees);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) =>
        eq(employees[key as keyof typeof employees._.columns], value as any)
      );

      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${employees.firstName} ILIKE ${"%" + search + "%"}`,
          sql`${employees.lastName} ILIKE ${"%" + search + "%"}`,
          sql`${employees.email} ILIKE ${"%" + search + "%"}`,
          sql`${employees.position} ILIKE ${"%" + search + "%"}`,
          sql`${employees.department} ILIKE ${"%" + search + "%"}`
        )
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        // check field in employees table
        const key = (employees as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(desc(employees.createdAt));
    }

    // Pagination
    query = query.limit(limit).offset(offset);

    let rows = [];

    try {
      rows = await query;
    } catch (error) {
      console.error("Database query error:", error);
    }

    const isHasData = rows?.length > 0;

    const total = isHasData ? Number(rows[0].total) : 0;

    const data = isHasData ? omit(rows, ["total"]) : 0;

    return {
      data: data,
      total,
    };
  }

  public async getEmployeeById(id: number) {
    try {
      const result = await db
        .select()
        .from(employees)
        .where(eq(employees.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  public async createEmployee(employeeData: any) {
    try {
      const result = await db
        .insert(employees)
        .values(employeeData)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateEmployee(id: number, employeeData: any) {
    try {
      const result = await db
        .update(employees)
        .set({ ...employeeData, updatedAt: new Date() })
        .where(eq(employees.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteEmployee(id: number) {
    try {
      const result = await db
        .delete(employees)
        .where(eq(employees.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }
}

const employeesModel = new EmployeesModel();

export default employeesModel;
