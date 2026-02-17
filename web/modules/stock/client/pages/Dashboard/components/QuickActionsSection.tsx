"use client";

import type { WarehouseDto } from "../../../services/StockService";
import type { MovementResult, MovementPayload } from "../types";

import { useTranslations } from "next-intl";

import { IBaseCard, IBaseCardBody } from "@base/client";

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
  const t = useTranslations("stock.dashboard.quickActions");

  return (
    <IBaseCard>
      <IBaseCardBody className="space-y-4">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-default-500">
          {t("description")}
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
            actionLabel={t("cards.adjust.action")}
            description={t("cards.adjust.description")}
            submitting={adjustMutationPending}
            title={t("cards.adjust.title")}
            warehouses={warehouses}
            onSubmit={onAdjust}
          />

          <MovementCard
            actionLabel={t("cards.receive.action")}
            description={t("cards.receive.description")}
            submitting={receiveMutationPending}
            title={t("cards.receive.title")}
            warehouses={warehouses}
            onSubmit={onReceive}
          />

          <MovementCard
            actionLabel={t("cards.issue.action")}
            description={t("cards.issue.description")}
            submitting={issueMutationPending}
            title={t("cards.issue.title")}
            warehouses={warehouses}
            onSubmit={onIssue}
          />

          <MovementCard
            requireSecondaryWarehouse
            actionLabel={t("cards.transfer.action")}
            description={t("cards.transfer.description")}
            submitting={transferMutationPending}
            title={t("cards.transfer.title")}
            warehouses={warehouses}
            onSubmit={onTransfer}
          />
        </div>
      </IBaseCardBody>
    </IBaseCard>
  );
}
