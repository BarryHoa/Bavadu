"use client";

import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Edit, Eye, Filter, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  status: string;
  avatar?: string;
  joinDate: string;
  salary?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employees");
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data || []);
      } else {
        setError(data.error || "Failed to fetch employees");
      }
    } catch (err) {
      setError("Failed to fetch employees");
      // console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setEmployees(employees.filter((emp) => emp.id !== id));
      } else {
        alert(data.error || "Failed to delete employee");
      }
    } catch (err) {
      alert("Failed to delete employee");
      // console.error("Error deleting employee:", err);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      `${employee.firstName} ${employee.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "on-leave":
        return "warning";
      case "inactive":
        return "danger";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading employees...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <Button color="primary" startContent={<Plus size={16} />}>
          Add Employee
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="flex-1"
              placeholder="Search employees..."
              startContent={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button startContent={<Filter size={16} />} variant="bordered">
              Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Employee List</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Employees table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>POSITION</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>JOIN DATE</TableColumn>
              <TableColumn>SALARY</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8" colSpan={7}>
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar
                          name={`${employee.firstName} ${employee.lastName}`}
                          size="sm"
                          src={employee.avatar}
                        />
                        <div>
                          <p className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{employee.position}</p>
                    </TableCell>
                    <TableCell>
                      <Badge color="primary" variant="flat">
                        {employee.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={getStatusColor(employee.status)}
                        variant="flat"
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{employee.joinDate}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {employee.salary ? `$${employee.salary}` : "N/A"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          isIconOnly
                          color="primary"
                          size="sm"
                          variant="light"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          color="warning"
                          size="sm"
                          variant="light"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
