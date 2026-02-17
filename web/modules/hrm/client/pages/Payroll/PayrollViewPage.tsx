"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { IBaseDigitViewer } from "@base/client/components";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";
import { payrollService } from "@mdl/hrm/client/services/PayrollService";

const PAYROLL_LIST_PATH = "/workspace/modules/hrm/payroll";

export default function PayrollViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.payroll");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: payrollData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-payroll", id],
    queryFn: async () => {
      const response = await payrollService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadPayroll"));
      }

      return response.data;
    },
    enabled: !!id,
  });

  const breadcrumbs = useMemo(
    () =>
      payrollData
        ? [
            { label: t("title"), href: PAYROLL_LIST_PATH },
            {
              label:
                getLocalizedText(payrollData.employee?.fullName) ||
                payrollData.employee?.employeeCode ||
                payrollData.payrollPeriod?.code ||
                t("generalInfo"),
            },
          ]
        : [
            { label: t("title"), href: PAYROLL_LIST_PATH },
            { label: isLoading ? "..." : tCommon("errors.dataNotFound") },
          ],
    [t, payrollData, isLoading, tCommon, getLocalizedText],
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

  if (isError || !payrollData) {
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

  const titleLabel =
    getLocalizedText(payrollData.employee?.fullName) ||
    payrollData.employee?.employeeCode ||
    payrollData.payrollPeriod?.code ||
    t("generalInfo");
  const subtitle = [payrollData.status].filter(Boolean).join(" · ");
  const editPath = `${PAYROLL_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      headerActions={
        <IBaseButton
          color="primary"
          size="sm"
          startContent={<Pencil className="size-4" />}
          onPress={() => router.push(editPath)}
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      }
      maxWidth="content"
      subtitle={subtitle || undefined}
      title={titleLabel}
      variant="detail"
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.employee")}
              value={
                getLocalizedText(payrollData.employee?.fullName) ||
                payrollData.employee?.employeeCode
              }
            />
            <IBaseDigitViewer
              label={t("labels.payrollPeriod")}
              value={payrollData.payrollPeriod?.code || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.baseSalary")}
              value={payrollData.baseSalary?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.overtimePay")}
              value={payrollData.overtimePay?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.bonuses")}
              value={payrollData.bonuses?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.otherEarnings")}
              value={payrollData.otherEarnings?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.grossSalary")}
              value={payrollData.grossSalary?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.socialInsurance")}
              value={payrollData.socialInsurance?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.healthInsurance")}
              value={payrollData.healthInsurance?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.unemploymentInsurance")}
              value={payrollData.unemploymentInsurance?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.personalIncomeTax")}
              value={payrollData.personalIncomeTax?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.totalDeductions")}
              value={payrollData.totalDeductions?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.netSalary")}
              value={payrollData.netSalary?.toLocaleString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.workingDays")}
              value={payrollData.workingDays?.toString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.workingHours")}
              value={payrollData.workingHours?.toString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.overtimeHours")}
              value={payrollData.overtimeHours?.toString() || "0"}
            />
            <IBaseDigitViewer
              label={t("labels.status")}
              value={payrollData.status}
            />
            <IBaseDigitViewer
              label={t("labels.notes")}
              value={payrollData.notes || "—"}
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
