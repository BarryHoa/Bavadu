"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Building2, Plus, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

export default function OrgChartPage() {
  const [zoomLevel, setZoomLevel] = useState(100);

  // Mock organizational data
  const orgData = {
    ceo: {
      id: 1,
      name: "John Smith",
      position: "CEO",
      department: "Executive",
      avatar: "JS",
      reports: ["cto", "cfo", "chro"],
    },
    cto: {
      id: 2,
      name: "Sarah Johnson",
      position: "CTO",
      department: "Technology",
      avatar: "SJ",
      reports: ["dev-lead", "qa-lead"],
    },
    cfo: {
      id: 3,
      name: "Mike Davis",
      position: "CFO",
      department: "Finance",
      avatar: "MD",
      reports: ["accounting-manager"],
    },
    chro: {
      id: 4,
      name: "Lisa Wilson",
      position: "CHRO",
      department: "Human Resources",
      avatar: "LW",
      reports: ["hr-manager"],
    },
    "dev-lead": {
      id: 5,
      name: "Alex Chen",
      position: "Lead Developer",
      department: "Technology",
      avatar: "AC",
      reports: [],
    },
    "qa-lead": {
      id: 6,
      name: "Emma Brown",
      position: "QA Lead",
      department: "Technology",
      avatar: "EB",
      reports: [],
    },
    "accounting-manager": {
      id: 7,
      name: "David Lee",
      position: "Accounting Manager",
      department: "Finance",
      avatar: "DL",
      reports: [],
    },
    "hr-manager": {
      id: 8,
      name: "Maria Garcia",
      position: "HR Manager",
      department: "Human Resources",
      avatar: "MG",
      reports: [],
    },
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span className="text-lg font-semibold">
                Organization Structure
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              startContent={<ZoomOut className="w-4 h-4" />}
              variant="light"
              onClick={handleZoomOut}
            >
              Zoom Out
            </Button>
            <span className="text-sm text-gray-500">{zoomLevel}%</span>
            <Button
              size="sm"
              startContent={<ZoomIn className="w-4 h-4" />}
              variant="light"
              onClick={handleZoomIn}
            >
              Zoom In
            </Button>
            <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
              Add Position
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div
            className="overflow-auto p-6"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top left",
            }}
          >
            {/* CEO Level */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold">JS</span>
                  </div>
                  <h3 className="font-bold text-lg">{orgData.ceo.name}</h3>
                  <p className="text-sm opacity-90">{orgData.ceo.position}</p>
                  <Chip className="mt-2" color="secondary" size="sm">
                    {orgData.ceo.department}
                  </Chip>
                </div>
              </div>
            </div>

            {/* Connection Lines */}
            <div className="flex justify-center mb-8">
              <div className="w-px h-8 bg-gray-300" />
            </div>

            {/* C-Level */}
            <div className="flex justify-center gap-8 mb-8">
              {[orgData.cto, orgData.cfo, orgData.chro].map((exec, index) => (
                <div
                  key={exec.id}
                  className="bg-white border-2 border-gray-200 p-4 rounded-lg shadow-sm"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-sm font-bold text-blue-600">
                        {exec.avatar}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm">{exec.name}</h4>
                    <p className="text-xs text-gray-600">{exec.position}</p>
                    <Chip
                      className="mt-1"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      {exec.department}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>

            {/* Department Teams */}
            <div className="grid grid-cols-3 gap-8">
              {/* Technology Team */}
              <div className="space-y-4">
                <h4 className="font-semibold text-center text-gray-700">
                  Technology
                </h4>
                <div className="space-y-2">
                  {[orgData["dev-lead"], orgData["qa-lead"]].map((member) => (
                    <div key={member.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600">
                            {member.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-600">
                            {member.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finance Team */}
              <div className="space-y-4">
                <h4 className="font-semibold text-center text-gray-700">
                  Finance
                </h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-yellow-600">
                          DL
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {orgData["accounting-manager"].name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {orgData["accounting-manager"].position}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HR Team */}
              <div className="space-y-4">
                <h4 className="font-semibold text-center text-gray-700">
                  Human Resources
                </h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">
                          MG
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {orgData["hr-manager"].name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {orgData["hr-manager"].position}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
