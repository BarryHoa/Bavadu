"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { addToast } from "@heroui/toast";

import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  IBaseButton,
  IBaseChip,
  IBaseLink,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  IBaseTableColumnDefinition,
} from "@base/client/components";
import ActionMenu, {
  ActionItem,
} from "@base/client/components/ActionMenu/ActionMenu";
import ViewListDataTable from "@base/client/components/ViewListDataTable";
import sequenceService, {
  type SequenceRule,
} from "@base/client/services/SequenceService";


const SEQUENCES_LIST_QUERY_KEY = ["settings", "sequences", "list"] as const;
const BASE_PATH = "/workspace/settings/sequences";

type SequenceRow = SequenceRule & {
  countCount?: number;
};

export default function SequenceListPage() {
  const tIBaseTable = useTranslations("dataTable");
  const t = useTranslations("settings.sequences");
  const actionsT = useTranslations("common.actions");
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<SequenceRule | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sequenceService.deleteRule(id),
    onSuccess: (result) => {
      if (result.success) {
        addToast({ title: t("toast.deleteSuccess"), color: "success", variant: "solid" });
        queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
        setDeleteConfirm(null);
      } else {
        addToast({ title: result.message, color: "danger", variant: "solid" });
      }
    },
    onError: (error) => {
      addToast({
        title: error instanceof Error ? error.message : t("toast.deleteError"),
        color: "danger",
        variant: "solid",
      });
    },
  });

  const handleDelete = useCallback((row: SequenceRule) => {
    setDeleteConfirm(row);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  }, [deleteConfirm, deleteMutation]);

  const getActionMenuItems = useCallback(
    (row: SequenceRow) => {
      const hasCount = (row.countCount ?? 0) > 0;
      const baseActions: ActionItem[] = [];

      if (!hasCount) {
        baseActions.push(
          {
            placement: "menu",
            key: "edit",
            label: actionsT("edit"),
            href: `${BASE_PATH}/edit/${row.id}`,
          },
          {
            placement: "menu",
            key: "delete",
            label: actionsT("delete"),
            onPress: () => handleDelete(row),
            disabled: deleteMutation.isPending,
          },
        );
      }

      baseActions.push({
        placement: "menu",
        key: "toggleActive",
        label: row.isActive ? t("table.columns.setInactive") : t("table.columns.setActive"),
        onPress: async () => {
          try {
            await sequenceService.updateRule({
              id: row.id,
              isActive: !row.isActive,
            });
            addToast({ title: t("toast.updateSuccess"), color: "success", variant: "solid" });
            queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
          } catch (err) {
            addToast({
              title: err instanceof Error ? err.message : t("toast.updateError"),
              color: "danger",
              variant: "solid",
            });
          }
        },
      });

      return baseActions;
    },
    [actionsT, handleDelete, deleteMutation.isPending, queryClient],
  );

  const columns = useMemo<IBaseTableColumnDefinition<SequenceRow>[]>(
    () => [
      {
        key: "name",
        label: t("table.columns.name"),
        render: (value, row) =>
          (row.countCount ?? 0) === 0 ? (
            <IBaseLink href={`${BASE_PATH}/edit/${row.id}`}>
              {value as string}
            </IBaseLink>
          ) : (
            value
          ),
      },
      {
        key: "prefix",
        label: t("table.columns.prefix"),
      },
      {
        key: "format",
        label: t("table.columns.format"),
      },
      {
        key: "start",
        label: t("table.columns.start"),
      },
      {
        key: "step",
        label: t("table.columns.step"),
      },
      {
        key: "currentValue",
        label: t("table.columns.currentValue"),
      },
      {
        key: "countCount",
        label: t("table.columns.countCount"),
        render: (v) => v ?? 0,
      },
      {
        key: "isActive",
        label: t("table.columns.status"),
        render: (value) => (
          <IBaseChip className="capitalize" size="sm" variant="flat">
            {value ? t("form.active") : t("form.inactive")}
          </IBaseChip>
        ),
      },
      {
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        label: tIBaseTable("columns.action"),
        align: "end",
        render: (_, row) =>
          row?.id ? <ActionMenu actions={getActionMenuItems(row)} /> : null,
      },
    ],
    [t, tIBaseTable, getActionMenuItems],
  );

  return (
    <div className="space-y-4">
      <ViewListDataTable<SequenceRow>
        actionsRight={[
          {
            key: "new",
            title: t("actions.addSequence"),
            type: "link",
            color: "primary",
            props: { href: `${BASE_PATH}/create` },
          },
        ]}
        columns={columns}
        isDummyData={false}
        model="base-sequence.list"
      />
      <IBaseModal isOpen={!!deleteConfirm} onClose={handleCloseModal}>
        <IBaseModalContent>
          {(onClose) => (
            <>
              <IBaseModalHeader>{t("deleteConfirm.title")}</IBaseModalHeader>
              <IBaseModalBody>
                <p>{t("deleteConfirm.message")}</p>
              </IBaseModalBody>
              <IBaseModalFooter>
                <IBaseButton
                  isDisabled={deleteMutation.isPending}
                  variant="light"
                  onPress={onClose}
                >
                  {actionsT("cancel")}
                </IBaseButton>
                <IBaseButton
                  color="danger"
                  isLoading={deleteMutation.isPending}
                  onPress={handleConfirmDelete}
                >
                  {actionsT("delete")}
                </IBaseButton>
              </IBaseModalFooter>
            </>
          )}
        </IBaseModalContent>
      </IBaseModal>
    </div>
  );
}
