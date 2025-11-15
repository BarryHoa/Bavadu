"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { IBaseInput } from "@base/client/components";
import {
  Search,
  Package,
  Users,
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Zap,
  Code,
  Database,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { moduleClient } from "@/lib/module-client";
import { ModuleInfo } from "@/lib/module-registry";

export default function ModuleManagementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is system-admin
    const checkAuthorization = () => {
      // Mock authorization check - replace with actual auth logic
      const userRole = localStorage.getItem("userRole") || "user";
      const isSystemAdmin = userRole === "system-admin";

      if (!isSystemAdmin) {
        router.push("/workspace/modules");

        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      const loadModules = async () => {
        const installedModules = await moduleClient.getInstalledModules();

        setModules(installedModules);
      };

      loadModules();
    }
  }, [isAuthorized]);

  const filteredModules = moduleClient.searchModules(searchTerm, modules);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Business: "primary",
      Sales: "success",
      Operations: "warning",
      Analytics: "secondary",
      Productivity: "primary",
      Finance: "success",
      Security: "danger",
      Automation: "warning",
    };

    return colors[category] || "default";
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Package,
      Users,
      BarChart3,
      Calendar,
      DollarSign,
      Shield,
      Zap,
      Code,
      Database,
      FileText,
    };

    return iconMap[iconName] || Package;
  };

  const handleUninstall = async (moduleId: string) => {
    const success = await moduleClient.uninstallModule(moduleId);

    if (success) {
      const installedModules = await moduleClient.getInstalledModules();

      setModules(installedModules);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. Only system
              administrators can manage modules.
            </p>
            <Button
              color="primary"
              onClick={() => router.push("/workspace/modules")}
            >
              Go Back
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="flex items-center space-x-2">
            <IBaseInput
              className="flex-1"
              placeholder="Search modules..."
              size="sm"
              startContent={<Search size={16} />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Button color="primary" size="sm" title="Add module" variant="flat">
              Add
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {filteredModules.map((module) => {
          const ModuleIcon = getIconComponent(module.icon);

          return (
            <Card
              key={module.name}
              className="hover:shadow-md transition-shadow"
            >
              <CardBody className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-lg bg-primary-100">
                    <ModuleIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">{module.name}</h3>
                    <p className="text-xs text-gray-500">v{module.version}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {module.description}
                    </p>
                    <Badge
                      color={getCategoryColor(module.category) as any}
                      size="sm"
                      variant="flat"
                    >
                      {module.category}
                    </Badge>
                  </div>
                  <Button
                    className="w-full"
                    color="danger"
                    size="sm"
                    startContent={<Trash2 size={12} />}
                    variant="flat"
                    onClick={() =>
                      handleUninstall(
                        module.name.toLowerCase().replace(/\s+/g, ""),
                      )
                    }
                  >
                    Uninstall
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No modules found" : "No modules installed"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Install some modules to get started"}
            </p>
            {searchTerm ? (
              <Button
                color="primary"
                variant="flat"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={() => (window.location.href = "/workspace/modules")}
              >
                Browse Modules
              </Button>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
