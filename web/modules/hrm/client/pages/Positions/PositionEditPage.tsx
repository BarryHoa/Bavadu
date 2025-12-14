"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { positionService } from "@mdl/hrm/client/services/PositionService";
import PositionForm, {
  type PositionFormValues,
} from "./components/PositionForm/PositionForm";

export default function PositionEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.position.create.labels");

  const { data: positionData, isLoading } = useQuery({
    queryKey: ["hrm-position", id],
    queryFn: async () => {
      const response = await positionService.getById(id);
      if (!response.data) {
        throw new Error(response.message ?? "Position not found");
      }
      return response.data;
    },
    enabled: !!id,
  });

  const {
    handleSubmit: updatePosition,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof positionService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await positionService.update({ ...payload, id });
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToUpdate"));
      }
      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-positions"], ["hrm-position", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/positions/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: PositionFormValues) => {
    const payload = {
      code: values.code.trim(),
      name: values.name || { vi: "", en: "" },
      description: values.description || null,
      departmentId: values.departmentId.trim(),
      jobFamily: values.jobFamily?.trim() || null,
      jobGrade: values.jobGrade?.trim() || null,
      reportsTo: values.reportsTo?.trim() || null,
      minSalary: values.minSalary ? Number(values.minSalary) : null,
      maxSalary: values.maxSalary ? Number(values.maxSalary) : null,
      isActive: values.isActive ?? true,
    };

    await updatePosition({ ...payload, id });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!positionData) {
    return <div>Position not found</div>;
  }

  return (
    <PositionForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/positions/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
      defaultValues={{
        code: positionData.code,
        name: (positionData.name as any) || { vi: "", en: "" },
        description: (positionData.description as any) || undefined,
        departmentId: positionData.departmentId,
        jobFamily: positionData.jobFamily || "",
        jobGrade: positionData.jobGrade || "",
        reportsTo: positionData.reportsTo || "",
        minSalary: positionData.minSalary?.toString() || "",
        maxSalary: positionData.maxSalary?.toString() || "",
        isActive: positionData.isActive ?? true,
      }}
    />
  );
}

