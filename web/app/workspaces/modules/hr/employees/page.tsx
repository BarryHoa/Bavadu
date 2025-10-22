"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useState } from "react";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const employees = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      position: "Software Engineer",
      department: "Engineering",
      status: "active",
      avatar: "https://i.pravatar.cc/150?u=john",
      joinDate: "2023-01-15",
      salary: "$75,000",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      position: "Product Manager",
      department: "Product",
      status: "active",
      avatar: "https://i.pravatar.cc/150?u=jane",
      joinDate: "2022-08-20",
      salary: "$95,000",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      position: "UX Designer",
      department: "Design",
      status: "on-leave",
      avatar: "https://i.pravatar.cc/150?u=mike",
      joinDate: "2023-03-10",
      salary: "$65,000",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      position: "HR Manager",
      department: "Human Resources",
      status: "active",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      joinDate: "2021-11-05",
      salary: "$85,000",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@company.com",
      position: "DevOps Engineer",
      department: "Engineering",
      status: "active",
      avatar: "https://i.pravatar.cc/150?u=david",
      joinDate: "2023-06-12",
      salary: "$80,000",
    },
  ];

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search size={16} />}
              className="flex-1"
            />
            <Button variant="bordered" startContent={<Filter size={16} />}>
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
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={employee.avatar}
                        name={employee.name}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">{employee.name}</p>
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
                    <Badge variant="flat" color="primary">
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
                    <p className="font-medium">{employee.salary}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="warning"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
