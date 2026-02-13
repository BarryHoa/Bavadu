"use client";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { contractService } from "@mdl/hrm/client/services/ContractService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import ContractForm, {
  type ContractFormValues,
} from "../components/ContractForm/ContractForm";

const CONTRACTS_LIST_PATH = "/workspace/modules/hrm/contracts";

export default function ContractCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.contract.create.labels");
  const tTitle = useTranslations("hrm.contract");

  const breadcrumbs = useMemo(
    () => [
      { label: tTitle("title"), href: CONTRACTS_LIST_PATH },
      { label: tTitle("list.newContract") },
    ],
    [tTitle],
  );
  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitContract,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof contractService.create>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await contractService.create(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreate"));
      }

      return response.data;
    },
    invalidateQueries: [["hrm-contracts"]],
    onSuccess: (data) => {
      router.push(`${CONTRACTS_LIST_PATH}/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: ContractFormValues) => {
    const payload = {
      contractNumber: values.contractNumber.trim(),
      employeeId: values.employeeId.trim(),
      contractType: values.contractType.trim(),
      startDate: values.startDate.trim(),
      endDate: values.endDate?.trim() || null,
      baseSalary: Number(values.baseSalary),
      currency: values.currency?.trim() || "VND",
      workingHours: values.workingHours ? Number(values.workingHours) : null,
      probationPeriod: values.probationPeriod
        ? Number(values.probationPeriod)
        : null,
      probationEndDate: values.probationEndDate?.trim() || null,
      status: values.status || "draft",
      documentUrl: values.documentUrl?.trim() || null,
      signedDate: values.signedDate?.trim() || null,
      signedBy: values.signedBy?.trim() || null,
      notes: values.notes?.trim() || null,
      isActive: values.isActive ?? true,
    };

    await submitContract(payload);
  };

  return (
    <IBasePageLayout
      variant="create"
      maxWidth="form"
      title={tTitle("list.newContract")}
    >
      <ContractForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(CONTRACTS_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
