"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Spinner } from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  WarehouseDto,
  WarehousePayload,
} from "../../services/StockService";
import StockService from "../../services/StockService";
import WarehouseForm from "./components/WarehouseForm";

export default function WarehouseEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [warehouse, setWarehouse] = useState<WarehouseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const warehouseId = useMemo(() => {
    const value = params?.id;
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  useEffect(() => {
    if (warehouseId) {
      return;
    }
    setIsLoading(false);
    setWarehouse(null);
    setErrorMessage("Warehouse identifier is missing.");
  }, [warehouseId]);

  useEffect(() => {
    if (!warehouseId) return;

    const loadWarehouse = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await StockService.getWarehouseById(warehouseId);
        if (response.success && response.data) {
          setWarehouse(response.data);
          setErrorMessage(null);
        } else {
          setWarehouse(null);
          setErrorMessage(response.message ?? "Unable to load warehouse");
        }
      } catch (error) {
        console.error(error);
        setWarehouse(null);
        setErrorMessage("Failed to load warehouse");
      } finally {
        setIsLoading(false);
      }
    };

    loadWarehouse();
  }, [warehouseId]);

  const handleSubmit = useCallback(
    async (payload: WarehousePayload) => {
      if (!warehouseId) return;
      await StockService.updateWarehouse({ ...payload, id: warehouseId });
      router.push("/workspace/modules/stock/warehouses");
    },
    [router, warehouseId]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/stock/warehouses")}
        >
          Back to list
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardBody className="flex items-center justify-center py-10">
            <Spinner label="Loading warehouse..." />
          </CardBody>
        </Card>
      ) : warehouse ? (
        <WarehouseForm
          initialData={warehouse}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          secondaryAction={
            <Button
              size="sm"
              variant="light"
              onPress={() => router.push("/workspace/modules/stock/warehouses")}
            >
              Cancel
            </Button>
          }
        />
      ) : (
        <Card>
          <CardBody className="space-y-3">
            <p className="text-default-500">
              {errorMessage ?? "Warehouse not found or has been removed."}
            </p>
            <Button
              size="sm"
              onPress={() => router.push("/workspace/modules/stock/warehouses")}
            >
              Back to list
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
