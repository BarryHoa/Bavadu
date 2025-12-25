"use client";

import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@mdl/hrm/client/services/EmployeeService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

export default function EmployeeViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.employee.view.labels");
  const getLocalizedText = useLocalizedText();

  const { data: employee, isLoading } = useQuery({
    queryKey: ["hrm-employee", id],
    queryFn: async () => {
      const response = await employeeService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? "Employee not found");
      }

      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex gap-2">
          <IBaseButton
            size="sm"
            variant="light"
            onPress={() => router.push("/workspace/modules/hrm/employees")}
          >
            {t("backToList")}
          </IBaseButton>
          <IBaseButton
            color="primary"
            size="sm"
            onPress={() =>
              router.push(`/workspace/modules/hrm/employees/edit/${id}`)
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
              <div className="text-sm text-default-500">
                {t("employeeCode")}
              </div>
              <div className="text-base">{employee.employeeCode}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("fullName")}</div>
              <div className="text-base">
                {getLocalizedText(employee.fullName as any)}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("email")}</div>
              <div className="text-base">{employee.email || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("phone")}</div>
              <div className="text-base">{employee.phone || "—"}</div>
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>

      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-4">
            {t("employmentInfo")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-default-500">{t("department")}</div>
              <div className="text-base">
                {getLocalizedText(employee.department?.name as any) || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("position")}</div>
              <div className="text-base">
                {getLocalizedText(employee.position?.name as any) || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("hireDate")}</div>
              <div className="text-base">{employee.hireDate || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">
                {t("employmentStatus")}
              </div>
              <div className="text-base">
                {employee.employmentStatus || "—"}
              </div>
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
