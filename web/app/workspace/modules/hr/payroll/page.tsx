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
import { Badge } from "@heroui/badge";
import { DatePicker } from "@heroui/date-picker";
import {
  DollarSign,
  Download,
  Send,
  Calculator,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const payrollData = [
    {
      id: 1,
      name: "John Doe",
      department: "Engineering",
      basicSalary: 6000,
      allowances: 500,
      deductions: 200,
      overtime: 300,
      netSalary: 6600,
      status: "paid",
    },
    {
      id: 2,
      name: "Jane Smith",
      department: "Product",
      basicSalary: 7500,
      allowances: 600,
      deductions: 250,
      overtime: 400,
      netSalary: 8250,
      status: "paid",
    },
    {
      id: 3,
      name: "Mike Johnson",
      department: "Design",
      basicSalary: 5500,
      allowances: 400,
      deductions: 180,
      overtime: 200,
      netSalary: 5920,
      status: "pending",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      department: "HR",
      basicSalary: 7000,
      allowances: 550,
      deductions: 220,
      overtime: 350,
      netSalary: 7680,
      status: "paid",
    },
    {
      id: 5,
      name: "David Brown",
      department: "Engineering",
      basicSalary: 6500,
      allowances: 500,
      deductions: 200,
      overtime: 250,
      netSalary: 7050,
      status: "pending",
    },
  ];

  const filteredData = payrollData.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  const stats = [
    { label: "Total Payroll", value: "$45,230", color: "primary" },
    { label: "Paid", value: "$32,930", color: "success" },
    { label: "Pending", value: "$12,300", color: "warning" },
    { label: "Employees", value: "156", color: "secondary" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-gray-600">Manage employee salaries and payments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="bordered" startContent={<Download size={16} />}>
            Export
          </Button>
          <Button color="primary" startContent={<Calculator size={16} />}>
            Calculate Payroll
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                <DollarSign className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <DatePicker
              label="Select Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              className="flex-1"
            />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Users size={16} />}
              className="flex-1"
            />
            <Button variant="bordered">Filter</Button>
          </div>
        </CardBody>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Payroll Records</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Payroll table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>BASIC SALARY</TableColumn>
              <TableColumn>ALLOWANCES</TableColumn>
              <TableColumn>DEDUCTIONS</TableColumn>
              <TableColumn>OVERTIME</TableColumn>
              <TableColumn>NET SALARY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="flat" color="primary">
                      {record.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {formatCurrency(record.basicSalary)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-green-600 font-medium">
                      +{formatCurrency(record.allowances)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-red-600 font-medium">
                      -{formatCurrency(record.deductions)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-orange-600 font-medium">
                      +{formatCurrency(record.overtime)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-lg">
                      {formatCurrency(record.netSalary)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge color={getStatusColor(record.status)} variant="flat">
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        title="View Details"
                      >
                        <Calculator size={16} />
                      </Button>
                      {record.status === "pending" && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="success"
                          title="Send Payment"
                        >
                          <Send size={16} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Payroll Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Gross</p>
              <p className="text-2xl font-bold text-green-600">$45,230</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600">$1,030</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Net Payroll</p>
              <p className="text-2xl font-bold text-blue-600">$44,200</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
