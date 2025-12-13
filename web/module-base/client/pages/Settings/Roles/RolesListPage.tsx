"use client";

import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  DataTableColumn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@base/client/components";
import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import LinkAs from "@base/client/components/LinkAs";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import roleService, { type Role } from "@base/client/services/RoleService";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

const ROLES_LIST_QUERY_KEY = ["settings", "roles", "list"] as const;
const BASE_PATH = "/settings/roles";

type RoleRow = Role & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function RolesListPage() {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const queryClient = useQueryClient();
  const getText = useLocalizedText();
  const [deleteConfirm, setDeleteConfirm] = useState<Role | null>(null);

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_LIST_QUERY_KEY });
      setDeleteConfirm(null);
    },
  });

  const handleDelete = useCallback((role: Role) => {
    setDeleteConfirm(role);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirm) {
      deleteRoleMutation.mutate(deleteConfirm.id);
    }
  }, [deleteConfirm, deleteRoleMutation]);

  const getActionMenuItems = useCallback(
    (row: RoleRow) => {
      const baseActions: Array<
        | { key: string; label: string; href: string }
        | {
            key: string;
            label: string;
            onPress: () => void;
            disabled?: boolean;
          }
      > = [
        {
          key: "view",
          label: actionsT("view"),
          href: `${BASE_PATH}/view/${row.id}`,
        },
      ];

      if (!row.isSystem) {
        baseActions.push(
          {
            key: "edit",
            label: actionsT("edit"),
            href: `${BASE_PATH}/edit/${row.id}`,
          },
          {
            key: "delete",
            label: actionsT("delete"),
            onPress: () => handleDelete(row),
            disabled: deleteRoleMutation.isPending,
          }
        );
      }

      return baseActions;
    },
    [actionsT, handleDelete, deleteRoleMutation.isPending]
  );

  const columns = useMemo<DataTableColumn<RoleRow>[]>(
    () => [
      {
        key: "code",
        label: t("table.columns.code"),
        render: (value, row) =>
          row?.id ? (
            <LinkAs href={`${BASE_PATH}/view/${row.id}`}>
              {value as string}
            </LinkAs>
          ) : (
            value
          ),
      },
      {
        key: "name",
        label: t("table.columns.name"),
        render: (value) => getText(value as any),
      },
      {
        key: "description",
        label: t("table.columns.description"),
        render: (value) => (value ? String(value) : "-"),
      },
      {
        key: "isSystem",
        label: t("table.columns.type"),
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
            {value
              ? t("table.columns.systemRole")
              : t("table.columns.customRole")}
          </Chip>
        ),
      },
      {
        key: "isActive",
        label: t("table.columns.status"),
        render: (value) => (
          <Chip size="sm" variant="flat" className="capitalize">
            {value ? t("table.columns.active") : t("table.columns.inactive")}
          </Chip>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: tDataTable("columns.action"),
        align: "end",
        render: (_, row) =>
          row?.id ? <ActionMenu actions={getActionMenuItems(row)} /> : null,
      },
    ],
    [t, tDataTable, getText, getActionMenuItems]
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<RoleRow>
        model="role.list"
        columns={columns}
        isDummyData={false}
        actionsRight={[
          {
            key: "new",
            title: t("actions.addRole"),
            type: "link",
            color: "primary",
            props: { href: `${BASE_PATH}/create` },
          },
        ]}
      />
      <Modal isOpen={!!deleteConfirm} onClose={handleCloseModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{t("deleteConfirm.title")}</ModalHeader>
              <ModalBody>
                <p>{t("deleteConfirm.message")}</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={deleteRoleMutation.isPending}
                >
                  {actionsT("cancel")}
                </Button>
                <Button
                  color="danger"
                  onPress={handleConfirmDelete}
                  isLoading={deleteRoleMutation.isPending}
                >
                  {actionsT("delete")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
