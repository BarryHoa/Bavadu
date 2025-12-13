"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { payrollService } from "@mdl/hrm/client/services/PayrollService";
import PayrollForm, {
  type PayrollFormValues,
} from "./components/PayrollForm/PayrollForm";
import { LoadingOverlay } from "@base/client/components";

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
      return response.data;
    },
    invalidateQueries: [["hrm-payroll"], ["hrm-payroll", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/payroll/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: PayrollFormValues) => {
    await submitPayroll({
      id,
      payrollPeriodId: values.payrollPeriodId.trim(),
      employeeId: values.employeeId.trim(),
      baseSalary: values.baseSalary || 0,
      overtimePay: values.overtimePay || 0,
      bonuses: values.bonuses || 0,
      otherEarnings: values.otherEarnings || 0,
      socialInsurance: values.socialInsurance || 0,
      healthInsurance: values.healthInsurance || 0,
      unemploymentInsurance: values.unemploymentInsurance || 0,
      personalIncomeTax: values.personalIncomeTax || 0,
      workingDays: values.workingDays || 0,
      workingHours: values.workingHours || 0,
      overtimeHours: values.overtimeHours || 0,
      status: values.status || "draft",
      notes: values.notes?.trim() || null,
    });
  };

  if (isLoading) {
    return <LoadingOverlay />;
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

