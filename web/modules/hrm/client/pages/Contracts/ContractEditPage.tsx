"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { contractService } from "@mdl/hrm/client/services/ContractService";
import { useCreateUpdate, useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";

import ContractForm, {
  type ContractFormValues,
} from "./components/ContractForm/ContractForm";

const CONTRACTS_LIST_PATH = "/workspace/modules/hrm/contracts";

export default function ContractEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.contract.create.labels");
  const tTitle = useTranslations("hrm.contract");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: contractData,
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

  const {
    handleSubmit: updateContract,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof contractService.update>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await contractService.update({ ...payload, id });

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToUpdate"));
      }

      return { id: response.data.id };
    },
    invalidateQueries: [["hrm-contracts"], ["hrm-contract", id]],
    onSuccess: (data) => {
      router.push(`${CONTRACTS_LIST_PATH}/view/${data.id}`);
    },
  });

  const viewPath = `${CONTRACTS_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      contractData
        ? [
            { label: tTitle("title"), href: CONTRACTS_LIST_PATH },
            {
              label: contractData.contractNumber || tTitle("list.edit"),
              href: viewPath,
            },
            { label: tTitle("list.edit") },
          ]
        : [
            { label: tTitle("title"), href: CONTRACTS_LIST_PATH },
            { label: tTitle("list.edit") },
          ],
    [tTitle, contractData, viewPath],
  );

  useSetBreadcrumbs(breadcrumbs);

  const handleSubmit = async (values: ContractFormValues) => {
    const payload = {
      id,
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

    await updateContract(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{tCommon("loading")}</span>
      </div>
    );
  }

  if (isError || !contractData) {
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

  return (
    <IBasePageLayout
      maxWidth="form"
      subtitle={contractData.contractNumber}
      title={tTitle("list.edit")}
      variant="edit"
    >
      <ContractForm
      defaultValues={{
        contractNumber: contractData.contractNumber,
        employeeId: contractData.employeeId,
        contractType: contractData.contractType,
        startDate: contractData.startDate,
        endDate: contractData.endDate || "",
        baseSalary: contractData.baseSalary.toString(),
        currency: contractData.currency || "VND",
        workingHours: contractData.workingHours?.toString() || "",
        probationPeriod: contractData.probationPeriod?.toString() || "",
        probationEndDate: contractData.probationEndDate || "",
        status: contractData.status,
        documentUrl: contractData.documentUrl || "",
        signedDate: contractData.signedDate || "",
        signedBy: contractData.signedBy || "",
        notes: contractData.notes || "",
        isActive: contractData.isActive ?? true,
      }}
      isSubmitting={isPending}
      mode="edit"
      submitError={submitError}
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
