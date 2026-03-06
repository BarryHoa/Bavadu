"use client";

import type { HolidayDto } from "@mdl/hrm/client/interface/Holiday";

import { holidayService } from "@mdl/hrm/client/services/HolidayService";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Calendar, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCheckbox,
  IBaseChip,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  IBaseSpinner,
} from "@base/client";
import { useHasPermissions, useLocalizedText } from "@base/client/hooks";
import { LocaleDataType } from "@base/shared/interface/Locale";

import HolidayFormModal from "./components/HolidayFormModal";

type TranslateFunction = ReturnType<typeof useTranslations>;

interface HolidayItemProps {
  holiday: HolidayDto;
  isPast: boolean;
  daysRemaining: number | null;
  isSelected: boolean;
  canEdit: boolean;
  canDelete: boolean;
  showCheckbox: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (holiday: HolidayDto) => void;
  onDelete: (holiday: HolidayDto) => void;
  getLocalizedText: (value: LocaleDataType<string> | string | null | undefined) => string;
  t: TranslateFunction;
}

function HolidayItem({
  holiday,
  isPast,
  daysRemaining,
  isSelected,
  canEdit,
  canDelete,
  showCheckbox,
  onSelect,
  onEdit,
  onDelete,
  getLocalizedText,
  t,
}: HolidayItemProps) {
  const isUpcoming = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 30;

  return (
    <div
      className={`relative flex items-center gap-4 rounded-lg border p-4 transition-all ${
        isPast
          ? "border-default-200 bg-default-50 opacity-60"
          : isUpcoming
            ? "border-primary-300 bg-primary-50 shadow-sm"
            : "border-default-200 bg-content1"
      }`}
    >
      {showCheckbox && !isPast && (
        <IBaseCheckbox
          isSelected={isSelected}
          onValueChange={(checked) => onSelect(holiday.id, checked)}
        />
      )}

      <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary-100 text-primary-600">
        <span className="text-lg font-bold">{dayjs(holiday.date).format("DD")}</span>
        <span className="text-xs uppercase">{dayjs(holiday.date).format("MMM")}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium truncate ${isPast ? "text-default-500" : "text-foreground"}`}>
            {getLocalizedText(holiday.name as LocaleDataType<string>)}
          </h3>
          {holiday.isRecurring && (
            <IBaseChip color="secondary" size="sm" variant="flat">
              {t("recurring")}
            </IBaseChip>
          )}
          {holiday.holidayType === "company" && (
            <IBaseChip color="warning" size="sm" variant="flat">
              {t("companyHoliday")}
            </IBaseChip>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-sm text-default-500">
          <span>{dayjs(holiday.date).format("dddd, DD/MM/YYYY")}</span>
          {!holiday.isPaid && (
            <IBaseChip color="danger" size="sm" variant="flat">
              {t("unpaid")}
            </IBaseChip>
          )}
        </div>

        {holiday.description && (
          <p className="mt-1 text-sm text-default-400 truncate">{holiday.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {daysRemaining !== null && !isPast && (
          <div
            className={`text-sm font-medium ${
              isUpcoming ? "text-primary-600" : "text-default-500"
            }`}
          >
            {daysRemaining === 0
              ? t("today")
              : daysRemaining === 1
                ? t("tomorrow")
                : t("daysRemaining", { days: daysRemaining })}
          </div>
        )}

        {canEdit && !isPast && (
          <IBaseButton
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => onEdit(holiday)}
          >
            <Pencil className="h-4 w-4" />
          </IBaseButton>
        )}

        {canDelete && !isPast && (
          <IBaseButton
            isIconOnly
            color="danger"
            size="sm"
            variant="light"
            onPress={() => onDelete(holiday)}
          >
            <Trash2 className="h-4 w-4" />
          </IBaseButton>
        )}
      </div>
    </div>
  );
}

export default function HolidaysListPage(): React.ReactNode {
  const t = useTranslations("hrm.holidays");
  const tActions = useTranslations("base.general.actions");
  const tGeneral = useTranslations("base.general");
  const getLocalizedText = useLocalizedText();

  const currentYear = useMemo(() => dayjs().year(), []);
  const minYear = currentYear - 3;
  const maxYear = currentYear + 1;

  const [year, setYear] = useState(() => currentYear);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayDto | null>(null);
  const [deletingHoliday, setDeletingHoliday] = useState<HolidayDto | null>(null);
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canGoPrev = year > minYear;
  const canGoNext = year < maxYear;

  const { hasPermission: canView } = useHasPermissions(["hrm.holiday.view"]);
  const { hasPermission: canCreate } = useHasPermissions(["hrm.holiday.create"]);
  const { hasPermission: canEdit } = useHasPermissions(["hrm.holiday.edit"]);
  const { hasPermission: canDelete } = useHasPermissions(["hrm.holiday.delete"]);

  const showCheckbox = canEdit || canDelete;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["hrm.holidays", year],
    queryFn: () => holidayService.getByYear(year),
    enabled: canView,
  });

  const holidays = useMemo(() => data?.data ?? [], [data]);
  const today = useMemo(() => dayjs().startOf("day"), []);

  const sortedHolidays = useMemo(() => {
    return [...holidays].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }, [holidays]);

  const isPastHoliday = useCallback(
    (dateStr: string): boolean => {
      return dayjs(dateStr).startOf("day").isBefore(today);
    },
    [today],
  );

  const futureHolidays = useMemo(() => {
    return sortedHolidays.filter((h) => !isPastHoliday(h.date));
  }, [sortedHolidays, isPastHoliday]);

  const handleYearChange = useCallback(
    (delta: number) => {
      setYear((prev) => {
        const newYear = prev + delta;
        if (newYear < minYear || newYear > maxYear) return prev;
        return newYear;
      });
      setSelectedIds(new Set());
    },
    [minYear, maxYear],
  );

  const handleGoToCurrentYear = useCallback(() => {
    setYear(currentYear);
    setSelectedIds(new Set());
  }, [currentYear]);

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(futureHolidays.map((h) => h.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [futureHolidays],
  );

  const handleOpenCreate = useCallback(() => {
    setEditingHoliday(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((holiday: HolidayDto) => {
    setEditingHoliday(holiday);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingHoliday(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    refetch();
    handleCloseForm();
  }, [refetch, handleCloseForm]);

  const handleOpenDelete = useCallback((holiday: HolidayDto) => {
    setDeletingHoliday(holiday);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeletingHoliday(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingHoliday) return;
    setIsDeleting(true);
    try {
      await holidayService.deleteHoliday(deletingHoliday.id);
      await refetch();
      handleCloseDelete();
    } catch (error) {
      console.error("Failed to delete holiday:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingHoliday, refetch, handleCloseDelete]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      await holidayService.bulkDelete(Array.from(selectedIds));
      await refetch();
      setSelectedIds(new Set());
      setIsConfirmBulkDeleteOpen(false);
    } catch (error) {
      console.error("Failed to bulk delete holidays:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, refetch]);

  const getDaysRemaining = useCallback(
    (dateStr: string): number | null => {
      const holidayDate = dayjs(dateStr).startOf("day");
      if (holidayDate.year() !== year) return null;
      return holidayDate.diff(today, "day");
    },
    [today, year],
  );

  if (!canView) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-default-500">{tGeneral("errors.dataNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IBaseButton
            isDisabled={!canGoPrev}
            isIconOnly
            size="sm"
            variant="flat"
            onPress={() => handleYearChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </IBaseButton>

          <IBaseButton
            isDisabled={year === currentYear}
            size="sm"
            variant="flat"
            onPress={handleGoToCurrentYear}
          >
            <Calendar className="h-4 w-4 mr-1" />
            {t("currentYear")}
          </IBaseButton>

          <span className="text-lg font-semibold px-4">{year}</span>

          <IBaseButton
            isDisabled={!canGoNext}
            isIconOnly
            size="sm"
            variant="flat"
            onPress={() => handleYearChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </IBaseButton>
        </div>

        <div className="flex items-center gap-2">
          {showCheckbox && selectedIds.size > 0 && (
            <>
              <span className="text-sm text-default-500">
                {t("selectedCount", { count: selectedIds.size })}
              </span>
              {canDelete && (
                <IBaseButton
                  color="danger"
                  size="sm"
                  variant="flat"
                  onPress={() => setIsConfirmBulkDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("deleteSelected")}
                </IBaseButton>
              )}
            </>
          )}

          {canCreate && (
            <IBaseButton color="primary" size="sm" onPress={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-1" />
              {t("create")}
            </IBaseButton>
          )}
        </div>
      </div>

      {showCheckbox && futureHolidays.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <IBaseCheckbox
            isSelected={selectedIds.size === futureHolidays.length && futureHolidays.length > 0}
            isIndeterminate={selectedIds.size > 0 && selectedIds.size < futureHolidays.length}
            onValueChange={handleSelectAll}
          >
            {t("selectAll")}
          </IBaseCheckbox>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <IBaseSpinner size="lg" />
        </div>
      ) : sortedHolidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Calendar className="h-12 w-12 text-default-300 mb-4" />
          <p className="text-default-500">{t("noHolidays")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHolidays.map((holiday) => {
            const daysRemaining = getDaysRemaining(holiday.date);
            const isPast = isPastHoliday(holiday.date);

            return (
              <HolidayItem
                key={holiday.id}
                canDelete={canDelete}
                canEdit={canEdit}
                daysRemaining={daysRemaining}
                getLocalizedText={getLocalizedText}
                holiday={holiday}
                isPast={isPast}
                isSelected={selectedIds.has(holiday.id)}
                showCheckbox={showCheckbox}
                t={t}
                onDelete={handleOpenDelete}
                onEdit={handleOpenEdit}
                onSelect={handleSelectItem}
              />
            );
          })}
        </div>
      )}

      <HolidayFormModal
        holiday={editingHoliday}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />

      <IBaseModal isOpen={!!deletingHoliday} onClose={handleCloseDelete}>
        <IBaseModalContent>
          <IBaseModalHeader>
            <h3 className="text-lg font-semibold">{t("confirmDeleteTitle")}</h3>
          </IBaseModalHeader>
          <IBaseModalBody>
            <p>
              {t("confirmDeleteMessage", {
                name: deletingHoliday
                  ? getLocalizedText(deletingHoliday.name as LocaleDataType<string>)
                  : "",
              })}
            </p>
          </IBaseModalBody>
          <IBaseModalFooter>
            <IBaseButton variant="light" onPress={handleCloseDelete}>
              {tActions("cancel")}
            </IBaseButton>
            <IBaseButton
              color="danger"
              isLoading={isDeleting}
              onPress={handleConfirmDelete}
            >
              {tActions("delete")}
            </IBaseButton>
          </IBaseModalFooter>
        </IBaseModalContent>
      </IBaseModal>

      <IBaseModal
        isOpen={isConfirmBulkDeleteOpen}
        onClose={() => setIsConfirmBulkDeleteOpen(false)}
      >
        <IBaseModalContent>
          <IBaseModalHeader>
            <h3 className="text-lg font-semibold">{t("confirmBulkDeleteTitle")}</h3>
          </IBaseModalHeader>
          <IBaseModalBody>
            <p>{t("confirmBulkDeleteMessage", { count: selectedIds.size })}</p>
          </IBaseModalBody>
          <IBaseModalFooter>
            <IBaseButton variant="light" onPress={() => setIsConfirmBulkDeleteOpen(false)}>
              {tActions("cancel")}
            </IBaseButton>
            <IBaseButton color="danger" isLoading={isDeleting} onPress={handleBulkDelete}>
              {tActions("delete")}
            </IBaseButton>
          </IBaseModalFooter>
        </IBaseModalContent>
      </IBaseModal>
    </div>
  );
}
