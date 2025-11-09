export interface ModuleInfo {
  name: string;
  version: string;
  description: string;
  category: string;
  icon: string;
}

export const moduleRegistry: ModuleInfo[] = [
  {
    name: "Inventory",
    version: "1.2.0",
    description:
      "Manage products, stock levels, and warehouse operations with real-time insights.",
    category: "Operations",
    icon: "Package",
  },
  {
    name: "Sales CRM",
    version: "3.4.1",
    description:
      "Track leads, manage customer relationships, and monitor sales pipelines.",
    category: "Sales",
    icon: "Users",
  },
  {
    name: "Analytics Suite",
    version: "2.0.5",
    description:
      "Advanced dashboards and reporting for data-driven decision making.",
    category: "Analytics",
    icon: "BarChart3",
  },
  {
    name: "Accounting",
    version: "4.1.0",
    description:
      "Automate invoicing, billing, and financial reporting workflows.",
    category: "Finance",
    icon: "DollarSign",
  },
  {
    name: "Security Monitor",
    version: "1.0.3",
    description:
      "Monitor system access, audit logs, and enforce security compliance.",
    category: "Security",
    icon: "Shield",
  },
  {
    name: "Automation Hub",
    version: "0.9.8",
    description:
      "Build automated workflows that connect services and streamline tasks.",
    category: "Automation",
    icon: "Zap",
  },
];
