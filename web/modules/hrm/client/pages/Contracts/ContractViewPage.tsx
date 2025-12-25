"use client";

import { IBaseButton, IBaseCard, IBaseCardBody } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { contractService } from "@mdl/hrm/client/services/ContractService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

export default function ContractViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.contract.view.labels");
  const getLocalizedText = useLocalizedText();

  const { data: contract, isLoading } = useQuery({
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex gap-2">
          <IBaseButton
            size="sm"
            variant="light"
            onPress={() => router.push("/workspace/modules/hrm/contracts")}
          >
            {t("backToList")}
          </IBaseButton>
          <IBaseButton
            color="primary"
            size="sm"
            onPress={() =>
              router.push(`/workspace/modules/hrm/contracts/edit/${id}`)
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
                {t("contractNumber")}
              </div>
              <div className="text-base">{contract.contractNumber}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("employee")}</div>
              <div className="text-base">
                {getLocalizedText(contract.employee?.fullName as any) ||
                  contract.employee?.employeeCode ||
                  "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-default-500">
                {t("contractType")}
              </div>
              <div className="text-base">{contract.contractType}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("status")}</div>
              <div className="text-base">{contract.status}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("startDate")}</div>
              <div className="text-base">{contract.startDate}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("endDate")}</div>
              <div className="text-base">{contract.endDate || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-default-500">{t("baseSalary")}</div>
              <div className="text-base">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: contract.currency || "VND",
                }).format(contract.baseSalary)}
              </div>
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
