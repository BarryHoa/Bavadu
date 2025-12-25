"use client";

import type { WarehouseDto } from "../../../services/StockService";
import type { MovementResult, MovementPayload } from "../types";

import { IBaseCard, IBaseCardBody } from "@base/client/components";

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
    <IBaseCard>
      <IBaseCardBody className="space-y-4">
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
            actionLabel="Adjust"
            description="Modify the on-hand quantity for a single warehouse."
            submitting={adjustMutationPending}
            title="Adjust Stock"
            warehouses={warehouses}
            onSubmit={onAdjust}
          />

          <MovementCard
            actionLabel="Receive"
            description="Register incoming inventory for purchase receipts."
            submitting={receiveMutationPending}
            title="Receive Stock"
            warehouses={warehouses}
            onSubmit={onReceive}
          />

          <MovementCard
            actionLabel="Issue"
            description="Deduct inventory for sales or consumption."
            submitting={issueMutationPending}
            title="Issue Stock"
            warehouses={warehouses}
            onSubmit={onIssue}
          />

          <MovementCard
            requireSecondaryWarehouse
            actionLabel="Transfer"
            description="Move inventory between two warehouses."
            submitting={transferMutationPending}
            title="Transfer Stock"
            warehouses={warehouses}
            onSubmit={onTransfer}
          />
        </div>
      </IBaseCardBody>
    </IBaseCard>
  );
}
