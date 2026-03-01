"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { employeeService } from "@mdl/hrm/client/services/EmployeeService";

import EmployeeForm, {
  type EmployeeFormValues,
} from "../components/EmployeeForm/EmployeeForm";

const EMPLOYEES_LIST_PATH = "/workspace/modules/hrm/employees";

export default function EmployeeCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.employee.create.labels");
  const tValidation = useTranslations("hrm.employee.create.validation");
  const tTitle = useTranslations("hrm.employee");

  const breadcrumbs = useMemo(
    () => [
      { label: tTitle("title"), href: EMPLOYEES_LIST_PATH },
      { label: t("pageTitle") },
    ],
    [t, tTitle],
  );

  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitEmployee,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof employeeService.create>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await employeeService.create(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreate"));
      }

      return response.data;
    },
    invalidateQueries: [["hrm-employees"]],
    onSuccess: (data) => {
      router.push(`${EMPLOYEES_LIST_PATH}/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: EmployeeFormValues) => {
    const loginIdentifier = values.loginIdentifier?.trim();
    if (!loginIdentifier) {
      throw new Error("Login identifier (email or username) is required");
    }
    const password = values.password?.trim();
    if (!password || password.length < 6) {
      throw new Error(tValidation("password.minLength"));
    }
    const nationalId = values.nationalId?.trim();
    if (!nationalId) {
      throw new Error(tValidation("nationalId.required"));
    }

    const emailsFiltered = (values.emails ?? [])
      .map((e) => (typeof e === "string" ? e.trim() : ""))
      .filter(Boolean);
    const phonesFiltered = (values.phones ?? [])
      .map((p) => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean);

    const payload = {
      loginIdentifier,
      password,
      emails: emailsFiltered.length ? emailsFiltered : null,
      phones: phonesFiltered.length ? phonesFiltered : null,
      firstName: values.firstName?.trim() || null,
      lastName: values.lastName?.trim() || null,
      commonName: values.commonName?.trim() || null,
      bio: values.bio?.trim() || null,
      address: values.address
        ? (values.address as Record<string, unknown>)
        : null,
      dateOfBirth: values.dateOfBirth?.trim() || null,
      gender: values.gender?.trim() || null,
      notes: values.notes?.trim() || null,
      employeeCode: values.employeeCode.trim(),
      nationalId,
      taxId: values.taxId?.trim() || null,
      positionId: values.positionId.trim(),
      departmentId: values.departmentId.trim(),
      employmentStatus: "active",
      hireDate: values.hireDate?.trim() || null,
      probationEndDate: values.probationEndDate?.trim() || null,
      bankAccount: values.bankAccount?.trim() || null,
      bankName: values.bankName?.trim() || null,
      bankBranch: values.bankBranch?.trim() || null,
      emergencyContactName: values.emergencyContactName?.trim() || null,
      emergencyContactPhone: values.emergencyContactPhone?.trim() || null,
      roleIds: Array.isArray(values.roleIds) ? values.roleIds : [],
      educationLevel: values.educationLevel?.trim() || null,
      experience: values.experience?.trim() || null,
    };

    await submitEmployee(payload);
  };

  return (
    <IBasePageLayout
      maxWidth="form"
      title={t("pageTitle")}
      variant="create"
    >
      <EmployeeForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(EMPLOYEES_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
