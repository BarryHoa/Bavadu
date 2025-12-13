"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { contractService } from "../../../services/ContractService";
import ContractForm, {
  type ContractFormValues,
} from "./components/ContractForm/ContractForm";

export default function ContractEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.contract.create.labels");

  const { data: contractData, isLoading } = useQuery({
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
      return response.data;
    },
    invalidateQueries: [["hrm-contracts"], ["hrm-contract", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/contracts/view/${data.id}`);
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
      probationPeriod: values.probationPeriod ? Number(values.probationPeriod) : null,
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
    return <div>Loading...</div>;
  }

  if (!contractData) {
    return <div>Contract not found</div>;
  }

  return (
    <ContractForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/contracts/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}

