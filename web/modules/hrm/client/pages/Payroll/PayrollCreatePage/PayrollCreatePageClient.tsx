"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { payrollService } from "@mdl/hrm/client/services/PayrollService";
import PayrollForm, {
  type PayrollFormValues,
} from "../components/PayrollForm/PayrollForm";

export default function PayrollCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.payroll");

  const {
    handleSubmit: submitPayroll,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof payrollService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await payrollService.create(payload);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreatePayroll"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-payroll"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/payroll/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: PayrollFormValues) => {
    await submitPayroll({
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

  return (
    <PayrollForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/payroll")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}

