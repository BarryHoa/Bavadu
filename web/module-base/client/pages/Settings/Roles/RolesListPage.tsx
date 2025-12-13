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
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const ROLES_LIST_QUERY_KEY = ["settings", "roles", "list"] as const;

type RoleRow = Role & {
  createdAt?: number | string | null;
  updatedAt?: number | string | null;
};

export default function RolesListPage() {
  const tDataTable = useTranslations("dataTable");
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const queryClient = useQueryClient();
  const router = useRouter();
  const getText = useLocalizedText();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({ isOpen: false, role: null });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_LIST_QUERY_KEY });
      setDeleteConfirm({ isOpen: false, role: null });
    },
    onError: (error) => {
      console.error("Delete role error:", error);
    },
  });

  const handleDelete = useCallback((role: Role) => {
    setDeleteConfirm({ isOpen: true, role });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm.role) {
      deleteRoleMutation.mutate(deleteConfirm.role.id);
    }
  }, [deleteConfirm.role, deleteRoleMutation]);

  const columns = useMemo<DataTableColumn<RoleRow>[]>(
    () => [
      {
        key: "code",
        label: t("table.columns.code"),
        render: (value, row) => {
          if (!row?.id) return value;
          return (
            <LinkAs href={`/settings/roles/view/${row.id}`}>
              {value as string}
            </LinkAs>
          );
        },
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
        render: (_, row) => {
          if (!row?.id) return null;
          const viewLink = `/settings/roles/view/${row.id}`;
          const editLink = `/settings/roles/edit/${row.id}`;
          return (
            <ActionMenu
              actions={[
                {
                  key: "view",
                  label: actionsT("view"),
                  href: viewLink,
                },
                ...(!row.isSystem
                  ? [
                      {
                        key: "edit",
                        label: actionsT("edit"),
                        href: editLink,
                      },
                      {
                        key: "delete",
                        label: actionsT("delete"),
                        onPress: () => handleDelete(row),
                        disabled: deleteRoleMutation.isPending,
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ],
    [
      t,
      tDataTable,
      actionsT,
      getText,
      handleDelete,
      deleteRoleMutation.isPending,
    ]
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
            props: {
              href: "/settings/roles/create",
            },
          },
        ]}
      />
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, role: null })}
      >
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
                  onPress={confirmDelete}
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
