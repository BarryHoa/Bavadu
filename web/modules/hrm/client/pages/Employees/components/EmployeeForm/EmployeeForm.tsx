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
  IBaseTab,
  IBaseTabs,
} from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

import { Employee } from "../../../../interface/Employee";

export interface EmployeeFormProps {
  id?: string;
  initialData?: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EmployeeForm({
  id,
  initialData,
  onSuccess,
  onCancel,
}: EmployeeFormProps) {
  const t = useTranslations("hrm.employees");
  const tCommon = useTranslations("common.actions");
  const getLocalizedText = useLocalizedText();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Employee>({
    defaultValues: initialData || {
      status: "active",
    },
  });

  const { mutate: save, isPending } = useCreateUpdate({
    resource: "hrm/employees",
    id,
    onSuccess,
  });

  const onSubmit = (data: Employee) => {
    save(data);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <IBaseTabs aria-label="Employee Form Tabs" variant="underlined">
        <IBaseTab key="personal" title={t("tabs.personal")}>
          <IBaseCard>
            <IBaseCardBody className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IBaseInput
                  {...register("firstName", { required: true })}
                  errorMessage={errors.firstName?.message}
                  isInvalid={!!errors.firstName}
                  label={t("fields.firstName")}
                />
                <IBaseInput
                  {...register("lastName", { required: true })}
                  errorMessage={errors.lastName?.message}
                  isInvalid={!!errors.lastName}
                  label={t("fields.lastName")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IBaseInput
                  {...register("email", { required: true })}
                  errorMessage={errors.email?.message}
                  isInvalid={!!errors.email}
                  label={t("fields.email")}
                  type="email"
                />
                <IBaseInput {...register("phone")} label={t("fields.phone")} />
              </div>
              <IBaseDatePicker
                control={control}
                label={t("fields.birthDate")}
                name="birthDate"
              />
              <IBaseSingleSelect
                control={control}
                label={t("fields.gender")}
                name="gender"
                options={[
                  { label: t("gender.male"), value: "male" },
                  { label: t("gender.female"), value: "female" },
                  { label: t("gender.other"), value: "other" },
                ]}
              />
            </IBaseCardBody>
          </IBaseCard>
        </IBaseTab>

        <IBaseTab key="employment" title={t("tabs.employment")}>
          <IBaseCard>
            <IBaseCardBody className="space-y-4 p-4">
              <IBaseInput
                {...register("employeeId", { required: true })}
                errorMessage={errors.employeeId?.message}
                isInvalid={!!errors.employeeId}
                label={t("fields.employeeId")}
              />
              <IBaseSingleSelectAsync
                control={control}
                label={t("fields.department")}
                name="departmentId"
                resource="hrm/departments"
              />
              <IBaseSingleSelectAsync
                control={control}
                label={t("fields.position")}
                name="positionId"
                resource="hrm/positions"
              />
              <IBaseDatePicker
                control={control}
                label={t("fields.joinDate")}
                name="joinDate"
                rules={{ required: true }}
              />
              <IBaseSingleSelect
                control={control}
                label={t("fields.status")}
                name="status"
                options={[
                  { label: t("status.active"), value: "active" },
                  { label: t("status.inactive"), value: "inactive" },
                  { label: t("status.on-leave"), value: "on-leave" },
                  { label: t("status.terminated"), value: "terminated" },
                ]}
                rules={{ required: true }}
              />
            </IBaseCardBody>
          </IBaseCard>
        </IBaseTab>

        <IBaseTab key="bank" title={t("tabs.bank")}>
          <IBaseCard>
            <IBaseCardBody className="space-y-4 p-4">
              <IBaseInput
                {...register("bankName")}
                label={t("fields.bankName")}
              />
              <IBaseInput
                {...register("bankAccountName")}
                label={t("fields.bankAccountName")}
              />
              <IBaseInput
                {...register("bankAccountNumber")}
                label={t("fields.bankAccountNumber")}
              />
            </IBaseCardBody>
          </IBaseCard>
        </IBaseTab>
      </IBaseTabs>

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
