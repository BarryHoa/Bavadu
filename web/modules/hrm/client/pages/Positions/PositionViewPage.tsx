"use client";

import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { positionService } from "@mdl/hrm/client/services/PositionService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

export default function PositionViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.position.view.labels");
  const getLocalizedText = useLocalizedText();

  const { data: position, isLoading } = useQuery({
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!position) {
    return <div>Position not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex gap-2">
          <IBaseButton
            size="sm"
            variant="light"
            onPress={() => router.push("/workspace/modules/hrm/positions")}
          >
            {t("backToList")}
          </IBaseButton>
          <IBaseButton
            color="primary"
            size="sm"
            onPress={() =>
              router.push(`/workspace/modules/hrm/positions/edit/${id}`)
            }
          >
            {t("edit")}
          </IBaseButton>
        </div>
      </div>

      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">{t("basicInfo")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-default-500">{t("code")}</div>
              <div className="text-base">{position.code}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("name")}</div>
              <div className="text-base">
                {getLocalizedText(position.name as any)}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("department")}</div>
              <div className="text-base">
                {getLocalizedText(position.department?.name as any) || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("jobFamily")}</div>
              <div className="text-base">{position.jobFamily || "—"}</div>
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
