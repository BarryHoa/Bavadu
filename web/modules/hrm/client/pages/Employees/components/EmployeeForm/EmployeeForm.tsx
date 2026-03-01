"use client";

import type { Permission } from "@base/client/services/RoleService";
import type { EmployeeFormValues } from "../../validation/employeeValidation";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { IBaseButton, IBaseTabPrimary, IBaseTabsPrimary } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import roleService from "@base/client/services/RoleService";
import sequenceService from "@base/client/services/SequenceService";
import userService from "@base/client/services/UserService";
import { generateRandomPassword } from "@base/client/utils";

import { createEmployeeValidation } from "../../validation/employeeValidation";
import {
  DEFAULT_ADDRESS,
  EmployeeFormAccountSection,
  EmployeeFormEducationSection,
  EmployeeFormEmploymentSection,
  EmployeeFormNotesSection,
  EmployeeFormPersonalSection,
  EmployeeFormPermissionsSection,
} from "./sections";

export type { EmployeeFormValues };

const rpc = new JsonRpcClientService();

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

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
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
  const roleIds = watch("roleIds") ?? [];
  const permissionIds = watch("permissionIds") ?? [];

  const [loginCheckMessage, setLoginCheckMessage] = useState<string | null>(
    null,
  );
  const [loginCheckLoading, setLoginCheckLoading] = useState(false);

  const { data: roleListData } = useQuery({
    queryKey: ["base-role-list"],
    queryFn: () =>
      rpc.call<{
        data: { id: string; code: string; name: unknown; isSystem?: boolean }[];
      }>(
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

  const allRoles = useMemo(
    () =>
      (roleListData?.data ?? []).filter(
        (r) => r.code !== "system",
      ),
    [roleListData],
  );
  const allPermissions = useMemo(
    () => permissionListRes?.data ?? [],
    [permissionListRes],
  );

  const selectedPermissionIdsSet = useMemo(
    () => new Set<string>(Array.isArray(permissionIds) ? permissionIds : []),
    [permissionIds],
  );

  const checkLoginExists = useCallback(async (identifier: string) => {
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
  }, []);

  const handleGenPassword = useCallback(() => {
    setValue("password", generateRandomPassword());
  }, []);

  const [employeeCodeGenLoading, setEmployeeCodeGenLoading] = useState(false);
  const handleGenEmployeeCode = useCallback(async () => {
    setEmployeeCodeGenLoading(true);
    try {
      const value = await sequenceService.getNext("employee_code");
      if (value) setValue("employeeCode", value);
    } finally {
      setEmployeeCodeGenLoading(false);
    }
  }, []);

  const addEmail = useCallback(() => {
    const list = Array.isArray(emails) ? emails : [];
    if (list.length >= 3) return;
    setValue("emails", [...list, ""]);
  }, [emails]);

  const addPhone = useCallback(() => {
    const list = Array.isArray(phones) ? phones : [];
    if (list.length >= 3) return;
    setValue("phones", [...list, ""]);
  }, [phones]);

  const removeEmail = useCallback(
    (index: number) => {
      const next = Array.isArray(emails) ? [...emails] : [];
      next.splice(index, 1);
      setValue("emails", next);
    },
    [emails],
  );

  const removePhone = useCallback(
    (index: number) => {
      const next = Array.isArray(phones) ? [...phones] : [];
      next.splice(index, 1);
      setValue("phones", next);
    },
    [phones],
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
    [roleIds],
  );

  const handlePermissionMatrixChange = useCallback(
    (selectedIds: Set<string>) => {
      setValue("permissionIds", Array.from(selectedIds));
    },
    [],
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
  }, [mode, roleIds]);

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
            <EmployeeFormPersonalSection
              control={control}
              setValue={setValue}
              errors={errors}
              emails={emails}
              phones={phones}
              employeeCodeGenLoading={employeeCodeGenLoading}
              onGenEmployeeCode={handleGenEmployeeCode}
              onAddEmail={addEmail}
              onAddPhone={addPhone}
              onRemoveEmail={removeEmail}
              onRemovePhone={removePhone}
            />
            <EmployeeFormEmploymentSection control={control} />
            {mode === "create" && (
              <EmployeeFormAccountSection
                control={control}
                loginCheckMessage={loginCheckMessage}
                loginCheckLoading={loginCheckLoading}
                onCheckLoginExists={checkLoginExists}
                onGenPassword={handleGenPassword}
              />
            )}
            <EmployeeFormEducationSection control={control} />
            <EmployeeFormNotesSection control={control} />
          </div>
        </IBaseTabPrimary>

        {mode === "create" && (
          <IBaseTabPrimary key="permissions" title={tLabels("tabPermissions")}>
            <EmployeeFormPermissionsSection
              roleIds={roleIds}
              allRoles={allRoles}
              allPermissions={allPermissions}
              permissionsLoading={permissionsLoading}
              selectedPermissionIdsSet={selectedPermissionIdsSet}
              onToggleRole={toggleRole}
              onPermissionMatrixChange={handlePermissionMatrixChange}
              getLocalizedText={getLocalizedText}
            />
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
