"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { contractService } from "@mdl/hrm/client/services/ContractService";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";

const CONTRACTS_LIST_PATH = "/workspace/modules/hrm/contracts";

export default function ContractViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.contract.view.labels");
  const tTitle = useTranslations("hrm.contract");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: contract,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-contract", id],
    queryFn: async () => {
      const response = await contractService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? "Contract not found");
      }

      return response.data;
    },
    enabled: !!id,
  });

  const breadcrumbs = useMemo(
    () =>
      contract
        ? [
            { label: tTitle("title"), href: CONTRACTS_LIST_PATH },
            { label: contract.contractNumber },
          ]
        : [
            { label: tTitle("title"), href: CONTRACTS_LIST_PATH },
            { label: isLoading ? "..." : tCommon("errors.dataNotFound") },
          ],
    [tTitle, contract, isLoading, tCommon],
  );

  useSetBreadcrumbs(breadcrumbs);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{tCommon("loading")}</span>
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : tCommon("errors.dataNotFound")}
        </p>
        <IBaseButton
          color="danger"
          size="sm"
          variant="bordered"
          onPress={() => refetch()}
        >
          Retry
        </IBaseButton>
      </div>
    );
  }

  const editPath = `${CONTRACTS_LIST_PATH}/edit/${id}`;
  const subtitle = [contract.contractType, contract.status].filter(Boolean).join(" · ");

  return (
    <IBasePageLayout
      headerActions={
        <IBaseButton
          color="primary"
          size="sm"
          startContent={<Pencil className="size-4" />}
          onPress={() => router.push(editPath)}
        >
          {t("edit")}
        </IBaseButton>
      }
      maxWidth="content"
      subtitle={subtitle || undefined}
      title={contract.contractNumber}
      variant="detail"
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("basicInfo")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-default-500">
                {t("contractNumber")}
              </div>
              <div className="text-base">{contract.contractNumber}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("employee")}</div>
              <div className="text-base">
                {getLocalizedText(contract.employee?.fullName as any) ||
                  contract.employee?.employeeCode ||
                  "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">
                {t("contractType")}
              </div>
              <div className="text-base">{contract.contractType}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("status")}</div>
              <div className="text-base">{contract.status}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("startDate")}</div>
              <div className="text-base">{contract.startDate}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("endDate")}</div>
              <div className="text-base">{contract.endDate || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("baseSalary")}</div>
              <div className="text-base">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: contract.currency || "VND",
                }).format(contract.baseSalary)}
              </div>
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
