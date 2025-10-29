import employeesModel from "@serv/models/EmployeesModel";
import { UpdateEmployeeReq } from "@serv/models/interfaces/EmployeeInterface";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid employee ID" },
        { status: 400 },
      );
    }

    const employee = await employeesModel.getEmployeeById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch employee" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid employee ID" },
        { status: 400 },
      );
    }

    const body: Omit<UpdateEmployeeReq, "id"> = await request.json();

    const employee = await employeesModel.updateEmployee(id, body);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update employee" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid employee ID" },
        { status: 400 },
      );
    }

    const employee = await employeesModel.deleteEmployee(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete employee" },
      { status: 500 },
    );
  }
}
