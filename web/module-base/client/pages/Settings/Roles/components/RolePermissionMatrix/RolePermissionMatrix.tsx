"use client";

import type { Permission } from "@base/client/services/RoleService";

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
  resources: Record<string, ResourcePermissions>; // resource -> actions
  actions: string[]; // ordered union of actions in this module
};
type GroupedPermissions = Record<string, ModulePermissions>; // module -> permissions

/** Group permissions by module → resource → action (plain objects for simplicity) */
function groupPermissions(permissions: Permission[]): GroupedPermissions {
  const byModule: GroupedPermissions = {};

  for (const p of permissions) {
    const module = (byModule[p.module] ??= {
      resources: {},
      actions: [],
    });

    const resource = (module.resources[p.resource] ??= {});
    resource[p.action] = p;

    if (!module.actions.includes(p.action)) {
      module.actions.push(p.action);
    }
  }

  return byModule;
}

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
      const module = grouped[moduleKey];
      if (!module) return;
      const byAction = module.resources[resourceKey];
      if (!byAction) return;

      const next = new Set(selectedIds);
      const perms: Permission[] = Object.values(byAction);
      for (const perm of perms) {
        if (checked) {
          next.add(perm.id);
        } else {
          next.delete(perm.id);
        }
      }
      onSelectionChange(next);
    },
    [grouped, selectedIds, onSelectionChange],
  );

  const toggleModule = useCallback(
    (moduleKey: string, checked: boolean) => {
      const module = grouped[moduleKey];
      if (!module) return;
      const next = new Set(selectedIds);

      const resources = Object.values(module.resources);
      for (const byAction of resources) {
        const perms: Permission[] = Object.values(byAction);
        for (const perm of perms) {
          if (checked) {
            next.add(perm.id);
          } else {
            next.delete(perm.id);
          }
        }
      }
      onSelectionChange(next);
    },
    [grouped, selectedIds, onSelectionChange],
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
        {Object.entries(grouped).map(([moduleKey, module]) => {
          const modulePerms: Permission[] = Object.values(
            module.resources,
          ).flatMap((byAction) => Object.values(byAction));
          const moduleActions = getOrderedActions(module.actions);
          const moduleSelectedCount = modulePerms.filter((p) =>
            selectedIds.has(p.id),
          ).length;
          const moduleAllSelected = moduleSelectedCount === modulePerms.length;
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
                      {moduleSelectedCount}/{modulePerms.length}
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
                      isSelected={moduleAllSelected}
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
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b border-default-200">
                      <th
                        className="px-3 py-3 text-left text-sm font-semibold text-default-700"
                        scope="col"
                      >
                        {t("resource")}
                      </th>
                      {moduleActions.map((action) => (
                        <th
                          key={action}
                          className="px-2 py-3 text-center text-sm font-semibold text-default-600"
                          scope="col"
                        >
                          {getActionLabel(t, action)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(module.resources).map(
                      ([resourceKey, byAction]) => {
                        const resourcePerms: Permission[] =
                          Object.values(byAction);
                        const resourceSelectedCount = resourcePerms.filter(
                          (p) => selectedIds.has(p.id),
                        ).length;
                        const resourceAllSelected =
                          resourceSelectedCount === resourcePerms.length;
                        const resourceIndeterminate =
                          resourceSelectedCount > 0 && !resourceAllSelected;

                        const resourceLabel = formatLabel(resourceKey);
                        const resourceCheckboxId = `${fieldsetId}-${moduleKey}-${resourceKey}`;

                        return (
                          <tr
                            key={resourceKey}
                            className="min-h-[44px] border-b border-default-100 last:border-0 hover:bg-default-50/50"
                          >
                            <td className="px-3 py-3">
                              <label
                                className="flex min-h-[44px] cursor-pointer items-center gap-3 py-1"
                                htmlFor={resourceCheckboxId}
                              >
                                <IBaseCheckbox
                                  aria-label={`${t("resource")}: ${resourceLabel}`}
                                  id={resourceCheckboxId}
                                  isDisabled={isAdminModule}
                                  isIndeterminate={resourceIndeterminate}
                                  isSelected={resourceAllSelected}
                                  onValueChange={(checked) =>
                                    toggleResource(
                                      moduleKey,
                                      resourceKey,
                                      !!checked,
                                    )
                                  }
                                />
                                <span className="font-medium text-default-800">
                                  {resourceLabel}
                                </span>
                              </label>
                            </td>
                            {moduleActions.map((action) => {
                              const perm = byAction[action];

                              if (!perm) {
                                return (
                                  <td
                                    key={action}
                                    className="min-h-[44px] px-2 py-3 text-center"
                                  >
                                    —
                                  </td>
                                );
                              }

                              const isChecked = selectedIds.has(perm.id);
                              const actionCheckboxId = `${fieldsetId}-${perm.id}`;

                              return (
                                <td
                                  key={action}
                                  className="px-2 py-3 text-center align-middle"
                                >
                                  <div className="flex min-h-[44px] min-w-[44px] items-center justify-center">
                                    <IBaseCheckbox
                                      aria-label={`${resourceLabel} - ${getActionLabel(t, action)}`}
                                      id={actionCheckboxId}
                                      isDisabled={isAdminModule}
                                      isSelected={isChecked}
                                      onValueChange={(checked) =>
                                        togglePermission(perm, !!checked)
                                      }
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </IBaseAccordionItem>
          );
        })}
      </IBaseAccordion>
    </fieldset>
  );
}
