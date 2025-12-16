"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { payrollService } from "@mdl/hrm/client/services/PayrollService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

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

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-payroll"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/payroll/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: PayrollFormValues) => {
    await submitPayroll({
      payrollPeriodId:
        typeof values.payrollPeriodId === "string"
          ? values.payrollPeriodId.trim()
          : "",
      employeeId:
        typeof values.employeeId === "string" ? values.employeeId.trim() : "",
      baseSalary: typeof values.baseSalary === "number" ? values.baseSalary : 0,
      overtimePay:
        typeof values.overtimePay === "number" ? values.overtimePay : 0,
      bonuses: typeof values.bonuses === "number" ? values.bonuses : 0,
      otherEarnings:
        typeof values.otherEarnings === "number" ? values.otherEarnings : 0,
      socialInsurance:
        typeof values.socialInsurance === "number" ? values.socialInsurance : 0,
      healthInsurance:
        typeof values.healthInsurance === "number" ? values.healthInsurance : 0,
      unemploymentInsurance:
        typeof values.unemploymentInsurance === "number"
          ? values.unemploymentInsurance
          : 0,
      personalIncomeTax:
        typeof values.personalIncomeTax === "number"
          ? values.personalIncomeTax
          : 0,
      workingDays:
        typeof values.workingDays === "number" ? values.workingDays : 0,
      workingHours:
        typeof values.workingHours === "number" ? values.workingHours : 0,
      overtimeHours:
        typeof values.overtimeHours === "number" ? values.overtimeHours : 0,
      status: typeof values.status === "string" ? values.status : "draft",
      notes: typeof values.notes === "string" ? values.notes.trim() : null,
    });
  };

  return (
    <PayrollForm
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push("/workspace/modules/hrm/payroll")}
      onSubmit={handleSubmit}
    />
  );
}
