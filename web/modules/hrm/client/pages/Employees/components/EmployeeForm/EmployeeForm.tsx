"use client";

import type { Address } from "@base/client/interface/Address";
import type { Permission } from "@base/client/services/RoleService";
import type { EmployeeFormValues } from "../../validation/employeeValidation";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { Trash2 } from "lucide-react";

import { IBaseCard, IBaseCardBody } from "@base/client";
import {
  AddressPicker,
  IBaseButton,
  IBaseCheckbox,
  IBaseDatePicker,
  IBaseInput,
  IBaseRadio,
  IBaseRadioGroup,
  IBaseSingleSelectAsync,
  IBaseTabPrimary,
  IBaseTabsPrimary,
  IBaseTextarea,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import RolePermissionMatrix from "@base/client/pages/Settings/Roles/components/RolePermissionMatrix/RolePermissionMatrix";
import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import roleService from "@base/client/services/RoleService";
import sequenceService from "@base/client/services/SequenceService";
import userService from "@base/client/services/UserService";

import { createEmployeeValidation } from "../../validation/employeeValidation";

export type { EmployeeFormValues };

const rpc = new JsonRpcClientService();

const DEFAULT_ADDRESS: Address = {
  street: "",
  postalCode: "",
  country: { id: "VN", name: { vi: "Việt Nam", en: "Vietnam" }, code: "VN" },
  administrativeUnits: [],
  formattedAddress: "",
};

function generateRandomPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancel?: () => void;
  submitError?: string | null;
  isSubmitting?: boolean;
  defaultValues?: Partial<EmployeeFormValues>;
  mode?: "create" | "edit";
}

export default function EmployeeForm({
  onSubmit,
  onCancel,
  submitError,
  isSubmitting = false,
  defaultValues,
  mode = "create",
}: EmployeeFormProps) {
  const t = useTranslations("hrm.employee.create.validation");
  const tLabels = useTranslations("hrm.employee.create.labels");
  const getLocalizedText = useLocalizedText();

  const validation = createEmployeeValidation(t);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const probationEndDateDefault = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 10);
  }, []);

  const { control, handleSubmit, setValue, watch } =
    useForm<EmployeeFormValues>({
      resolver: valibotResolver(validation.employeeFormSchema) as any,
      defaultValues: {
        isActive: true,
        employmentStatus: "active",
        roleIds: [],
        permissionIds: [],
        emails: [""],
        phones: [""],
        gender: "unspecified",
        hireDate: today,
        probationEndDate: probationEndDateDefault,
        address: DEFAULT_ADDRESS as unknown as Record<string, unknown>,
        ...defaultValues,
      },
    });

  const emails = watch("emails") ?? [];
  const phones = watch("phones") ?? [];
  const loginIdentifier = watch("loginIdentifier");
  const roleIds = watch("roleIds") ?? [];
  const permissionIds = watch("permissionIds") ?? [];

  const [loginCheckMessage, setLoginCheckMessage] = useState<string | null>(
    null,
  );
  const [loginCheckLoading, setLoginCheckLoading] = useState(false);

  const { data: roleListData } = useQuery({
    queryKey: ["base-role-list"],
    queryFn: () =>
      rpc.call<{ data: { id: string; code: string; name: unknown }[] }>(
        "base-role.list.getData",
        { page: 1, pageSize: 200 },
      ),
    enabled: mode === "create",
  });

  const { data: permissionListRes, isLoading: permissionsLoading } = useQuery({
    queryKey: ["base-permission-list"],
    queryFn: () => roleService.getPermissionList(),
    enabled: mode === "create",
  });

  const allRoles = useMemo(() => roleListData?.data ?? [], [roleListData]);
  const allPermissions = useMemo(
    () => permissionListRes?.data ?? [],
    [permissionListRes],
  );

  const selectedPermissionIdsSet = useMemo(
    () => new Set<string>(Array.isArray(permissionIds) ? permissionIds : []),
    [permissionIds],
  );

  const checkLoginExists = useCallback(
    async (identifier: string) => {
      const id = identifier?.trim();
      if (!id) {
        setLoginCheckMessage(null);
        return;
      }
      setLoginCheckLoading(true);
      setLoginCheckMessage(null);
      try {
        const { exists } = await userService.checkLoginIdentifierExists(id);
        setLoginCheckMessage(exists ? tLabels("identifierExists") : null);
      } catch {
        setLoginCheckMessage(null);
      } finally {
        setLoginCheckLoading(false);
      }
    },
    [tLabels],
  );

  useEffect(() => {
    const firstEmail =
      Array.isArray(emails) && emails[0] ? emails[0].trim() : "";
    if (firstEmail && !loginIdentifier) {
      setValue("loginIdentifier", firstEmail);
    }
  }, [emails, loginIdentifier, setValue]);

  const handleGenPassword = useCallback(async () => {
    try {
      const value = await sequenceService.getNext("user.initial.password");
      if (value) setValue("password", value);
    } catch {
      setValue("password", generateRandomPassword());
    }
  }, [setValue]);

  const addEmail = useCallback(() => {
    const list = Array.isArray(emails) ? emails : [];
    if (list.length >= 3) return;
    setValue("emails", [...list, ""]);
  }, [emails, setValue]);

  const addPhone = useCallback(() => {
    const list = Array.isArray(phones) ? phones : [];
    if (list.length >= 3) return;
    setValue("phones", [...list, ""]);
  }, [phones, setValue]);

  const removeEmail = useCallback(
    (index: number) => {
      const next = Array.isArray(emails) ? [...emails] : [];
      next.splice(index, 1);
      setValue("emails", next);
    },
    [emails, setValue],
  );

  const removePhone = useCallback(
    (index: number) => {
      const next = Array.isArray(phones) ? [...phones] : [];
      next.splice(index, 1);
      setValue("phones", next);
    },
    [phones, setValue],
  );

  const toggleRole = useCallback(
    (roleId: string, checked: boolean) => {
      const next = Array.isArray(roleIds)
        ? checked
          ? [...roleIds, roleId]
          : roleIds.filter((id) => id !== roleId)
        : checked
          ? [roleId]
          : [];
      setValue("roleIds", next);
    },
    [roleIds, setValue],
  );

  const handlePermissionMatrixChange = useCallback(
    (selectedIds: Set<string>) => {
      setValue("permissionIds", Array.from(selectedIds));
    },
    [setValue],
  );

  useEffect(() => {
    if (mode !== "create" || roleIds.length === 0) return;
    const load = async () => {
      const merged = new Set<string>();
      for (const roleId of roleIds) {
        try {
          const res = await roleService.getRole(roleId);
          const perms = res?.data?.permissions ?? [];
          perms.forEach((p: Permission) => merged.add(p.id));
        } catch {
          /* ignore */
        }
      }
      setValue("permissionIds", Array.from(merged));
    };
    load();
  }, [mode, roleIds, setValue]);

  const onSubmitForm: SubmitHandler<EmployeeFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitForm)}>
      {submitError ? (
        <div
          aria-live="polite"
          className="rounded-xl border-2 border-danger-300 bg-danger-50 px-4 py-3 text-sm font-semibold text-danger-700 shadow-sm"
        >
          {submitError}
        </div>
      ) : null}

      <IBaseTabsPrimary defaultSelectedKey="info" variant="bordered">
        <IBaseTabPrimary key="info" title={tLabels("tabInfo")}>
          <div className="flex flex-col gap-8">
            {/* Section: Personal — Fn, lastName | commonName | Employee code | National ID | Tax ID | DOB | Gender | about | emails | phones | address */}
            <IBaseCard className="border border-default-200/60 shadow-sm">
              <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {tLabels("sectionPersonal")}
                </h2>
                {/* Row: firstName, lastName | commonName */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <IBaseInput
                        {...field}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={tLabels("firstName")}
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
                        label={tLabels("lastName")}
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
                        label={tLabels("commonName")}
                        placeholder={tLabels("commonNamePlaceholder")}
                        size="sm"
                      />
                    )}
                  />
                </div>
                {/* Row: Employee code | National ID | Tax ID */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Controller
                    control={control}
                    name="employeeCode"
                    render={({ field, fieldState }) => (
                      <IBaseInput
                        {...field}
                        isRequired
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={tLabels("employeeCode")}
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
                        label={tLabels("nationalId")}
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
                        label={tLabels("taxId")}
                        size="sm"
                      />
                    )}
                  />
                </div>
                {/* Row: Date of birth | Gender (col 3 để Date of birth không quá dài) */}
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
                        label={tLabels("dateOfBirth")}
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
                          {tLabels("gender")}
                        </label>
                        <IBaseRadioGroup
                          value={field.value ?? "unspecified"}
                          onValueChange={field.onChange}
                          orientation="horizontal"
                        >
                          <IBaseRadio value="male">
                            {tLabels("genderMale")}
                          </IBaseRadio>
                          <IBaseRadio value="female">
                            {tLabels("genderFemale")}
                          </IBaseRadio>
                          <IBaseRadio value="unspecified">
                            {tLabels("genderUnspecified")}
                          </IBaseRadio>
                        </IBaseRadioGroup>
                      </div>
                    )}
                  />
                </div>
                {/* About */}
                <Controller
                  control={control}
                  name="bio"
                  render={({ field, fieldState }) => (
                    <IBaseTextarea
                      {...field}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label={tLabels("bio")}
                      minRows={2}
                      size="sm"
                    />
                  )}
                />
                {/* Emails — ít nhất 1 email; không xóa dòng đầu; nút xóa trong input */}
                <div className="space-y-4">
                  {(Array.isArray(emails) ? emails : []).map((_, i) => (
                    <Controller
                      key={`email-${i}`}
                      control={control}
                      name={`emails.${i}`}
                      render={({ field, fieldState }) => (
                        <IBaseInput
                          {...field}
                          className="w-full"
                          endContent={
                            i > 0 ? (
                              <button
                                type="button"
                                aria-label={tLabels("removeEmail")}
                                className="rounded-small p-1 text-default-400 outline-none transition-colors hover:bg-danger-100 hover:text-danger"
                                onClick={() => removeEmail(i)}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            ) : undefined
                          }
                          errorMessage={fieldState.error?.message}
                          isInvalid={fieldState.invalid}
                          label={i === 0 ? tLabels("emails") : undefined}
                          size="sm"
                          type="email"
                        />
                      )}
                    />
                  ))}
                  {(emails?.length ?? 0) < 3 && (
                    <IBaseButton
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={addEmail}
                    >
                      {tLabels("addEmail")}
                    </IBaseButton>
                  )}
                </div>
                {/* Phones — ít nhất 1 SĐT; tối đa 3; không xóa dòng đầu; nút xóa trong input */}
                <div className="space-y-4">
                  {(Array.isArray(phones) ? phones : []).map((_, i) => (
                    <Controller
                      key={`phone-${i}`}
                      control={control}
                      name={`phones.${i}`}
                      render={({ field, fieldState }) => (
                        <IBaseInput
                          {...field}
                          className="w-full"
                          endContent={
                            i > 0 ? (
                              <button
                                type="button"
                                aria-label={tLabels("removePhone")}
                                className="rounded-small p-1 text-default-400 outline-none transition-colors hover:bg-danger-100 hover:text-danger"
                                onClick={() => removePhone(i)}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            ) : undefined
                          }
                          errorMessage={fieldState.error?.message}
                          isInvalid={fieldState.invalid}
                          label={i === 0 ? tLabels("phones") : undefined}
                          size="sm"
                        />
                      )}
                    />
                  ))}
                  {(phones?.length ?? 0) < 3 && (
                    <IBaseButton
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={addPhone}
                    >
                      {tLabels("addPhone")}
                    </IBaseButton>
                  )}
                </div>
                {/* Address — không disabled */}
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
                            label={tLabels("address")}
                            readOnly
                            size="sm"
                            value={displayVal}
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

            {/* Section: Employment (other info — department, position, hire, bank, emergency) */}
            <IBaseCard className="border border-default-200/60 shadow-sm">
              <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {tLabels("sectionEmployment")}
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                      control={control}
                      name="departmentId"
                      render={({ field, fieldState }) => (
                        <IBaseSingleSelectAsync
                          isRequired
                          callWhen="mount"
                          errorMessage={fieldState.error?.message}
                          isInvalid={fieldState.invalid}
                          label={tLabels("department")}
                          model="department.dropdown"
                          selectedKey={field.value}
                          size="sm"
                          onSelectionChange={(key) =>
                            field.onChange(key || undefined)
                          }
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="positionId"
                      render={({ field, fieldState }) => (
                        <IBaseSingleSelectAsync
                          isRequired
                          callWhen="mount"
                          errorMessage={fieldState.error?.message}
                          isInvalid={fieldState.invalid}
                          label={tLabels("position")}
                          model="position.dropdown"
                          selectedKey={field.value}
                          size="sm"
                          onSelectionChange={(key) =>
                            field.onChange(key || undefined)
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                      control={control}
                      name="hireDate"
                      render={({ field, fieldState }) => (
                        <IBaseDatePicker
                          allowClear
                          errorMessage={fieldState.error?.message}
                          format="YYYY-MM-DD"
                          isInvalid={fieldState.invalid}
                          label={tLabels("hireDate")}
                          size="sm"
                          value={field.value ?? null}
                          onChange={(v) => field.onChange(v ?? undefined)}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="probationEndDate"
                      render={({ field, fieldState }) => (
                        <IBaseDatePicker
                          allowClear
                          errorMessage={fieldState.error?.message}
                          format="YYYY-MM-DD"
                          isInvalid={fieldState.invalid}
                          label={tLabels("probationEndDate")}
                          size="sm"
                          value={field.value ?? null}
                          onChange={(v) => field.onChange(v ?? undefined)}
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                      control={control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <IBaseInput
                          {...field}
                          label={tLabels("emergencyContactName")}
                          size="sm"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <IBaseInput
                          {...field}
                          label={tLabels("emergencyContactPhone")}
                          size="sm"
                        />
                      )}
                    />
                  </div>
                  {/* Bank — đặt sau Emergency */}
                  <div className="rounded-lg border border-default-200/60 bg-default-50/50 p-4">
                    <h3 className="mb-3 text-sm font-medium text-foreground">
                      {tLabels("sectionBank")}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Controller
                        control={control}
                        name="bankName"
                        render={({ field }) => (
                          <IBaseInput
                            {...field}
                            label={tLabels("bankName")}
                            size="sm"
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="bankAccount"
                        render={({ field }) => (
                          <IBaseInput
                            {...field}
                            label={tLabels("bankAccount")}
                            size="sm"
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="bankBranch"
                        render={({ field }) => (
                          <IBaseInput
                            {...field}
                            label={tLabels("bankBranch")}
                            size="sm"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </IBaseCardBody>
            </IBaseCard>

            {/* Section: Education & Experience */}
            <IBaseCard className="border border-default-200/60 shadow-sm">
              <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {tLabels("sectionEducationExperience")}
                </h2>
                <Controller
                  control={control}
                  name="educationLevel"
                  render={({ field, fieldState }) => (
                    <IBaseTextarea
                      {...field}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label={tLabels("educationLevel")}
                      minRows={2}
                      placeholder={tLabels("educationLevelPlaceholder")}
                      size="sm"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="experience"
                  render={({ field, fieldState }) => (
                    <IBaseTextarea
                      {...field}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label={tLabels("experience")}
                      minRows={3}
                      placeholder={tLabels("experiencePlaceholder")}
                      size="sm"
                    />
                  )}
                />
              </IBaseCardBody>
            </IBaseCard>

            {/* Section: Login (create only) — căn nút với input */}
            {mode === "create" && (
              <IBaseCard className="border border-default-200/60 shadow-sm">
                <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
                  <h2 className="text-lg font-semibold text-foreground">
                    {tLabels("sectionAccount")}
                  </h2>
                  <Controller
                    control={control}
                    name="loginIdentifier"
                    render={({ field, fieldState }) => (
                      <div className="space-y-1">
                        <IBaseInput
                          {...field}
                          errorMessage={
                            fieldState.error?.message ??
                            loginCheckMessage ??
                            undefined
                          }
                          isInvalid={fieldState.invalid || !!loginCheckMessage}
                          label={tLabels("loginIdentifier")}
                          placeholder={tLabels("loginIdentifierPlaceholder")}
                          size="sm"
                          onBlur={() => checkLoginExists(field.value ?? "")}
                        />
                        {loginCheckLoading && (
                          <span className="text-default-500 text-xs">
                            {tLabels("checkingLogin")}
                          </span>
                        )}
                      </div>
                    )}
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                    <Controller
                      control={control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <IBaseInput
                          {...field}
                          className="sm:min-w-[240px] sm:flex-1"
                          errorMessage={fieldState.error?.message}
                          isInvalid={fieldState.invalid}
                          label={tLabels("password")}
                          placeholder={tLabels("passwordPlaceholder")}
                          size="sm"
                          type="password"
                        />
                      )}
                    />
                    <IBaseButton
                      className="shrink-0"
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={handleGenPassword}
                    >
                      {tLabels("generatePassword")}
                    </IBaseButton>
                  </div>
                </IBaseCardBody>
              </IBaseCard>
            )}


            {/* Section: Ghi chú */}
            <IBaseCard className="border border-default-200/60 shadow-sm">
              <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  {tLabels("sectionNotes")}
                </h2>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <IBaseTextarea
                      {...field}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      minRows={3}
                      placeholder={tLabels("notesPlaceholder")}
                      size="sm"
                    />
                  )}
                />
              </IBaseCardBody>
            </IBaseCard>
          </div>
        </IBaseTabPrimary>

        {mode === "create" && (
          <IBaseTabPrimary key="permissions" title={tLabels("tabPermissions")}>
            <div className="flex flex-col gap-6">
              <IBaseCard className="border border-default-200/60 shadow-sm">
                <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
                  <h2 className="text-lg font-semibold text-foreground">
                    {tLabels("selectRoles")}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {allRoles.map((role) => (
                      <IBaseCheckbox
                        key={role.id}
                        isSelected={roleIds.includes(role.id)}
                        onValueChange={(checked) =>
                          toggleRole(role.id, !!checked)
                        }
                      >
                        {getLocalizedText(role.name as any) ?? role.code}
                      </IBaseCheckbox>
                    ))}
                    {allRoles.length === 0 && (
                      <p className="text-default-500 text-sm">
                        {tLabels("noRoles")}
                      </p>
                    )}
                  </div>
                </IBaseCardBody>
              </IBaseCard>
              <RolePermissionMatrix
                isLoading={permissionsLoading}
                permissions={allPermissions}
                selectedIds={selectedPermissionIdsSet}
                onSelectionChange={handlePermissionMatrixChange}
              />
            </div>
          </IBaseTabPrimary>
        )}
      </IBaseTabsPrimary>

      <div className="flex flex-wrap items-center gap-3 border-t border-default-200 pt-4">
        <IBaseButton
          color="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          size="md"
          type="submit"
        >
          {mode === "create" ? tLabels("saveCreate") : tLabels("saveUpdate")}
        </IBaseButton>
        {onCancel && (
          <IBaseButton
            color="default"
            size="md"
            variant="flat"
            onPress={onCancel}
          >
            {tLabels("cancel")}
          </IBaseButton>
        )}
      </div>
    </form>
  );
}
