"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Package,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Modules",
      value: "8",
      change: "+2",
      icon: Package,
      color: "primary",
    },
    {
      title: "Active Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "success",
    },
    {
      title: "System Health",
      value: "98.5%",
      change: "+0.5%",
      icon: Activity,
      color: "success",
    },
    {
      title: "Uptime",
      value: "99.9%",
      change: "Stable",
      icon: Clock,
      color: "primary",
    },
  ];

  const quickActions = [
    {
      title: "Manage Modules",
      description: "Install, uninstall, and configure modules",
      icon: Settings,
      href: "/workspace/modules/managements",
      color: "primary",
    },
    {
      title: "View Analytics",
      description: "System performance and usage analytics",
      icon: BarChart3,
      href: "/workspace/analytics",
      color: "secondary",
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      href: "/workspace/users",
      color: "success",
    },
  ];

  const recentActivity = [
    {
      action: "Module installed",
      module: "HR Management",
      time: "2 hours ago",
      icon: Package,
      color: "success",
    },
    {
      action: "User logged in",
      user: "john.doe@company.com",
      time: "3 hours ago",
      icon: Users,
      color: "primary",
    },
    {
      action: "System backup",
      status: "Completed",
      time: "6 hours ago",
      icon: Activity,
      color: "success",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to your workspace dashboard</p>
        </div>
        <Badge content="System" color="primary" variant="flat">
          <Button color="primary" variant="flat">
            Dashboard Module
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`p-2 bg-${activity.color}-100 rounded-full`}>
                  <activity.icon
                    className={`w-4 h-4 text-${activity.color}-600`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-600">
                    {activity.module || activity.user || activity.status}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
