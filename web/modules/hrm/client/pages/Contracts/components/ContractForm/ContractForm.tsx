import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseDatePicker,
  IBaseInput,
  IBaseSingleSelect,
  IBaseSingleSelectAsync,
  IBaseTextarea,
} from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

import { Contract } from "../../../../interface/Contract";

export interface ContractFormProps {
  id?: string;
  initialData?: Contract;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ContractForm({
  id,
  initialData,
  onSuccess,
  onCancel,
}: ContractFormProps) {
  const t = useTranslations("hrm.contracts");
  const tCommon = useTranslations("common.actions");
  const getLocalizedText = useLocalizedText();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Contract>({
    defaultValues: initialData || {
      status: "draft",
    },
  });

  const { mutate: save, isPending } = useCreateUpdate({
    resource: "hrm/contracts",
    id,
    onSuccess,
  });

  const onSubmit = (data: Contract) => {
    save(data);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IBaseCard>
          <IBaseCardBody className="space-y-4 p-4">
            <IBaseSingleSelectAsync
              control={control}
              label={t("fields.employee")}
              name="employeeId"
              resource="hrm/employees"
              rules={{ required: true }}
            />
            <IBaseInput
              {...register("contractNumber", { required: true })}
              errorMessage={errors.contractNumber?.message}
              isInvalid={!!errors.contractNumber}
              label={t("fields.contractNumber")}
            />
            <IBaseSingleSelect
              control={control}
              label={t("fields.type")}
              name="type"
              options={[
                { label: t("types.permanent"), value: "permanent" },
                { label: t("types.fixed-term"), value: "fixed-term" },
                { label: t("types.probation"), value: "probation" },
              ]}
              rules={{ required: true }}
            />
          </IBaseCardBody>
        </IBaseCard>

        <IBaseCard>
          <IBaseCardBody className="space-y-4 p-4">
            <IBaseDatePicker
              control={control}
              label={t("fields.startDate")}
              name="startDate"
              rules={{ required: true }}
            />
            <IBaseDatePicker
              control={control}
              label={t("fields.endDate")}
              name="endDate"
            />
            <IBaseSingleSelect
              control={control}
              label={t("fields.status")}
              name="status"
              options={[
                { label: t("status.draft"), value: "draft" },
                { label: t("status.active"), value: "active" },
                { label: t("status.expired"), value: "expired" },
                { label: t("status.terminated"), value: "terminated" },
              ]}
              rules={{ required: true }}
            />
          </IBaseCardBody>
        </IBaseCard>
      </div>

      <IBaseCard>
        <IBaseCardBody className="p-4">
          <IBaseTextarea
            {...register("notes")}
            label={t("fields.notes")}
            rows={4}
          />
        </IBaseCardBody>
      </IBaseCard>

      <div className="flex justify-end gap-3">
        <IBaseButton variant="light" onPress={onCancel}>
          {tCommon("cancel")}
        </IBaseButton>
        <IBaseButton color="primary" isLoading={isPending} type="submit">
          {tCommon("save")}
        </IBaseButton>
      </div>
    </form>
  );
}
