"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Switch } from "@heroui/switch";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Shield,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function SecurityPage() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordComplexity: true,
    sessionTimeout: true,
    ipWhitelist: false,
    auditLogging: true,
    dataEncryption: true,
  });

  // Mock security events
  const securityEvents = [
    {
      id: 1,
      type: "login",
      user: "john.doe@company.com",
      ip: "192.168.1.100",
      timestamp: "2024-01-15 09:30:15",
      status: "success",
      location: "New York, NY",
    },
    {
      id: 2,
      type: "failed_login",
      user: "jane.smith@company.com",
      ip: "203.45.67.89",
      timestamp: "2024-01-15 08:45:22",
      status: "failed",
      location: "Unknown",
    },
    {
      id: 3,
      type: "password_change",
      user: "mike.wilson@company.com",
      ip: "192.168.1.105",
      timestamp: "2024-01-15 07:20:10",
      status: "success",
      location: "New York, NY",
    },
    {
      id: 4,
      type: "permission_change",
      user: "admin@company.com",
      ip: "192.168.1.1",
      timestamp: "2024-01-15 06:15:45",
      status: "success",
      location: "New York, NY",
    },
    {
      id: 5,
      type: "suspicious_activity",
      user: "unknown@external.com",
      ip: "45.67.89.123",
      timestamp: "2024-01-15 05:30:30",
      status: "blocked",
      location: "Unknown",
    },
  ];

  const handleSettingChange = (setting: string, value: boolean) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed_login":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "password_change":
        return <Key className="w-4 h-4 text-blue-500" />;
      case "permission_change":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "suspicious_activity":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      success: "success",
      failed: "danger",
      blocked: "warning",
    };

    return colors[status] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-lg font-semibold">Security Settings</span>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">
                    Require 2FA for all users
                  </p>
                </div>
                <Switch
                  isSelected={securitySettings.twoFactorAuth}
                  onValueChange={(value) =>
                    handleSettingChange("twoFactorAuth", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password Complexity</h4>
                  <p className="text-sm text-gray-600">
                    Enforce strong password requirements
                  </p>
                </div>
                <Switch
                  isSelected={securitySettings.passwordComplexity}
                  onValueChange={(value) =>
                    handleSettingChange("passwordComplexity", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Session Timeout</h4>
                  <p className="text-sm text-gray-600">
                    Auto-logout after inactivity
                  </p>
                </div>
                <Switch
                  isSelected={securitySettings.sessionTimeout}
                  onValueChange={(value) =>
                    handleSettingChange("sessionTimeout", value)
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">IP Whitelist</h4>
                  <p className="text-sm text-gray-600">
                    Restrict access to specific IPs
                  </p>
                </div>
                <Switch
                  isSelected={securitySettings.ipWhitelist}
                  onValueChange={(value) =>
                    handleSettingChange("ipWhitelist", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Audit Logging</h4>
                  <p className="text-sm text-gray-600">
                    Log all user activities
                  </p>
                </div>
                <Switch
                  isSelected={securitySettings.auditLogging}
                  onValueChange={(value) =>
                    handleSettingChange("auditLogging", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Encryption</h4>
                  <p className="text-sm text-gray-600">
                    Encrypt sensitive data at rest
                  </p>
                </div>
                <Switch
                  isSelected={securitySettings.dataEncryption}
                  onValueChange={(value) =>
                    handleSettingChange("dataEncryption", value)
                  }
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <span className="text-lg font-semibold">
              Recent Security Events
            </span>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Security events table">
            <TableHeader>
              <TableColumn>EVENT</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>IP ADDRESS</TableColumn>
              <TableColumn>TIMESTAMP</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>LOCATION</TableColumn>
            </TableHeader>
            <TableBody>
              {securityEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.type)}
                      <span className="capitalize">
                        {event.type.replace("_", " ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{event.user}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{event.ip}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{event.timestamp}</span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(event.status) as any}
                      size="sm"
                      variant="flat"
                    >
                      {event.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{event.location}</span>
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
