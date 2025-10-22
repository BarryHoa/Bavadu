"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Divider } from "@heroui/divider";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  Clock,
  Award,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id;

  // Mock employee data - in real app, fetch from API
  const employee = {
    id: employeeId,
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Software Engineer",
    department: "Engineering",
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=john",
    joinDate: "2023-01-15",
    salary: "$75,000",
    address: "123 Main St, San Francisco, CA 94102",
    manager: "Jane Smith",
    team: "Frontend Team",
    skills: ["React", "TypeScript", "Node.js", "AWS"],
    experience: "5 years",
    education: "Bachelor's in Computer Science",
    emergencyContact: {
      name: "Jane Doe",
      phone: "+1 (555) 987-6543",
      relationship: "Spouse",
    },
  };

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
      <div className="flex items-center space-x-4">
        <Button
          variant="light"
          startContent={<ArrowLeft size={16} />}
          className="p-2"
        >
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Employee Details</h1>
          <p className="text-gray-600">View and manage employee information</p>
        </div>
        <Button color="primary" startContent={<Edit size={16} />}>
          Edit Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Profile Card */}
        <Card className="lg:col-span-1">
          <CardBody className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar
                src={employee.avatar}
                name={employee.name}
                className="w-24 h-24"
                isBordered
                color="primary"
              />
              <div className="text-center">
                <h2 className="text-xl font-bold">{employee.name}</h2>
                <p className="text-gray-600">{employee.position}</p>
                <Badge
                  color={getStatusColor(employee.status)}
                  variant="flat"
                  className="mt-2"
                >
                  {employee.status}
                </Badge>
              </div>

              <Divider />

              <div className="w-full space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm">{employee.address}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Employee Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Employee ID
                  </label>
                  <p className="font-medium">#{employee.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Department
                  </label>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Join Date
                  </label>
                  <p className="font-medium">{employee.joinDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Experience
                  </label>
                  <p className="font-medium">{employee.experience}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Manager
                  </label>
                  <p className="font-medium">{employee.manager}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Team
                  </label>
                  <p className="font-medium">{employee.team}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Skills & Expertise</h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <Badge key={index} color="primary" variant="flat">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Name
                </label>
                <p className="font-medium">{employee.emergencyContact.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Phone
                </label>
                <p className="font-medium">{employee.emergencyContact.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Relationship
                </label>
                <p className="font-medium">
                  {employee.emergencyContact.relationship}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
