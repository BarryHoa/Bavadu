import employeesModel from "@serv/models/EmployeesModel";
import {
  CreateEmployeeReq,
  GetEmployeeListReq,
} from "@serv/models/interfaces/EmployeeInterface";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: GetEmployeeListReq = {
      search: searchParams.get("search") || undefined,
      offset: parseInt(searchParams.get("offset") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
    };

    // Parse filters
    const filters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("filter_")) {
        const filterKey = key.replace("filter_", "");
        filters[filterKey] = value;
      }
    });
    params.filters = Object.keys(filters).length > 0 ? filters : undefined;

    // Parse sorts
    const sortParam = searchParams.get("sort");
    if (sortParam) {
      try {
        params.sorts = JSON.parse(sortParam);
      } catch (e) {
        // Invalid sort format, ignore
      }
    }

    const result = await employeesModel.getEmployees(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEmployeeReq = await request.json();

    // Validate required fields
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.position ||
      !body.department ||
      !body.joinDate
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const employee = await employeesModel.createEmployee(body);

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
