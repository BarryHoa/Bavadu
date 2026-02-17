"use client";

import type { WarehouseDto } from "../../../services/StockService";
import type { MovementPayload } from "../types";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  IBaseInput,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";

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
  const t = useTranslations("stock.dashboard.movementCard");
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
    [warehouses],
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
    <IBaseCard className="border border-content3/40">
      <IBaseCardBody className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-default-500">{description}</p>
        </div>
        <IBaseInput
          label={t("fields.productId.label")}
          placeholder={t("fields.productId.placeholder")}
          value={formValues.productId}
          onValueChange={(value) => handleChange("productId", value)}
        />
        <IBaseInput
          label={t("fields.quantity.label")}
          type="number"
          value={formValues.quantity}
          onValueChange={(value) => handleChange("quantity", value)}
        />
        <IBaseSingleSelect
          items={warehouseItems}
          label={t("fields.warehouse.label")}
          selectedKey={formValues.primaryWarehouseId}
          onSelectionChange={(key) => {
            handleChange("primaryWarehouseId", key || "");
          }}
        />
        {requireSecondaryWarehouse ? (
          <IBaseSingleSelect
            items={warehouseItems}
            label={t("fields.targetWarehouse.label")}
            selectedKey={formValues.secondaryWarehouseId}
            onSelectionChange={(key) => {
              handleChange("secondaryWarehouseId", key || "");
            }}
          />
        ) : null}
        <IBaseInput
          label={t("fields.reference.label")}
          placeholder={t("fields.reference.placeholder")}
          value={formValues.reference}
          onValueChange={(value) => handleChange("reference", value)}
        />
        <IBaseInput
          label={t("fields.note.label")}
          placeholder={t("fields.note.placeholder")}
          value={formValues.note}
          onValueChange={(value) => handleChange("note", value)}
        />
        <IBaseButton
          color="primary"
          isLoading={submitting}
          size="sm"
          onPress={handleSubmit}
        >
          {actionLabel}
        </IBaseButton>
      </IBaseCardBody>
    </IBaseCard>
  );
}
