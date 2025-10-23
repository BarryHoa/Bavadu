"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Search, Plus, Shield, Users, Settings } from "lucide-react";
import { useState } from "react";

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for roles
  const roles = [
    {
      id: 1,
      name: "HR Manager",
      description: "Full access to HR functions",
      permissions: ["employees", "payroll", "attendance", "policies"],
      users: 5,
      status: "active",
    },
    {
      id: 2,
      name: "HR Assistant",
      description: "Limited access to employee data",
      permissions: ["employees"],
      users: 12,
      status: "active",
    },
    {
      id: 3,
      name: "Payroll Admin",
      description: "Access to payroll and salary functions",
      permissions: ["payroll"],
      users: 3,
      status: "active",
    },
    {
      id: 4,
      name: "Attendance Manager",
      description: "Manage attendance and leave",
      permissions: ["attendance"],
      users: 8,
      status: "active",
    },
    {
      id: 5,
      name: "Viewer",
      description: "Read-only access to employee data",
      permissions: ["employees"],
      users: 25,
      status: "active",
    },
  ];

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionColor = (permission: string) => {
    const colors: { [key: string]: string } = {
      employees: "primary",
      payroll: "success",
      attendance: "warning",
      policies: "secondary",
    };
    return colors[permission] || "default";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-lg font-semibold">Role Management</span>
            </div>
          </div>
          <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
            Add Role
          </Button>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4" />}
              className="max-w-sm"
            />
          </div>

          <Table aria-label="Roles table">
            <TableHeader>
              <TableColumn>ROLE NAME</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>PERMISSIONS</TableColumn>
              <TableColumn>USERS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {role.permissions.map((permission) => (
                        <Chip
                          key={permission}
                          size="sm"
                          color={getPermissionColor(permission) as any}
                          variant="flat"
                        >
                          {permission}
                        </Chip>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{role.users}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={role.status === "active" ? "success" : "danger"}
                      variant="flat"
                    >
                      {role.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="light">
                        Edit
                      </Button>
                      <Button size="sm" variant="light" color="danger">
                        Delete
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
