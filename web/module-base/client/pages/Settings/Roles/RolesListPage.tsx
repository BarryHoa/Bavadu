"use client";

import { IBaseInput } from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IBaseTable,
  IBaseTableColumnDefinition,
} from "@base/client/components/IBaseTable";
import { useTranslations } from "next-intl";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@base/client/components";
import roleService, { type Role } from "@base/client/services/RoleService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

const ROLES_LIST_QUERY_KEY = ["settings", "roles", "list"] as const;

export default function RolesListPage() {
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const queryClient = useQueryClient();
  const router = useRouter();
  const getText = useLocalizedText();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({ isOpen: false, role: null });

  const showToast = useCallback(
    (message: string, type: "error" | "success" = "error") => {
      setToast({ message, type });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const rolesListQuery = useQuery({
    queryKey: ROLES_LIST_QUERY_KEY,
    queryFn: async () => {
      const response = await roleService.getRoleList();
      return response.data;
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      showToast(t("toast.deleteSuccess"), "success");
      queryClient.invalidateQueries({ queryKey: ROLES_LIST_QUERY_KEY });
      setDeleteConfirm({ isOpen: false, role: null });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t("toast.deleteError");
      showToast(errorMessage, "error");
    },
  });

  const handleDelete = useCallback(
    (role: Role) => {
      setDeleteConfirm({ isOpen: true, role });
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (deleteConfirm.role) {
      deleteRoleMutation.mutate(deleteConfirm.role.id);
    }
  }, [deleteConfirm.role, deleteRoleMutation]);

  const handleRefresh = useCallback(() => {
    rolesListQuery.refetch();
  }, [rolesListQuery]);

  const roles = rolesListQuery.data ?? [];
  const loading = rolesListQuery.isLoading || rolesListQuery.isFetching;
  const queryErrorMessage =
    rolesListQuery.error instanceof Error ? t("toast.loadError") : null;

  useEffect(() => {
    if (queryErrorMessage) {
      showToast(queryErrorMessage, "error");
    }
  }, [queryErrorMessage, showToast]);

  const miniSearch = useMemo(() => {
    const search = new MiniSearch<Role>({
      fields: ["code"],
      storeFields: ["code", "name", "description"],
      idField: "id",
    });

    if (roles.length) {
      search.addAll(roles);
    }

    return search;
  }, [roles]);

  const filteredRoles = useMemo<Role[]>(() => {
    if (!searchTerm.trim()) {
      return roles;
    }

    const results = miniSearch.search(searchTerm, {
      prefix: true,
      fuzzy: 0.2,
    });

    if (!results.length) {
      return [];
    }

    return results.map((r) => roles.find((role) => role.id === r.id)!).filter(Boolean);
  }, [miniSearch, roles, searchTerm]);

  const columns = useMemo<IBaseTableColumnDefinition<Role>[]>(
    () => [
      {
        key: "code",
        label: t("table.columns.code"),
      },
      {
        key: "name",
        label: t("table.columns.name"),
        render: (_, record) => getText(record.name),
      },
      {
        key: "description",
        label: t("table.columns.description"),
        render: (_, record) => record.description || "-",
      },
      {
        key: "isSystem",
        label: t("table.columns.type"),
        render: (_, record) =>
          record.isSystem ? t("table.columns.systemRole") : t("table.columns.customRole"),
      },
      {
        key: "isActive",
        label: t("table.columns.status"),
        render: (_, record) =>
          record.isActive ? t("table.columns.active") : t("table.columns.inactive"),
      },
      {
        key: "action",
        label: actionsT("action"),
        align: "end",
        render: (_, record) => (
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={() => router.push(`/settings/roles/view/${record.id}`)}
            >
              {actionsT("view")}
            </Button>
            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={() => router.push(`/settings/roles/edit/${record.id}`)}
            >
              {actionsT("edit")}
            </Button>
            {!record.isSystem && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                onPress={() => handleDelete(record)}
                isDisabled={deleteRoleMutation.isPending}
              >
                {actionsT("delete")}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [t, actionsT, getText, router, handleDelete, deleteRoleMutation.isPending]
  );

  const emptyStateMessage =
    queryErrorMessage ||
    (searchTerm.trim() && filteredRoles.length === 0
      ? t("table.empty.search")
      : t("table.empty.default"));

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <IBaseInput
              classNames={{
                input: "text-sm",
              }}
              isClearable
              labelPlacement="outside"
              placeholder={t("filters.searchPlaceholder")}
              size="sm"
              value={searchTerm}
              onClear={() => setSearchTerm("")}
              onValueChange={setSearchTerm}
            />
            <Button
              color="primary"
              onPress={() => router.push("/settings/roles/create")}
            >
              {t("actions.addRole")}
            </Button>
          </div>
          <IBaseTable
            rowKey="id"
            columns={columns}
            dataSource={filteredRoles}
            pagination={false}
            loading={loading}
            emptyContent={emptyStateMessage}
            onRefresh={handleRefresh}
            total={filteredRoles.length}
          />
        </div>
        {toast && (
          <div className="fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2">
            <div
              className={`rounded-medium px-4 py-3 text-sm shadow-large ${
                toast.type === "error"
                  ? "bg-danger-100 text-danger"
                  : "bg-success-100 text-success"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
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
      </CardBody>
    </Card>
  );
}

