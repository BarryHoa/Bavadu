"use client";

import {
  IBaseInput,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import { useMemo, useState } from "react";
import type { WarehouseDto } from "../../../services/StockService";
import type { MovementPayload } from "../types";

interface MovementCardProps {
  title: string;
  description: string;
  actionLabel: string;
  warehouses: WarehouseDto[];
  requireSecondaryWarehouse?: boolean;
  submitting?: boolean;
  onSubmit: (payload: MovementPayload) => Promise<void>;
}

export default function MovementCard({
  title,
  description,
  actionLabel,
  warehouses,
  requireSecondaryWarehouse,
  submitting = false,
  onSubmit,
}: MovementCardProps) {
  const [formValues, setFormValues] = useState<MovementPayload>({
    productId: "",
    quantity: "",
    primaryWarehouseId: "",
    secondaryWarehouseId: "",
    reference: "",
    note: "",
  });

  const warehouseItems = useMemo<SelectItemOption[]>(
    () =>
      warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.code} — ${warehouse.name}`,
      })),
    [warehouses]
  );

  const handleChange = (field: keyof MovementPayload, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formValues.productId ||
      !formValues.quantity ||
      !formValues.primaryWarehouseId ||
      (requireSecondaryWarehouse && !formValues.secondaryWarehouseId)
    ) {
      return;
    }

    try {
      await onSubmit(formValues);
      setFormValues({
        productId: "",
        quantity: "",
        primaryWarehouseId: "",
        secondaryWarehouseId: "",
        reference: "",
        note: "",
      });
    } finally {
      // handled by parent
    }
  };

  return (
    <Card className="border border-content3/40">
      <CardBody className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-default-500">{description}</p>
        </div>
        <IBaseInput
          label="Product ID"
          placeholder="Product identifier"
          value={formValues.productId}
          onValueChange={(value) => handleChange("productId", value)}
        />
        <IBaseInput
          label="Quantity"
          type="number"
          value={formValues.quantity}
          onValueChange={(value) => handleChange("quantity", value)}
        />
        <IBaseSingleSelect
          label="Warehouse"
          items={warehouseItems}
          selectedKey={formValues.primaryWarehouseId}
          onSelectionChange={(key) => {
            handleChange("primaryWarehouseId", key || "");
          }}
        />
        {requireSecondaryWarehouse ? (
          <IBaseSingleSelect
            label="Target Warehouse"
            items={warehouseItems}
            selectedKey={formValues.secondaryWarehouseId}
            onSelectionChange={(key) => {
              handleChange("secondaryWarehouseId", key || "");
            }}
          />
        ) : null}
        <IBaseInput
          label="Reference"
          placeholder="Optional reference"
          value={formValues.reference}
          onValueChange={(value) => handleChange("reference", value)}
        />
        <IBaseInput
          label="Note"
          placeholder="Optional note"
          value={formValues.note}
          onValueChange={(value) => handleChange("note", value)}
        />
        <Button
          color="primary"
          size="sm"
          isLoading={submitting}
          onPress={handleSubmit}
        >
          {actionLabel}
        </Button>
      </CardBody>
    </Card>
  );
}

