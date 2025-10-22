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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
} from "lucide-react";
import { useState } from "react";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const attendanceData = [
    {
      id: 1,
      name: "John Doe",
      department: "Engineering",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      status: "present",
      hours: "9h 0m",
      overtime: "0h 0m",
    },
    {
      id: 2,
      name: "Jane Smith",
      department: "Product",
      checkIn: "08:45 AM",
      checkOut: "05:30 PM",
      status: "present",
      hours: "8h 45m",
      overtime: "0h 15m",
    },
    {
      id: 3,
      name: "Mike Johnson",
      department: "Design",
      checkIn: "09:15 AM",
      checkOut: "06:15 PM",
      status: "late",
      hours: "9h 0m",
      overtime: "0h 0m",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      department: "HR",
      checkIn: "08:30 AM",
      checkOut: "05:45 PM",
      status: "present",
      hours: "9h 15m",
      overtime: "0h 15m",
    },
    {
      id: 5,
      name: "David Brown",
      department: "Engineering",
      checkIn: "-",
      checkOut: "-",
      status: "absent",
      hours: "0h 0m",
      overtime: "0h 0m",
    },
  ];

  const filteredData = attendanceData.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "absent":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return CheckCircle;
      case "late":
        return AlertCircle;
      case "absent":
        return XCircle;
      default:
        return Clock;
    }
  };

  const stats = [
    { label: "Present", value: "142", color: "success" },
    { label: "Late", value: "8", color: "warning" },
    { label: "Absent", value: "6", color: "danger" },
    { label: "Total", value: "156", color: "primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-gray-600">
            Track employee attendance and working hours
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="bordered" startContent={<Download size={16} />}>
            Export
          </Button>
          <Button color="primary" startContent={<Calendar size={16} />}>
            Mark Attendance
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
                <Calendar className={`w-5 h-5 text-${stat.color}-600`} />
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
              label="Select Date"
              value={selectedDate}
              onChange={setSelectedDate}
              className="flex-1"
            />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Clock size={16} />}
              className="flex-1"
            />
            <Button variant="bordered" startContent={<Filter size={16} />}>
              Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Attendance Records</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Attendance table">
            <TableHeader>
              <TableColumn>EMPLOYEE</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>CHECK IN</TableColumn>
              <TableColumn>CHECK OUT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>HOURS</TableColumn>
              <TableColumn>OVERTIME</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => {
                const StatusIcon = getStatusIcon(record.status);
                return (
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
                      <p className="font-medium">{record.checkIn}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{record.checkOut}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={getStatusColor(record.status)}
                        variant="flat"
                        startContent={<StatusIcon size={12} />}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{record.hours}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-orange-600">
                        {record.overtime}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
