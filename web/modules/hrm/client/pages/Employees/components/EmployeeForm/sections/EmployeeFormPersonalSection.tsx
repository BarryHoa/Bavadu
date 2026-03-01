"use client";

import type { Address } from "@base/client/interface/Address";
import type { EmployeeFormValues } from "../../../validation/employeeValidation";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { RefreshCw, Trash2 } from "lucide-react";

import { IBaseCard, IBaseCardBody } from "@base/client";
import {
  AddressPicker,
  IBaseButton,
  IBaseDatePicker,
  IBaseInput,
  IBaseInputEmail,
  IBaseInputPhone,
  IBaseRadio,
  IBaseRadioGroup,
  IBaseTextarea,
  IBaseTooltip,
} from "@base/client/components";

export const DEFAULT_ADDRESS: Address = {
  street: "",
  postalCode: "",
  country: { id: "VN", name: { vi: "Việt Nam", en: "Vietnam" }, code: "VN" },
  administrativeUnits: [],
  formattedAddress: "",
};

interface EmployeeFormPersonalSectionProps {
  control: Control<EmployeeFormValues>;
  setValue: UseFormSetValue<EmployeeFormValues>;
  errors: FieldErrors<EmployeeFormValues>;
  emails: string[];
  phones: string[];
  employeeCodeGenLoading: boolean;
  onGenEmployeeCode: () => void;
  onAddEmail: () => void;
  onAddPhone: () => void;
  onRemoveEmail: (index: number) => void;
  onRemovePhone: (index: number) => void;
}

export function EmployeeFormPersonalSection({
  control,
  setValue,
  errors,
  emails,
  phones,
  employeeCodeGenLoading,
  onGenEmployeeCode,
  onAddEmail,
  onAddPhone,
  onRemoveEmail,
  onRemovePhone,
}: EmployeeFormPersonalSectionProps) {
  const t = useTranslations("hrm.employee.create.labels");
  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
        <h2 className="text-lg font-semibold text-foreground">
          {t("sectionPersonal")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("firstName")}
                size="sm"
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("lastName")}
                size="sm"
              />
            )}
          />
          <Controller
            control={control}
            name="commonName"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("commonName")}
                placeholder={t("commonNamePlaceholder")}
                size="sm"
              />
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={control}
            name="employeeCode"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                isRequired
                endContent={
                  <IBaseTooltip
                    content={t("generateEmployeeCodeTooltip")}
                    placement="top"
                  >
                    <button
                      type="button"
                      aria-label={t("generateEmployeeCode")}
                      className="rounded-small p-1 text-default-400 outline-none transition-colors hover:bg-default-100 hover:text-foreground disabled:opacity-50"
                      disabled={employeeCodeGenLoading}
                      onClick={onGenEmployeeCode}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <RefreshCw
                        className={`size-4 ${employeeCodeGenLoading ? "animate-spin" : ""}`}
                      />
                    </button>
                  </IBaseTooltip>
                }
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("employeeCode")}
                size="sm"
              />
            )}
          />
          <Controller
            control={control}
            name="nationalId"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                isRequired
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("nationalId")}
                size="sm"
              />
            )}
          />
          <Controller
            control={control}
            name="taxId"
            render={({ field, fieldState }) => (
              <IBaseInput
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                label={t("taxId")}
                size="sm"
              />
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field, fieldState }) => (
              <IBaseDatePicker
                allowClear
                errorMessage={fieldState.error?.message}
                format="YYYY-MM-DD"
                isInvalid={fieldState.invalid}
                label={t("dateOfBirth")}
                size="sm"
                value={field.value ?? null}
                onChange={(v) => field.onChange(v ?? undefined)}
              />
            )}
          />
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t("gender")}
                </label>
                <IBaseRadioGroup
                  value={field.value ?? "unspecified"}
                  onValueChange={field.onChange}
                  orientation="horizontal"
                >
                  <IBaseRadio value="male">{t("genderMale")}</IBaseRadio>
                  <IBaseRadio value="female">{t("genderFemale")}</IBaseRadio>
                  <IBaseRadio value="unspecified">
                    {t("genderUnspecified")}
                  </IBaseRadio>
                </IBaseRadioGroup>
              </div>
            )}
          />
        </div>
        <Controller
          control={control}
          name="bio"
          render={({ field, fieldState }) => (
            <IBaseTextarea
              {...field}
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label={t("bio")}
              minRows={2}
              size="sm"
            />
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            {(Array.isArray(emails) ? emails : []).map((_, i) => (
              <Controller
                key={`email-${i}`}
                control={control}
                name={`emails.${i}`}
                render={({ field, fieldState }) => (
                  <IBaseInputEmail
                    {...field}
                    endContent={
                      i > 0 ? (
                        <button
                          type="button"
                          aria-label={t("removeEmail")}
                          className="rounded-small p-1 text-default-400 outline-none transition-colors hover:bg-danger-100 hover:text-danger"
                          onClick={() => onRemoveEmail(i)}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : undefined
                    }
                    errorMessage={
                      fieldState.error?.message ??
                      (i === 0 ? errors.emails?.message : undefined)
                    }
                    isInvalid={
                      fieldState.invalid || (i === 0 && !!errors.emails)
                    }
                    isRequired={i === 0}
                    label={i === 0 ? t("emails") : undefined}
                    size="sm"
                  />
                )}
              />
            ))}
            {(emails?.length ?? 0) < 3 && (
              <IBaseButton
                color="primary"
                size="sm"
                variant="flat"
                onPress={onAddEmail}
              >
                {t("addEmail")}
              </IBaseButton>
            )}
          </div>
          <div className="space-y-4">
            {(Array.isArray(phones) ? phones : []).map((_, i) => (
              <Controller
                key={`phone-${i}`}
                control={control}
                name={`phones.${i}`}
                render={({ field, fieldState }) => (
                  <IBaseInputPhone
                    endContent={
                      i > 0 ? (
                        <button
                          type="button"
                          aria-label={t("removePhone")}
                          className="rounded-small p-1 text-default-400 outline-none transition-colors hover:bg-danger-100 hover:text-danger"
                          onClick={() => onRemovePhone(i)}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : undefined
                    }
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    label={i === 0 ? t("phones") : undefined}
                    size="sm"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                )}
              />
            ))}
            {(phones?.length ?? 0) < 3 && (
              <IBaseButton
                color="primary"
                size="sm"
                variant="flat"
                onPress={onAddPhone}
              >
                {t("addPhone")}
              </IBaseButton>
            )}
          </div>
        </div>
        <Controller
          control={control}
          name="address"
          render={({ field }) => {
            const addr = (field.value as Address) ?? DEFAULT_ADDRESS;
            const displayVal =
              typeof addr?.formattedAddress === "string"
                ? addr.formattedAddress
                : "";
            return (
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <IBaseInput
                    label={t("address")}
                    size="sm"
                    value={displayVal}
                    onValueChange={(value) =>
                      setValue("address", {
                        ...addr,
                        formattedAddress: value ?? "",
                      } as unknown as Record<string, unknown>)
                    }
                  />
                </div>
                <AddressPicker
                  value={addr}
                  onChange={() => {}}
                  onAddressChange={(a) =>
                    setValue(
                      "address",
                      a as unknown as Record<string, unknown>,
                    )
                  }
                />
              </div>
            );
          }}
        />
      </IBaseCardBody>
    </IBaseCard>
  );
}
