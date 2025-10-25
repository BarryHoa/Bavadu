"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  UserPlus,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function HRPage() {
  const stats = [
    {
      title: "Total Employees",
      value: "156",
      change: "+12%",
      icon: Users,
      color: "primary",
    },
    {
      title: "Active Today",
      value: "142",
      change: "+5%",
      icon: Clock,
      color: "success",
    },
    {
      title: "Monthly Payroll",
      value: "$45,230",
      change: "+8%",
      icon: DollarSign,
      color: "warning",
    },
    {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+2%",
      icon: TrendingUp,
      color: "secondary",
    },
  ];

  const quickActions = [
    {
      title: "Add Employee",
      description: "Register new employee",
      icon: UserPlus,
      href: "/hr/employees/new",
      color: "primary",
    },
    {
      title: "Mark Attendance",
      description: "Record daily attendance",
      icon: Calendar,
      href: "/hr/attendance",
      color: "success",
    },
    {
      title: "Generate Payroll",
      description: "Process monthly payroll",
      icon: FileText,
      href: "/hr/payroll",
      color: "warning",
    },
    {
      title: "HR Settings",
      description: "Configure HR policies",
      icon: Settings,
      href: "/hr/settings",
      color: "secondary",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Human Resources</h1>
          <p className="text-gray-600">Manage your workforce efficiently</p>
        </div>
        <Badge color="primary" content="HR Module" variant="flat">
          <Button color="primary" variant="flat">
            Module Active
          </Button>
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardBody className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-full bg-${action.color}-100`}>
                      <action.icon
                        className={`w-6 h-6 text-${action.color}-600`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <UserPlus className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New employee added</p>
                <p className="text-sm text-gray-600">
                  John Doe joined as Software Engineer
                </p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Attendance marked</p>
                <p className="text-sm text-gray-600">
                  142 employees checked in today
                </p>
              </div>
              <span className="text-sm text-gray-500">1 hour ago</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-full">
                <DollarSign className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Payroll processed</p>
                <p className="text-sm text-gray-600">
                  Monthly payroll for 156 employees
                </p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
