"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Progress } from "@heroui/progress";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Dashboard() {
  const statsCards = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      changeType: "increase",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Users",
      value: "2,350",
      change: "+180.1%",
      changeType: "increase",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Sales",
      value: "12,234",
      change: "+19%",
      changeType: "increase",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Active Now",
      value: "573",
      change: "+201",
      changeType: "increase",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  const recentActivities = [
    {
      user: "John Doe",
      action: "created a new project",
      time: "2 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=john",
    },
    {
      user: "Jane Smith",
      action: "updated project settings",
      time: "5 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=jane",
    },
    {
      user: "Mike Johnson",
      action: "commented on a task",
      time: "10 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=mike",
    },
    {
      user: "Sarah Wilson",
      action: "completed a milestone",
      time: "1 hour ago",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="bordered">
            <Calendar size={16} className="mr-2" />
            This Month
          </Button>
          <Button color="primary">
            <ArrowUpRight size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === "increase" ? (
                        <ArrowUpRight
                          size={16}
                          className="text-green-600 mr-1"
                        />
                      ) : (
                        <ArrowDownRight
                          size={16}
                          className="text-red-600 mr-1"
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "increase"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
              >
                <Avatar size="sm" src={activity.avatar} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="light" className="w-full mt-4">
              View All Activity
            </Button>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Stats</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Project Progress
                </span>
                <span className="text-sm font-bold text-gray-900">75%</span>
              </div>
              <Progress value={75} color="primary" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Team Performance
                </span>
                <span className="text-sm font-bold text-gray-900">88%</span>
              </div>
              <Progress value={88} color="success" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Goal Achievement
                </span>
                <span className="text-sm font-bold text-gray-900">92%</span>
              </div>
              <Progress value={92} color="warning" />
            </div>

            <Divider />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Rating</span>
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">4.8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Page Views</span>
                <div className="flex items-center">
                  <Eye size={16} className="text-blue-500 mr-1" />
                  <span className="text-sm font-medium">12.5k</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
