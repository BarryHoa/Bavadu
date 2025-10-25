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
import {
  Search,
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { useState } from "react";

export default function PoliciesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for policies
  const policies = [
    {
      id: 1,
      title: "Employee Handbook",
      category: "General",
      version: "2.1",
      lastUpdated: "2024-01-15",
      status: "active",
      downloads: 245,
      description:
        "Comprehensive guide covering all company policies and procedures",
    },
    {
      id: 2,
      title: "Remote Work Policy",
      category: "Work Arrangements",
      version: "1.3",
      lastUpdated: "2024-02-10",
      status: "active",
      downloads: 189,
      description: "Guidelines for remote work arrangements and expectations",
    },
    {
      id: 3,
      title: "Code of Conduct",
      category: "Ethics",
      version: "3.0",
      lastUpdated: "2024-01-20",
      status: "active",
      downloads: 312,
      description:
        "Standards of behavior and ethical guidelines for all employees",
    },
    {
      id: 4,
      title: "Leave Policy",
      category: "Benefits",
      version: "2.5",
      lastUpdated: "2024-01-05",
      status: "active",
      downloads: 156,
      description: "Guidelines for vacation, sick leave, and other time off",
    },
    {
      id: 5,
      title: "Data Security Policy",
      category: "Security",
      version: "1.8",
      lastUpdated: "2023-12-15",
      status: "draft",
      downloads: 78,
      description: "Protection of company and customer data",
    },
    {
      id: 6,
      title: "Performance Review Policy",
      category: "HR",
      version: "1.2",
      lastUpdated: "2023-11-30",
      status: "archived",
      downloads: 134,
      description:
        "Process and guidelines for employee performance evaluations",
    },
  ];

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: "success",
      draft: "warning",
      archived: "default",
    };

    return colors[status] || "default";
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      General: "primary",
      "Work Arrangements": "secondary",
      Ethics: "danger",
      Benefits: "success",
      Security: "warning",
      HR: "default",
    };

    return colors[category] || "default";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-lg font-semibold">Policy Management</span>
            </div>
          </div>
          <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
            Add Policy
          </Button>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <Input
              className="max-w-sm"
              placeholder="Search policies..."
              startContent={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Table aria-label="Policies table">
            <TableHeader>
              <TableColumn>POLICY</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>VERSION</TableColumn>
              <TableColumn>LAST UPDATED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>DOWNLOADS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <h4 className="font-semibold">{policy.title}</h4>
                      <p className="text-sm text-gray-600">
                        {policy.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getCategoryColor(policy.category) as any}
                      size="sm"
                      variant="flat"
                    >
                      {policy.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{policy.version}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{policy.lastUpdated}</span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(policy.status) as any}
                      size="sm"
                      variant="flat"
                    >
                      {policy.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span className="text-sm">{policy.downloads}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        startContent={<Eye className="w-4 h-4" />}
                        variant="light"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        startContent={<Edit className="w-4 h-4" />}
                        variant="light"
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        startContent={<Trash2 className="w-4 h-4" />}
                        variant="light"
                      >
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
