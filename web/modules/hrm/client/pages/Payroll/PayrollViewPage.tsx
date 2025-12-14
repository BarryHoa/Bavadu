"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { payrollService } from "@mdl/hrm/client/services/PayrollService";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import { LoadingOverlay, IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

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

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (isError) {
    return (
      <div className="text-danger-500">
        {tCommon("errors.failedToLoadData")}: {error?.message}
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        <Button
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/hrm/payroll")}
        >
          {tCommon("actions.backToList")}
        </Button>
        <Button
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/payroll/edit/${id}`)
          }
        >
          {tCommon("actions.edit")}
        </Button>
      </div>

      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.employee")}
              value={getLocalizedText(payrollData.employee?.fullName) || payrollData.employee?.employeeCode}
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
        </CardBody>
      </Card>
    </div>
  );
}

