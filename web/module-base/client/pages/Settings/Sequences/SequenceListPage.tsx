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
  IBaseTooltip,
} from "@base/client/components";
import { Copy } from "lucide-react";
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
  const [toggleConfirmRow, setToggleConfirmRow] = useState<SequenceRule | null>(null);

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

  const handleCloseToggleModal = useCallback(() => {
    setToggleConfirmRow(null);
  }, []);

  const toggleMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) =>
      sequenceService.updateRule(payload),
    onSuccess: () => {
      addToast({ title: t("toast.updateSuccess"), color: "success", variant: "solid" });
      queryClient.invalidateQueries({ queryKey: SEQUENCES_LIST_QUERY_KEY });
      setToggleConfirmRow(null);
    },
    onError: (error) => {
      addToast({
        title: error instanceof Error ? error.message : t("toast.updateError"),
        color: "danger",
        variant: "solid",
      });
    },
  });

  const handleConfirmToggle = useCallback(() => {
    if (toggleConfirmRow) {
      toggleMutation.mutate({
        id: toggleConfirmRow.id,
        isActive: !(toggleConfirmRow.isActive ?? false),
      });
    }
  }, [toggleConfirmRow, toggleMutation]);

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
        onPress: () => setToggleConfirmRow(row),
      });

      return baseActions;
    },
    [actionsT, handleDelete, deleteMutation.isPending],
  );

  const columns = useMemo<IBaseTableColumnDefinition<SequenceRow>[]>(
    () => [
      {
        key: "code",
        label: t("table.columns.code"),
        width: 130,
        render: (value, row) => {
          const codeStr = (value as string) ?? "";
          const handleCopy = () => {
            navigator.clipboard.writeText(codeStr).then(
              () => addToast({ title: t("toast.copied"), color: "success", variant: "solid" }),
              () => addToast({ title: t("toast.copyFailed"), color: "danger", variant: "solid" }),
            );
          };
          const codeContent =
            (row.countCount ?? 0) === 0 ? (
              <IBaseLink href={`${BASE_PATH}/edit/${row.id}`}>{codeStr}</IBaseLink>
            ) : (
              codeStr
            );
          return (
            <span className="inline-flex items-center gap-1.5">
              <IBaseTooltip content={t("table.copyCode")}>
                <IBaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="min-w-6 w-6 h-6 shrink-0"
                  onPress={handleCopy}
                  aria-label={t("table.copyCode")}
                >
                  <Copy className="size-3.5" />
                </IBaseButton>
              </IBaseTooltip>
              {codeContent}
            </span>
          );
        },
      },
      {
        key: "name",
        label: t("table.columns.name"),
        width: 180,
      },
      {
        key: "prefix",
        label: t("table.columns.prefix"),
        width: 90,
      },
      {
        key: "suffix",
        label: t("table.columns.suffix"),
        width: 90,
      },
      {
        key: "format",
        label: t("table.columns.format"),
        width: 100,
      },
      {
        key: "start",
        label: t("table.columns.start"),
        width: 85,
        align: "end",
      },
      {
        key: "step",
        label: t("table.columns.step"),
        width: 85,
        align: "end",
      },
      {
        key: "currentValue",
        label: t("table.columns.currentValue"),
        width: 115,
        align: "end",
      },
      {
        key: "countCount",
        label: t("table.columns.countCount"),
        width: 100,
        align: "end",
        render: (v) => v ?? 0,
      },
      {
        key: "isActive",
        label: t("table.columns.status"),
        width: 100,
        render: (value) => (
          <IBaseChip className="capitalize" size="sm" variant="flat">
            {value ? t("form.active") : t("form.inactive")}
          </IBaseChip>
        ),
      },
      {
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        label: tIBaseTable("columns.action"),
        width: 80,
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

      <IBaseModal isOpen={!!toggleConfirmRow} onClose={handleCloseToggleModal}>
        <IBaseModalContent>
          {(onClose) => (
            <>
              <IBaseModalHeader>{t("toggleStatusConfirm.title")}</IBaseModalHeader>
              <IBaseModalBody>
                <p>{t("toggleStatusConfirm.message")}</p>
              </IBaseModalBody>
              <IBaseModalFooter>
                <IBaseButton
                  variant="light"
                  onPress={onClose}
                  isDisabled={toggleMutation.isPending}
                >
                  {actionsT("cancel")}
                </IBaseButton>
                <IBaseButton
                  color={toggleConfirmRow?.isActive ? "danger" : "success"}
                  isLoading={toggleMutation.isPending}
                  onPress={handleConfirmToggle}
                >
                  {actionsT("confirm")}
                </IBaseButton>
              </IBaseModalFooter>
            </>
          )}
        </IBaseModalContent>
      </IBaseModal>
    </div>
  );
}
