"use client";

import { LoadingOverlay } from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { payrollService } from "@mdl/hrm/client/services/PayrollService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import PayrollForm, {
  type PayrollFormValues,
} from "./components/PayrollForm/PayrollForm";

export default function PayrollEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.payroll");
  const tCommon = useTranslations("common");

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
      router.push(`/workspace/modules/hrm/payroll/view/${data.data.id}`);
    },
  });

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
    <PayrollForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/payroll/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}
