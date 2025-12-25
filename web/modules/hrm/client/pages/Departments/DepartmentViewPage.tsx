"use client";

import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { departmentService } from "@mdl/hrm/client/services/DepartmentService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

export default function DepartmentViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.department.view.labels");
  const getLocalizedText = useLocalizedText();

  const { data: department, isLoading } = useQuery({
    queryKey: ["hrm-department", id],
    queryFn: async () => {
      const response = await departmentService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? "Department not found");
      }

      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!department) {
    return <div>Department not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex gap-2">
          <IBaseButton
            size="sm"
            variant="light"
            onPress={() => router.push("/workspace/modules/hrm/departments")}
          >
            {t("backToList")}
          </IBaseButton>
          <IBaseButton
            color="primary"
            size="sm"
            onPress={() =>
              router.push(`/workspace/modules/hrm/departments/edit/${id}`)
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
              <div className="text-base">{department.code}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("name")}</div>
              <div className="text-base">
                {getLocalizedText(department.name as any)}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">
                {t("parentDepartment")}
              </div>
              <div className="text-base">
                {getLocalizedText(department.parent?.name as any) || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("level")}</div>
              <div className="text-base">{department.level || "—"}</div>
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
