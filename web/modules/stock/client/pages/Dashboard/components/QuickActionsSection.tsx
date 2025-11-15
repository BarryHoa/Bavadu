"use client";

import { Card, CardBody } from "@heroui/react";
import type { WarehouseDto } from "../../../services/StockService";
import type { MovementResult, MovementPayload } from "../types";
import MovementCard from "./MovementCard";

interface QuickActionsSectionProps {
  warehouses: WarehouseDto[];
  movementResult: MovementResult | null;
  adjustMutationPending: boolean;
  receiveMutationPending: boolean;
  issueMutationPending: boolean;
  transferMutationPending: boolean;
  onAdjust: (payload: MovementPayload) => Promise<void>;
  onReceive: (payload: MovementPayload) => Promise<void>;
  onIssue: (payload: MovementPayload) => Promise<void>;
  onTransfer: (payload: MovementPayload) => Promise<void>;
}

export default function QuickActionsSection({
  warehouses,
  movementResult,
  adjustMutationPending,
  receiveMutationPending,
  issueMutationPending,
  transferMutationPending,
  onAdjust,
  onReceive,
  onIssue,
  onTransfer,
}: QuickActionsSectionProps) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <p className="text-default-500">
          Use these forms to adjust inventory levels quickly.
        </p>

        {movementResult ? (
          <div
            className={`rounded-medium border px-4 py-3 text-sm ${
              movementResult.type === "success"
                ? "border-success-200 bg-success-50 text-success-600"
                : "border-danger-200 bg-danger-50 text-danger-600"
            }`}
          >
            {movementResult.message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MovementCard
            title="Adjust Stock"
            description="Modify the on-hand quantity for a single warehouse."
            actionLabel="Adjust"
            warehouses={warehouses}
            submitting={adjustMutationPending}
            onSubmit={onAdjust}
          />

          <MovementCard
            title="Receive Stock"
            description="Register incoming inventory for purchase receipts."
            actionLabel="Receive"
            warehouses={warehouses}
            submitting={receiveMutationPending}
            onSubmit={onReceive}
          />

          <MovementCard
            title="Issue Stock"
            description="Deduct inventory for sales or consumption."
            actionLabel="Issue"
            warehouses={warehouses}
            submitting={issueMutationPending}
            onSubmit={onIssue}
          />

          <MovementCard
            title="Transfer Stock"
            description="Move inventory between two warehouses."
            actionLabel="Transfer"
            warehouses={warehouses}
            submitting={transferMutationPending}
            requireSecondaryWarehouse
            onSubmit={onTransfer}
          />
        </div>
      </CardBody>
    </Card>
  );
}

