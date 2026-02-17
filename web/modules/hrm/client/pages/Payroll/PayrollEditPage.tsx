"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { payrollService } from "@mdl/hrm/client/services/PayrollService";
import { useCreateUpdate, useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";

import PayrollForm, {
  type PayrollFormValues,
} from "./components/PayrollForm/PayrollForm";

const PAYROLL_LIST_PATH = "/workspace/modules/hrm/payroll";

export default function PayrollEditPage(): React.ReactNode {
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

  const {
    handleSubmit: submitPayroll,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof payrollService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await payrollService.update(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToUpdatePayroll"));
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-payroll"], ["hrm-payroll", id]],
    onSuccess: (data) => {
      router.push(`${PAYROLL_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const viewPath = `${PAYROLL_LIST_PATH}/view/${id}`;
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
                t("edit"),
              href: viewPath,
            },
            { label: t("edit") },
          ]
        : [
            { label: t("title"), href: PAYROLL_LIST_PATH },
            { label: t("edit") },
          ],
    [t, payrollData, viewPath, getLocalizedText],
  );

  useSetBreadcrumbs(breadcrumbs);

  const handleSubmit = async (values: PayrollFormValues) => {
    await submitPayroll({
      id,
      payrollPeriodId:
        typeof values.payrollPeriodId === "string"
          ? values.payrollPeriodId.trim()
          : undefined,
      employeeId:
        typeof values.employeeId === "string"
          ? values.employeeId.trim()
          : undefined,
      baseSalary:
        typeof values.baseSalary === "number" ? values.baseSalary : undefined,
      overtimePay:
        typeof values.overtimePay === "number" ? values.overtimePay : undefined,
      bonuses: typeof values.bonuses === "number" ? values.bonuses : undefined,
      otherEarnings:
        typeof values.otherEarnings === "number"
          ? values.otherEarnings
          : undefined,
      socialInsurance:
        typeof values.socialInsurance === "number"
          ? values.socialInsurance
          : undefined,
      healthInsurance:
        typeof values.healthInsurance === "number"
          ? values.healthInsurance
          : undefined,
      unemploymentInsurance:
        typeof values.unemploymentInsurance === "number"
          ? values.unemploymentInsurance
          : undefined,
      personalIncomeTax:
        typeof values.personalIncomeTax === "number"
          ? values.personalIncomeTax
          : undefined,
      workingDays:
        typeof values.workingDays === "number" ? values.workingDays : undefined,
      workingHours:
        typeof values.workingHours === "number"
          ? values.workingHours
          : undefined,
      overtimeHours:
        typeof values.overtimeHours === "number"
          ? values.overtimeHours
          : undefined,
      status: typeof values.status === "string" ? values.status : undefined,
      notes: values.notes?.trim() || null,
    });
  };

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

  const subtitle = [
    payrollData.payrollPeriod?.code,
    getLocalizedText(payrollData.employee?.fullName) || payrollData.employee?.employeeCode,
  ].filter(Boolean).join(" · ");

  return (
    <IBasePageLayout
      maxWidth="form"
      subtitle={subtitle || undefined}
      title={t("edit")}
      variant="edit"
    >
      <PayrollForm
      defaultValues={{
        payrollPeriodId: payrollData.payrollPeriodId,
        employeeId: payrollData.employeeId,
        baseSalary: payrollData.baseSalary,
        overtimePay: payrollData.overtimePay,
        bonuses: payrollData.bonuses,
        otherEarnings: payrollData.otherEarnings,
        socialInsurance: payrollData.socialInsurance,
        healthInsurance: payrollData.healthInsurance,
        unemploymentInsurance: payrollData.unemploymentInsurance,
        personalIncomeTax: payrollData.personalIncomeTax,
        workingDays: payrollData.workingDays,
        workingHours: payrollData.workingHours,
        overtimeHours: payrollData.overtimeHours,
        status: payrollData.status,
        notes: payrollData.notes || "",
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
