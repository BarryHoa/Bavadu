"use client";

import type {
  HolidayDto,
  CreateHolidayPayload,
  UpdateHolidayPayload,
} from "@mdl/hrm/client/interface/Holiday";

import { holidayService } from "@mdl/hrm/client/services/HolidayService";

import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCheckbox,
  IBaseInputMultipleLang,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  IBaseSelect,
  IBaseTextarea,
} from "@base/client";
import {
  IBaseDatePicker,
  IBaseDateRangePicker,
  type IBaseDateRangePickerValue,
} from "@base/client/components/IBasePicker";
import IBaseSelectItem from "@base/client/components/IBaseSelect/IBaseSelectItem";
import { LocalizeText } from "@base/client/interface/LocalizeText";

interface HolidayFormModalProps {
  isOpen: boolean;
  holiday: HolidayDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: LocalizeText;
  startDate: string;
  endDate: string;
  holidayType: string;
  isPaid: boolean;
  isActive: boolean;
  description: string;
}

const HOLIDAY_TYPES = [
  { key: "national", label: "National" },
  { key: "company", label: "Company" },
  { key: "regional", label: "Regional" },
];

export default function HolidayFormModal({
  isOpen,
  holiday,
  onClose,
  onSuccess,
}: HolidayFormModalProps) {
  const t = useTranslations("hrm.holidays");
  const tActions = useTranslations("base.general.actions");

  const isEdit = !!holiday;

  const [formData, setFormData] = useState<FormData>({
    name: { vi: "", en: "" },
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
    holidayType: "national",
    isPaid: true,
    isActive: true,
    description: "",
  });

  const [dateError, setDateError] = useState<string | null>(null);

  const minDate = useMemo(() => {
    return dayjs().format("YYYY-MM-DD");
  }, []);

  const maxDate = useMemo(() => {
    const nextYear = dayjs().year() + 1;
    return `${nextYear}-12-31`;
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (holiday) {
        const name = holiday.name as LocalizeText | undefined;
        setFormData({
          name: name ?? { vi: "", en: "" },
          startDate: holiday.date,
          endDate: holiday.date,
          holidayType: holiday.holidayType,
          isPaid: holiday.isPaid,
          isActive: holiday.isActive,
          description: holiday.description ?? "",
        });
      } else {
        const today = dayjs().format("YYYY-MM-DD");
        setFormData({
          name: { vi: "", en: "" },
          startDate: today,
          endDate: today,
          holidayType: "national",
          isPaid: true,
          isActive: true,
          description: "",
        });
      }
      setDateError(null);
    }
  }, [isOpen, holiday]);

  const createMutation = useMutation({
    mutationFn: (payloads: CreateHolidayPayload[]) =>
      Promise.all(payloads.map((p) => holidayService.create(p))),
    onSuccess: () => {
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHolidayPayload }) =>
      holidayService.update(id, payload),
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleFieldChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === "startDate" || field === "endDate") {
        setDateError(null);
      }
    },
    [],
  );

  const handleDateRangeChange = useCallback(
    (value: { start: string | null; end: string | null } | null) => {
      if (value) {
        setFormData((prev) => ({
          ...prev,
          startDate: value.start || prev.startDate,
          endDate: value.end || value.start || prev.endDate,
        }));
        setDateError(null);
      }
    },
    [],
  );

  const handleSingleDateChange = useCallback((value: string | null) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        startDate: value,
        endDate: value,
      }));
      setDateError(null);
    }
  }, []);

  const validateDates = useCallback(async (): Promise<boolean> => {
    if (!formData.startDate) {
      setDateError(t("errors.dateRequired"));
      return false;
    }

    const startDate = dayjs(formData.startDate);
    const endDate = dayjs(formData.endDate || formData.startDate);

    if (endDate.isBefore(startDate)) {
      setDateError(t("errors.endDateBeforeStart"));
      return false;
    }

    if (!isEdit && startDate.year() !== endDate.year()) {
      setDateError(t("errors.differentYear"));
      return false;
    }

    if (!isEdit) {
      const result = await holidayService.checkDateExists(formData.startDate);
      if (result.exists) {
        setDateError(t("errors.dateExists"));
        return false;
      }
    }

    return true;
  }, [formData.startDate, formData.endDate, isEdit, t]);

  const handleSubmit = useCallback(async () => {
    const nameVi = formData.name.vi?.trim();
    if (!nameVi) {
      return;
    }

    const isValid = await validateDates();
    if (!isValid) return;

    if (isEdit && holiday) {
      const payload: UpdateHolidayPayload = {
        name: { vi: nameVi, en: formData.name.en?.trim() || undefined },
        holidayType: formData.holidayType,
        isPaid: formData.isPaid,
        isActive: formData.isActive,
        description: formData.description.trim() || null,
      };
      updateMutation.mutate({ id: holiday.id, payload });
    } else {
      const startDate = dayjs(formData.startDate);
      const endDate = dayjs(formData.endDate || formData.startDate);
      const year = startDate.year();
      const payloads: CreateHolidayPayload[] = [];

      let currentDate = startDate;
      while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
        payloads.push({
          name: { vi: nameVi, en: formData.name.en?.trim() || undefined },
          date: currentDate.format("YYYY-MM-DD"),
          year,
          isRecurring: false,
          holidayType: formData.holidayType,
          countryCode: "VN",
          isPaid: formData.isPaid,
          isActive: formData.isActive,
          description: formData.description.trim() || null,
        });
        currentDate = currentDate.add(1, "day");
      }

      createMutation.mutate(payloads);
    }
  }, [formData, isEdit, holiday, validateDates, createMutation, updateMutation]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const canSubmit = formData.name.vi?.trim() && formData.startDate && !isSubmitting;

  const dateRangeValue: IBaseDateRangePickerValue = useMemo(
    () => ({
      start: formData.startDate || null,
      end: formData.endDate || null,
    }),
    [formData.startDate, formData.endDate],
  );

  const dateRangeInfo = useMemo(() => {
    if (isEdit) return null;
    const startDate = dayjs(formData.startDate);
    const endDate = dayjs(formData.endDate || formData.startDate);
    if (!startDate.isValid() || !endDate.isValid()) return null;

    const days = endDate.diff(startDate, "day") + 1;
    if (days > 1) {
      return t("dateRangeInfo", { days });
    }
    return null;
  }, [formData.startDate, formData.endDate, isEdit, t]);

  return (
    <IBaseModal isOpen={isOpen} size="lg" onClose={onClose}>
      <IBaseModalContent>
        <IBaseModalHeader>
          <h3 className="text-lg font-semibold">
            {isEdit ? t("editTitle") : t("createTitle")}
          </h3>
        </IBaseModalHeader>

        <IBaseModalBody className="space-y-4">
          <IBaseInputMultipleLang
            isRequired
            label={t("labels.name")}
            placeholder={t("placeholders.name")}
            value={formData.name}
            onValueChange={(v) => handleFieldChange("name", v)}
          />

          {isEdit ? (
            <IBaseDatePicker
              isDisabled
              label={t("labels.date")}
              value={formData.startDate}
              onChange={handleSingleDateChange}
            />
          ) : (
            <IBaseDateRangePicker
              isInvalid={!!dateError}
              label={t("labels.dateRange")}
              maxDate={maxDate}
              minDate={minDate}
              value={dateRangeValue}
              onChange={handleDateRangeChange}
            />
          )}

          {dateError && <p className="text-sm text-danger">{dateError}</p>}

          {dateRangeInfo && (
            <p className="text-sm text-primary-600">{dateRangeInfo}</p>
          )}

          <IBaseSelect
            disallowEmptySelection
            label={t("labels.holidayType")}
            selectedKeys={[formData.holidayType]}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const arr = Array.from(keys);
              if (arr.length > 0) handleFieldChange("holidayType", arr[0] as string);
            }}
          >
            {HOLIDAY_TYPES.map((type) => (
              <IBaseSelectItem key={type.key}>{type.label}</IBaseSelectItem>
            ))}
          </IBaseSelect>

          <IBaseTextarea
            label={t("labels.description")}
            placeholder={t("placeholders.description")}
            value={formData.description}
            onValueChange={(v) => handleFieldChange("description", v)}
          />

          <div className="flex flex-wrap gap-6">
            <IBaseCheckbox
              isSelected={formData.isPaid}
              onValueChange={(v) => handleFieldChange("isPaid", v)}
            >
              {t("labels.isPaid")}
            </IBaseCheckbox>
            <IBaseCheckbox
              isSelected={formData.isActive}
              onValueChange={(v) => handleFieldChange("isActive", v)}
            >
              {t("labels.isActive")}
            </IBaseCheckbox>
          </div>
        </IBaseModalBody>

        <IBaseModalFooter>
          <IBaseButton variant="light" onPress={onClose}>
            {tActions("cancel")}
          </IBaseButton>
          <IBaseButton
            color="primary"
            isDisabled={!canSubmit}
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            {isEdit ? tActions("save") : tActions("add")}
          </IBaseButton>
        </IBaseModalFooter>
      </IBaseModalContent>
    </IBaseModal>
  );
}
