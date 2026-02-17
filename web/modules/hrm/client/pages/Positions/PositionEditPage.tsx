"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import {
  useCreateUpdate,
  useLocalizedText,
  useSetBreadcrumbs,
} from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { positionService } from "@mdl/hrm/client/services/PositionService";

import PositionForm, {
  type PositionFormValues,
} from "./components/PositionForm/PositionForm";

const POSITIONS_LIST_PATH = "/workspace/modules/hrm/positions";

export default function PositionEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.position.create.labels");
  const tView = useTranslations("hrm.position.view.labels");
  const tTitle = useTranslations("hrm.position");
  const getLocalizedText = useLocalizedText();

  const { data: positionData, isLoading, isError, error, refetch } =
    useQuery({
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

  const viewPath = `${POSITIONS_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      positionData
        ? [
            { label: tTitle("title"), href: POSITIONS_LIST_PATH },
            {
              label:
                getLocalizedText(positionData.name as any) ||
                positionData.code,
              href: viewPath,
            },
            { label: t("editPageTitle") },
          ]
        : [
            { label: tTitle("title"), href: POSITIONS_LIST_PATH },
            { label: t("editPageTitle") },
          ],
    [positionData, viewPath, tTitle, t, getLocalizedText],
  );

  useSetBreadcrumbs(breadcrumbs);

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
      router.push(`${POSITIONS_LIST_PATH}/view/${data.data.id}`);
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
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{tView("loading") ?? "Loading..."}</span>
      </div>
    );
  }

  if (isError || !positionData) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : (tView("notFound") ?? "Position not found")}
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
      subtitle={positionData.code}
      title={t("editPageTitle")}
      variant="edit"
    >
      <PositionForm
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
        isSubmitting={isPending}
        mode="edit"
        submitError={submitError}
        onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
