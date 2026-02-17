"use client";

import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { positionService } from "@mdl/hrm/client/services/PositionService";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";

const POSITIONS_LIST_PATH = "/workspace/modules/hrm/positions";

export default function PositionViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.position.view.labels");
  const tTitle = useTranslations("hrm.position");
  const getLocalizedText = useLocalizedText();

  const {
    data: position,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
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

  const breadcrumbs = useMemo(
    () =>
      position
        ? [
            { label: tTitle("title"), href: POSITIONS_LIST_PATH },
            {
              label:
                getLocalizedText(position.name as any) || position.code,
              href: `${POSITIONS_LIST_PATH}/view/${id}`,
            },
          ]
        : [
            { label: tTitle("title"), href: POSITIONS_LIST_PATH },
            { label: isLoading ? "..." : (t("notFound") ?? "Not found") },
          ],
    [position, id, isLoading, tTitle, t, getLocalizedText],
  );

  useSetBreadcrumbs(breadcrumbs);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{t("loading") ?? "Loading..."}</span>
      </div>
    );
  }

  if (isError || !position) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : (t("notFound") ?? "Position not found")}
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

  const positionName = getLocalizedText(position.name as any) || position.code;
  const editPath = `${POSITIONS_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      headerActions={
        <IBaseButton
          color="primary"
          size="md"
          startContent={<Pencil size={16} />}
          onPress={() => router.push(editPath)}
        >
          {t("edit")}
        </IBaseButton>
      }
      maxWidth="content"
      subtitle={position.code}
      title={positionName}
      variant="detail"
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("basicInfo")}
            </h2>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("code")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {position.code}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("name")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {positionName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("department")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {getLocalizedText(position.department?.name as any) || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("jobFamily")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {position.jobFamily || "—"}
              </dd>
            </div>
          </dl>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
