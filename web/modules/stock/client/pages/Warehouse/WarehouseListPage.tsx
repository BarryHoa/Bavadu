/* eslint-disable react-hooks/exhaustive-deps */
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
import { useEffect, useMemo, useState } from "react";

import StockService, {
  WarehouseDto,
} from "../../services/StockService";

export default function WarehouseListPage(): React.ReactNode {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<WarehouseDto[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadWarehouses = async () => {
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
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredWarehouses(warehouses);
      return;
    }
    const term = search.toLowerCase();
    setFilteredWarehouses(
      warehouses.filter(
        (warehouse) =>
          warehouse.code.toLowerCase().includes(term) ||
          warehouse.name.toLowerCase().includes(term) ||
          (warehouse.description ?? "").toLowerCase().includes(term)
      )
    );
  }, [search, warehouses]);

  const rows = useMemo(
    () =>
      filteredWarehouses.map((warehouse) => ({
        ...warehouse,
        codeAndName: `${warehouse.code} — ${warehouse.name}`,
        description: warehouse.description || "—",
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
            placeholder="Search by code, name or description"
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
                <TableColumn>Description</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>
                      <Chip
                        color={row.isActive ? "success" : "danger"}
                        variant="flat"
                        size="sm"
                      >
                        {row.isActive ? "Active" : "Inactive"}
                      </Chip>
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

