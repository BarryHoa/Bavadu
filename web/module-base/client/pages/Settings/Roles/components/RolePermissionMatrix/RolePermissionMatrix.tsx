"use client";

import type { Permission } from "@base/client/services/RoleService";

import { groupBy } from "lodash";
import { useTranslations } from "next-intl";
import { useCallback, useId, useMemo } from "react";

import {
  IBaseAccordion,
  IBaseAccordionItem,
  IBaseButton,
  IBaseCheckbox,
  IBaseSwitch,
} from "@base/client/components";

type ResourcePermissions = Record<string, Permission>; // action -> permission
type ModulePermissions = {
  module: string;
  resources: { resource: string; permissions: Permission[] }[];
  actions: string[]; // ordered union of actions in this module
};
type GroupedPermissions = ModulePermissions[]; // module -> permissions

const ACTION_ORDER = [
  "view",
  "create",
  "update",
  "delete",
  "print",
  "export",
  "import",
  "approve",
];
const MODULE_ORDER = {
  base: 0,
  hrm: 1,
  products: 2,
  "b2b-sales": 3,
  "b2c-sales": 4,
  purchase: 5,
  stock: 6,
  other: 7,
  report: 8,
};

/** Group permissions by module → resource → action (plain objects for simplicity) */
function groupPermissions(permissions: Permission[]): GroupedPermissions {
  const grouped = groupBy(permissions, "module");

  return Object.entries(grouped)
    .sort((a, b) => {
      return (
        MODULE_ORDER[a[0] as keyof typeof MODULE_ORDER] -
        MODULE_ORDER[b[0] as keyof typeof MODULE_ORDER]
      );
    })
    .map(([moduleKey, permissions]) => {
      return {
        module: moduleKey,
        resources: Object.entries(groupBy(permissions, "resource")).map(
          ([resourceKey, permissions]) => {
            return {
              resource: resourceKey,
              permissions: permissions as unknown as Permission[],
            };
          },
        ),
        actions: Array.from(
          new Set(permissions.map((p) => p.action)),
        ) as unknown as string[],
      };
    });
}

/** Get ordered actions for a module - known actions first, then any extras */
function getOrderedActions(actions: string[]): string[] {
  const unique = Array.from(new Set(actions));
  const ordered = ACTION_ORDER.filter((a) => unique.includes(a));
  const rest = unique.filter((a) => !ACTION_ORDER.includes(a)).sort();

  return [...ordered, ...rest];
}

const formatLabel = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

function getActionLabel(t: (key: string) => string, action: string): string {
  try {
    const label = t(`action.${action}`);

    if (label && !label.includes("permissionMatrix")) return label;
  } catch {
    /* ignore */
  }

  return formatLabel(action);
}

export interface RolePermissionMatrixProps {
  permissions: Permission[];
  selectedIds: Set<string>;
  isLoading?: boolean;
  onSelectionChange: (selectedIds: Set<string>) => void;
  // Optional per-module admin flags. When a module is admin, its checkboxes are disabled.
  adminModules?: Record<string, boolean>;
  onAdminModulesChange?: (value: Record<string, boolean>) => void;
}

export default function RolePermissionMatrix({
  permissions,
  selectedIds,
  isLoading,
  onSelectionChange,
  adminModules,
  onAdminModulesChange,
}: RolePermissionMatrixProps) {
  const t = useTranslations("settings.roles.permissionMatrix");
  const fieldsetId = useId();

  const grouped = useMemo(() => groupPermissions(permissions), [permissions]);

  console.log({
    grouped,
  });

  const togglePermission = useCallback(
    (perm: Permission, checked: boolean) => {
      const next = new Set(selectedIds);

      if (checked) {
        next.add(perm.id);
      } else {
        next.delete(perm.id);
      }
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange],
  );

  const toggleResource = useCallback(
    (moduleKey: string, resourceKey: string, checked: boolean) => {
      const allPermissions = permissions.filter(
        (p) => p.module === moduleKey && p.resource === resourceKey,
      );
      const next = new Set(selectedIds);

      for (const perm of allPermissions) {
        if (checked) {
          next.add(perm.id);
        } else {
          next.delete(perm.id);
        }
      }
      onSelectionChange(next);
    },
    [permissions, selectedIds, onSelectionChange],
  );

  const toggleModule = useCallback(
    (moduleKey: string, checked: boolean) => {
      const allPermissions = permissions.filter((p) => p.module === moduleKey);
      const next = new Set(selectedIds);

      for (const perm of allPermissions) {
        if (checked) {
          next.add(perm.id);
        } else {
          next.delete(perm.id);
        }
      }
      onSelectionChange(next);
    },
    [permissions, selectedIds, onSelectionChange],
  );

  const selectAll = useCallback(() => {
    onSelectionChange(new Set(permissions.map((p) => p.id)));
  }, [permissions, onSelectionChange]);

  const deselectAll = useCallback(() => {
    onSelectionChange(new Set());
    if (onAdminModulesChange) {
      onAdminModulesChange({});
    }
  }, [onSelectionChange, onAdminModulesChange]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-default-200 bg-default-50 px-4 py-8 text-center text-sm text-default-500">
        {t("loading")}
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="rounded-lg border border-default-200 bg-default-50 px-4 py-8 text-center text-sm text-default-500">
        {t("noPermissions")}
      </div>
    );
  }

  return (
    <fieldset
      aria-describedby={`${fieldsetId}-description`}
      className="flex flex-col gap-4 rounded-lg border border-default-200 bg-default-50/30 px-4 py-4"
      id={fieldsetId}
    >
      <legend className="sr-only">{t("legend")}</legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-sm text-default-600"
          id={`${fieldsetId}-description`}
        >
          {t("description")}
        </p>
        <div className="flex shrink-0 gap-2">
          <IBaseButton
            aria-label={t("selectAll")}
            color="primary"
            size="sm"
            variant="flat"
            onPress={selectAll}
          >
            {t("selectAll")}
          </IBaseButton>
          <IBaseButton
            aria-label={t("deselectAll")}
            size="sm"
            variant="light"
            onPress={deselectAll}
          >
            {t("deselectAll")}
          </IBaseButton>
        </div>
      </div>

      <IBaseAccordion
        className="divide-y divide-default-200"
        defaultExpandedKeys={Object.keys(grouped)}
        itemClasses={{
          base: "border-0",
          heading: "py-3",
          trigger: "px-0 py-3 min-h-0",
          content: "pb-4 pt-0",
        }}
        selectionMode="multiple"
      >
        {grouped.map((mdl: ModulePermissions) => {
          const { module: moduleKey, resources, actions } = mdl ?? {};
          const moduleActions = getOrderedActions(actions);

          const permissionsInModule: Permission[] =
            resources?.flatMap((r) => r.permissions) ?? [];

          const totalPermissionsInModule = permissionsInModule?.length ?? 0;
          const totalActions = moduleActions?.length ?? 0;
          const totalPermissionsInModuleSelected = permissionsInModule.filter(
            (p) => selectedIds.has(p.id),
          ).length;

          const templateColumns = `200px repeat(${totalActions}, 80px)`;

          const isAllPermissionsChecked =
            totalPermissionsInModuleSelected === totalPermissionsInModule;
          const isAdminModule = adminModules?.[moduleKey] === true;

          return (
            <IBaseAccordionItem
              key={moduleKey}
              aria-label={formatLabel(moduleKey)}
              classNames={{
                base: "rounded-lg px-3 py-1 my-2 first:mt-0 bg-default-100/60",
              }}
              title={
                <div className="flex w-full items-center justify-between gap-4 pr-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-semibold text-default-800">
                      {formatLabel(moduleKey)}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-default-500">
                      {totalPermissionsInModuleSelected}/
                      {totalPermissionsInModule}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Toggle: Admin module (full access, disable matrix) */}
                    <IBaseSwitch
                      aria-label={t("selectAllInModule")}
                      isSelected={isAdminModule}
                      size="sm"
                      onValueChange={(checked) => {
                        if (!onAdminModulesChange) return;
                        const next: Record<string, boolean> = {
                          ...(adminModules ?? {}),
                          [moduleKey]: checked,
                        };

                        onAdminModulesChange(next);
                        if (checked) {
                          toggleModule(moduleKey, true);
                        }
                      }}
                    />
                    <span className="text-xs font-medium text-default-700">
                      {t("adminModule")}
                    </span>
                    {/* Bulk select within module, disabled when adminModule is on */}
                    <IBaseSwitch
                      aria-label={t("selectAllInModule")}
                      isDisabled={isAdminModule}
                      isSelected={isAllPermissionsChecked}
                      size="sm"
                      onValueChange={(checked) =>
                        toggleModule(moduleKey, checked)
                      }
                    />
                    <span className="text-xs font-medium text-default-700">
                      {t("all")}
                    </span>
                  </div>
                </div>
              }
            >
              <div className="flex min-w-[420px] flex-col text-sm">
                {/* Header row */}
                <div
                  className="grid w-full border-b border-default-200 mb-2"
                  style={{
                    gridTemplateColumns: templateColumns,
                  }}
                >
                  <div className="px-3 py-3 text-left text-sm font-semibold text-default-700">
                    {t("resource")}
                  </div>
                  {moduleActions.map((action) => (
                    <div
                      key={action}
                      className="flex justify-center items-center text-left text-sm font-semibold text-default-600"
                    >
                      {getActionLabel(t, action)}
                    </div>
                  ))}
                </div>
                {/* Data rows */}
                {resources.map((resourceItem) => {
                  const { resource: resourceKey, permissions: resourcePerms } =
                    resourceItem;

                  const resourceLabel = formatLabel(resourceKey);
                  const resourceCheckboxId = `${fieldsetId}-${moduleKey}-${resourceKey}`;

                  const totalPermissionsInResource = resourcePerms?.length ?? 0;
                  const totalPermissionsInResourceSelected =
                    resourcePerms?.filter((p) => selectedIds.has(p.id))
                      .length ?? 0;
                  const isAllPermissionsChecked =
                    totalPermissionsInResourceSelected ===
                    totalPermissionsInResource;
                  const isIndeterminate =
                    !isAllPermissionsChecked &&
                    totalPermissionsInResourceSelected > 0;

                  return (
                    <div
                      key={resourceKey}
                      className="grid w-full border-b border-default-100 last:border-b-0 hover:bg-default-50/50"
                      style={{
                        gridTemplateColumns: templateColumns,
                      }}
                    >
                      <div className=" px-3 py-1">
                        <label
                          className="flex  cursor-pointer pr-1"
                          htmlFor={resourceCheckboxId}
                        >
                          <IBaseCheckbox
                            aria-label={`${t("resource")}: ${resourceLabel}`}
                            id={resourceCheckboxId}
                            isDisabled={isAdminModule}
                            isIndeterminate={isIndeterminate}
                            isSelected={isAllPermissionsChecked}
                            onValueChange={(checked) =>
                              toggleResource(moduleKey, resourceKey, !!checked)
                            }
                          />
                          <span className="font-medium text-default-800">
                            {resourceLabel}
                          </span>
                        </label>
                      </div>
                      {moduleActions.map((action) => {
                        const perm = resourcePerms?.find(
                          (p) => p.action === action,
                        );

                        if (!perm) {
                          return (
                            <div
                              key={action}
                              className="flex justify-center items-center"
                            >
                              —
                            </div>
                          );
                        }

                        const isChecked = selectedIds.has(perm.id);
                        const actionCheckboxId = `${fieldsetId}-${perm.id}`;

                        return (
                          <div key={action} className="flex justify-center">
                            <IBaseCheckbox
                              aria-label={`${resourceLabel} - ${getActionLabel(t, action)}`}
                              classNames={{
                                wrapper: "m-0 p-0",
                              }}
                              id={actionCheckboxId}
                              isDisabled={isAdminModule}
                              isSelected={isChecked}
                              onValueChange={(checked) =>
                                togglePermission(perm, !!checked)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </IBaseAccordionItem>
          );
        })}
      </IBaseAccordion>
    </fieldset>
  );
}
