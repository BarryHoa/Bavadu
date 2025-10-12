"use client";

import { useState } from "react";
import DataTable, {
  DataTableColumn,
  DataTableSummary,
} from "@/components/base/DataTable";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { Avatar } from "@heroui/avatar";
import { title, subtitle } from "@/components/primitives";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  image: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  salary: number;
  status: "active" | "inactive" | "on_leave";
  avatar: string;
  joinDate: string;
}

const statusColorMap = {
  in_stock: "success" as const,
  low_stock: "warning" as const,
  out_of_stock: "danger" as const,
  active: "success" as const,
  inactive: "danger" as const,
  on_leave: "warning" as const,
};

// Sample data for products
const products: Product[] = [
  {
    id: 1,
    name: "Laptop Pro 15",
    category: "Electronics",
    price: 1299.99,
    stock: 45,
    status: "in_stock",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Wireless Mouse",
    category: "Accessories",
    price: 29.99,
    stock: 8,
    status: "low_stock",
    image: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "USB-C Cable",
    category: "Accessories",
    price: 15.99,
    stock: 0,
    status: "out_of_stock",
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    category: "Accessories",
    price: 89.99,
    stock: 23,
    status: "in_stock",
    image: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    name: "4K Monitor",
    category: "Electronics",
    price: 449.99,
    stock: 12,
    status: "in_stock",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 6,
    name: "Webcam HD",
    category: "Electronics",
    price: 79.99,
    stock: 5,
    status: "low_stock",
    image: "https://i.pravatar.cc/150?img=6",
  },
  {
    id: 7,
    name: "Desk Lamp",
    category: "Office",
    price: 34.99,
    stock: 18,
    status: "in_stock",
    image: "https://i.pravatar.cc/150?img=7",
  },
  {
    id: 8,
    name: "Ergonomic Chair",
    category: "Furniture",
    price: 299.99,
    stock: 7,
    status: "low_stock",
    image: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: 9,
    name: "Standing Desk",
    category: "Furniture",
    price: 599.99,
    stock: 15,
    status: "in_stock",
    image: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: 10,
    name: "Headphones",
    category: "Electronics",
    price: 159.99,
    stock: 32,
    status: "in_stock",
    image: "https://i.pravatar.cc/150?img=10",
  },
  {
    id: 11,
    name: 'Tablet 10"',
    category: "Electronics",
    price: 399.99,
    stock: 0,
    status: "out_of_stock",
    image: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 12,
    name: "Phone Stand",
    category: "Accessories",
    price: 19.99,
    stock: 41,
    status: "in_stock",
    image: "https://i.pravatar.cc/150?img=12",
  },
];

// Sample data for employees
const employees: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Senior Developer",
    department: "Engineering",
    salary: 95000,
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    joinDate: "2020-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Product Manager",
    department: "Product",
    salary: 105000,
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    joinDate: "2019-03-22",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "UX Designer",
    department: "Design",
    salary: 85000,
    status: "on_leave",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    joinDate: "2021-06-10",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.williams@company.com",
    role: "Marketing Manager",
    department: "Marketing",
    salary: 92000,
    status: "active",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    joinDate: "2020-11-05",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@company.com",
    role: "DevOps Engineer",
    department: "Engineering",
    salary: 98000,
    status: "inactive",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    joinDate: "2018-08-20",
  },
];

export default function DataTableDemoPage() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set([])
  );
  const [loading, setLoading] = useState(false);

  // Product columns
  const productColumns: DataTableColumn<Product>[] = [
    {
      key: "name",
      label: "PRODUCT",
      align: "start",
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.image} size="sm" radius="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{value}</span>
            <span className="text-xs text-default-400">{record.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "PRICE",
      align: "end",
      sortable: true,
      render: (value) => (
        <span className="font-semibold">${value.toFixed(2)}</span>
      ),
    },
    {
      key: "stock",
      label: "STOCK",
      align: "center",
      sortable: true,
      render: (value) => <span className="text-sm">{value} units</span>,
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      render: (value) => (
        <Chip
          color={statusColorMap[value as keyof typeof statusColorMap]}
          size="sm"
          variant="flat"
          className="capitalize"
        >
          {value.replace("_", " ")}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "center",
      render: (_, record) => (
        <div className="flex gap-2 justify-center">
          <Button size="sm" variant="light" color="primary">
            Edit
          </Button>
          <Button size="sm" variant="light" color="danger">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Employee columns
  const employeeColumns: DataTableColumn<Employee>[] = [
    {
      key: "name",
      label: "EMPLOYEE",
      align: "start",
      render: (value, record) => (
        <User
          name={value}
          description={record.email}
          avatarProps={{
            src: record.avatar,
            size: "sm",
          }}
        />
      ),
    },
    {
      key: "role",
      label: "ROLE",
      align: "start",
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{value}</span>
          <span className="text-xs text-default-400">{record.department}</span>
        </div>
      ),
    },
    {
      key: "salary",
      label: "SALARY",
      align: "end",
      sortable: true,
      render: (value) => (
        <span className="font-semibold">${value.toLocaleString("en-US")}</span>
      ),
    },
    {
      key: "joinDate",
      label: "JOIN DATE",
      align: "center",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      render: (value) => (
        <Chip
          color={statusColorMap[value as keyof typeof statusColorMap]}
          size="sm"
          variant="flat"
          className="capitalize"
        >
          {value.replace("_", " ")}
        </Chip>
      ),
    },
  ];

  // Product summary
  const productSummary: DataTableSummary = {
    label: "Total",
    values: {
      name: <span className="font-bold">Summary</span>,
      price: (
        <span className="font-bold text-success">
          ${products.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}
        </span>
      ),
      stock: (
        <span className="font-bold">
          {products.reduce((sum, p) => sum + p.stock, 0)} units
        </span>
      ),
      status: (
        <span className="text-xs text-default-500">
          {products.filter((p) => p.status === "in_stock").length} in stock
        </span>
      ),
    },
  };

  // Employee summary
  const employeeSummary: DataTableSummary = {
    label: "Total",
    values: {
      name: <span className="font-bold">Summary</span>,
      salary: (
        <span className="font-bold text-success">
          ${employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString()}
        </span>
      ),
      status: (
        <span className="text-xs text-default-500">
          {employees.filter((e) => e.status === "active").length} active
        </span>
      ),
    },
  };

  const handleTableChange = (params: any) => {
    console.log("Table changed:", params);
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className={title()}>DataTable Component Demo</h1>
        <p className={subtitle()}>
          Advanced table with pagination, sticky header, summary footer, and
          more
        </p>
      </div>

      <div className="space-y-12">
        {/* Products Table */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold">Products Inventory</h2>
              <p className="text-sm text-default-500 mt-1">
                With pagination, summary footer, and custom rendering
              </p>
            </div>
            <Button color="primary" onPress={simulateLoading}>
              Refresh Data
            </Button>
          </div>
          <DataTable
            columns={productColumns}
            dataSource={products}
            rowKey="id"
            loading={loading}
            summary={productSummary}
            pagination={{
              pageSize: 5,
              page: 1,
              showTotal: true,
              total: 100,
            }}
            onChangeTable={handleTableChange}
          />
        </section>

        {/* Employees Table */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Employee Directory</h2>
            <p className="text-sm text-default-500 mt-1">
              With selection, compact mode, and summary
            </p>
            {selectedKeys.size > 0 && (
              <p className="text-sm text-primary mt-2">
                Selected: {Array.from(selectedKeys).join(", ")}
              </p>
            )}
          </div>
          <DataTable
            columns={employeeColumns}
            dataSource={employees}
            rowKey="id"
            sticky
            compact
            selectable
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            summary={employeeSummary}
            pagination={{
              pageSize: 3,
              page: 1,
              showTotal: true,
            }}
            onChangeTable={handleTableChange}
          />
        </section>

        {/* Simple Table without pagination */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Simple Table</h2>
            <p className="text-sm text-default-500 mt-1">
              Without pagination, showing all data
            </p>
          </div>
          <DataTable
            columns={employeeColumns}
            dataSource={employees}
            rowKey="id"
            striped
            pagination={false}
            classNames={{
              wrapper: "shadow-md rounded-lg",
            }}
          />
        </section>

        {/* Empty State Table */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Empty State</h2>
            <p className="text-sm text-default-500 mt-1">Table with no data</p>
          </div>
          <DataTable
            columns={productColumns}
            dataSource={[]}
            rowKey="id"
            emptyContent={
              <div className="text-center py-8">
                <p className="text-lg font-semibold text-default-400">
                  No products found
                </p>
                <p className="text-sm text-default-300 mt-2">
                  Try adding some products to see them here
                </p>
              </div>
            }
            pagination={{
              pageSize: 5,
            }}
          />
        </section>

        {/* Loading State */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Loading State</h2>
            <p className="text-sm text-default-500 mt-1">
              Table with loading indicator
            </p>
          </div>
          <DataTable
            columns={productColumns}
            dataSource={products}
            rowKey="id"
            loading={true}
            pagination={{
              pageSize: 5,
            }}
          />
        </section>

        {/* Color Variants */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Color Variants</h2>
            <p className="text-sm text-default-500 mt-1">
              Different theme colors for the table
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Color */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Primary
              </h3>
              <DataTable
                columns={employeeColumns.slice(0, 3)}
                dataSource={employees.slice(0, 3)}
                rowKey="id"
                color="primary"
                compact
                pagination={false}
              />
            </div>

            {/* Secondary Color */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-secondary">
                Secondary
              </h3>
              <DataTable
                columns={employeeColumns.slice(0, 3)}
                dataSource={employees.slice(0, 3)}
                rowKey="id"
                color="secondary"
                compact
                pagination={false}
              />
            </div>

            {/* Success Color */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-success">
                Success
              </h3>
              <DataTable
                columns={employeeColumns.slice(0, 3)}
                dataSource={employees.slice(0, 3)}
                rowKey="id"
                color="success"
                compact
                pagination={false}
              />
            </div>

            {/* Warning Color */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-warning">
                Warning
              </h3>
              <DataTable
                columns={employeeColumns.slice(0, 3)}
                dataSource={employees.slice(0, 3)}
                rowKey="id"
                color="warning"
                compact
                pagination={false}
              />
            </div>

            {/* Danger Color */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-danger">Danger</h3>
              <DataTable
                columns={employeeColumns.slice(0, 3)}
                dataSource={employees.slice(0, 3)}
                rowKey="id"
                color="danger"
                compact
                pagination={false}
              />
            </div>

            {/* Default Color */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Default</h3>
              <DataTable
                columns={employeeColumns.slice(0, 3)}
                dataSource={employees.slice(0, 3)}
                rowKey="id"
                color="default"
                compact
                pagination={false}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
