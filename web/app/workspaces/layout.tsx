"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Bell, 
  Search,
  Menu,
  X,
  Home,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/workspaces/dashboard", icon: LayoutDashboard, badge: null },
  { name: "Projects", href: "/workspaces/projects", icon: FolderOpen, badge: "12" },
  { name: "Users", href: "/workspaces/users", icon: Users, badge: "5" },
  { name: "Analytics", href: "/workspaces/analytics", icon: BarChart3, badge: null },
  { name: "Settings", href: "/workspaces/settings", icon: Settings, badge: null },
];

const breadcrumbItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Workspace", href: "/workspaces" },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex px-0">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-lg">D</span>
              </div>
              <h1 className="text-xl font-bold text-white">Seven Admin</h1>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="lg:hidden text-white"
              onPress={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
              Main Menu
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 text-gray-700 group"
                >
                  <div className="flex items-center">
                    <Icon size={20} className="mr-3 group-hover:text-blue-600" />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <Dropdown placement="top-start">
              <DropdownTrigger>
                <Button variant="light" className="w-full justify-start p-3 h-auto hover:bg-gray-50 rounded-xl">
                  <Avatar
                    size="md"
                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                    className="mr-3"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900">John Doe</span>
                    <span className="text-xs text-gray-500">Administrator</span>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" className="w-64">
                <DropdownItem key="profile" startContent={<User size={16} />}>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-xs text-gray-500">john@example.com</div>
                  </div>
                </DropdownItem>
                <DropdownItem key="settings" startContent={<Settings size={16} />}>
                  Settings
                </DropdownItem>
                <DropdownItem key="theme" startContent={<Sun size={16} />}>
                  Switch Theme
                </DropdownItem>
                <DropdownItem key="logout" className="text-danger" color="danger" startContent={<LogOut size={16} />}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="lg:hidden mr-4"
                onPress={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </Button>
              
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2">
                {breadcrumbItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight size={16} className="text-gray-400 mx-2" />}
                    <Link
                      href={item.href}
                      className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {item.icon && <item.icon size={16} className="mr-1" />}
                      {item.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Theme Toggle */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="hidden sm:flex"
              >
                <Sun size={20} />
              </Button>

              {/* Notifications */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User avatar */}
              <Avatar
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                className="cursor-pointer"
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
