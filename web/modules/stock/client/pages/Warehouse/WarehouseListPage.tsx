"use client";

import Input from "@base/client/components/Input";
import LinkAs from "@base/client/components/LinkAs";
import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import StockService, { WarehouseDto } from "../../services/StockService";

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  SUSPENDED: "danger",
  CLOSED: "danger",
};

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());

const formatLocation = (warehouse: WarehouseDto) => {
  const parts = [warehouse.address.city, warehouse.address.country].filter(
    (value) => value && value.trim().length > 0
  );
  return parts.length ? parts.join(", ") : "—";
};

const formatStockRange = (warehouse: WarehouseDto) => {
  if (warehouse.maxStock === null || warehouse.maxStock === undefined) {
    return `≥ ${warehouse.minStock}`;
  }
  return `${warehouse.minStock} - ${warehouse.maxStock}`;
};

export default function WarehouseListPage(): React.ReactNode {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<WarehouseDto[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadWarehouses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await StockService.listWarehouses();
      const list = response.data ?? [];
      setWarehouses(list);
      setFilteredWarehouses(list);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  useEffect(() => {
    if (!search) {
      setFilteredWarehouses(warehouses);
      return;
    }
    const term = search.toLowerCase();

    setFilteredWarehouses(
      warehouses.filter((warehouse) => {
        const candidates = [
          warehouse.code,
          warehouse.name,
          warehouse.typeCode,
          warehouse.status,
          warehouse.notes ?? "",
          warehouse.address?.city ?? "",
          warehouse.address?.country ?? "",
        ];

        return candidates.some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(term)
        );
      })
    );
  }, [search, warehouses]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/workspace/modules/stock/warehouses/edit/${id}`);
    },
    [router]
  );

  const rows = useMemo(
    () =>
      filteredWarehouses.map((warehouse) => ({
        ...warehouse,
        location: formatLocation(warehouse),
        stockRange: formatStockRange(warehouse),
        statusLabel: formatStatusLabel(warehouse.status),
        statusColor: statusColorMap[warehouse.status] ?? "warning",
      })),
    [filteredWarehouses]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Warehouses</h1>
          <p className="text-default-500">
            Manage available warehouses and their basic configuration.
          </p>
        </div>
        <Button
          color="primary"
          size="sm"
          as={LinkAs as any}
          href="/workspace/modules/stock/warehouses/create"
        >
          New warehouse
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <Input
            label="Search"
            placeholder="Search by code, name, type or location"
            value={search}
            onValueChange={setSearch}
          />
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner label="Loading warehouses..." />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-default-500">No warehouses found.</p>
          ) : (
            <Table aria-label="Warehouse list" removeWrapper>
              <TableHeader>
                <TableColumn>Code</TableColumn>
                <TableColumn>Name</TableColumn>
                <TableColumn>Type</TableColumn>
                <TableColumn>Location</TableColumn>
                <TableColumn>Stock Range</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.typeCode}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.stockRange}</TableCell>
                    <TableCell>
                      <Chip
                        color={row.statusColor}
                        variant="flat"
                        size="sm"
                      >
                        {row.statusLabel}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(row.id)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/stock")}
        >
          Back to Stock Dashboard
        </Button>
      </div>
    </div>
  );
}

