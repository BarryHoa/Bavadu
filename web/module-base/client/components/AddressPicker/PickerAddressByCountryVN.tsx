"use client";

import {
  IBaseInput,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import type {
  Address,
  AdministrativeUnit,
  countryCode,
} from "@base/client/interface/Address";
import type { LocalizeText } from "@base/client/interface/LocalizeText";
import locationService from "@base/client/services/LocationService";
import { createAdministrativeUnit } from "@base/client/utils/address/addressUtils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

interface PickerAddressByCountryVNProps {
  countryCode?: countryCode;
  tempAddress: Address;
  setTempAddress: Dispatch<SetStateAction<Address>>;
}

const PickerAddressByCountryVN = ({
  countryCode = "VN",
  tempAddress,
  setTempAddress,
}: PickerAddressByCountryVNProps) => {
  const getLocalizedName = useLocalizedText();
  const t = useTranslations("addressPicker.vietnam");
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedWardId, setSelectedWardId] = useState<string>("");

  // Fetch provinces (level 1, no parent)
  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces", countryCode],
    queryFn: async () => {
      const response = await locationService.getLocationByCountryCode(
        countryCode,
        {
          parentId: null,
          level: 1,
        }
      );
      return response.data || [];
    },
  });

  // Fetch wards/communes/townships trực tiếp theo province (cấu trúc mới - level 3)
  const { data: wards = [] } = useQuery({
    queryKey: ["wards", selectedProvinceId],
    queryFn: async () => {
      if (!selectedProvinceId) {
        return [];
      }

      // Get all level 3 units (ward, commune, township) under the selected province
      const response = await locationService.getLocationBy(
        selectedProvinceId,
        "ward"
      );
      return response.data || [];
    },
    enabled: !!selectedProvinceId,
  });

  // Convert provinces to SelectItemOption format
  const provinceItems = useMemo<SelectItemOption[]>(() => {
    return provinces.map((province) => {
      const name = getLocalizedName(province.name as LocalizeText);
      const nameObj = province.name as LocalizeText;
      // Include both Vietnamese and English names for better search
      const searchText = `${name} ${nameObj.vi || ""} ${nameObj.en || ""}`;
      return {
        value: province.id,
        label: name,
        searchText: searchText,
      };
    });
  }, [provinces, getLocalizedName]);

  // Convert wards to SelectItemOption format
  const wardItems = useMemo<SelectItemOption[]>(() => {
    return wards.map((ward) => {
      const name = getLocalizedName(ward.name as LocalizeText);
      const nameObj = ward.name as LocalizeText;
      // Include both Vietnamese and English names for better search
      const searchText = `${name} ${nameObj.vi || ""} ${nameObj.en || ""}`;
      return {
        value: ward.id,
        label: name,
        searchText: searchText,
      };
    });
  }, [wards, getLocalizedName]);

  // Helper function để build và update administrativeUnits và formattedAddress
  const updateAdministrativeUnits = (provinceId: string, wardId: string) => {
    const units: AdministrativeUnit[] = [];

    // Add Province (level 1)
    if (provinceId) {
      const province = provinces.find((p) => p.id === provinceId);
      if (province) {
        units.push(
          createAdministrativeUnit(
            province.id,
            province.name as Record<string, string>,
            "province"
          )
        );
      }
    }

    // Add Ward/Commune/Township (level 3) - trực thuộc tỉnh/TP
    if (wardId) {
      const ward = wards.find((w) => w.id === wardId);
      if (ward) {
        units.push(
          createAdministrativeUnit(
            ward.id,
            ward.name as Record<string, string>,
            ward.type as "ward" | "commune" | "township"
          )
        );
      }
    }

    // Build formattedAddress từ tempAddress với administrativeUnits mới
    const updatedAddress: Address = {
      ...tempAddress,
      administrativeUnits: units,
    };

    setTempAddress(updatedAddress);
  };

  return (
    <div className="flex flex-col gap-4">
      <IBaseSingleSelect
        label={t("province.label")}
        placeholder={t("province.placeholder")}
        items={provinceItems}
        selectedKey={selectedProvinceId || undefined}
        onSelectionChange={(key) => {
          const newProvinceId = key || "";
          setSelectedProvinceId(newProvinceId);
          // Reset ward khi đổi province
          setSelectedWardId("");
          // Update administrativeUnits
          updateAdministrativeUnits(newProvinceId, "");
        }}
        disallowEmptySelection={false}
      />

      {/* Phường/Xã/Thị trấn - Required (trực thuộc tỉnh/TP) */}
      <IBaseSingleSelect
        label={t("ward.label")}
        placeholder={t("ward.placeholder")}
        items={wardItems}
        selectedKey={selectedWardId || undefined}
        onSelectionChange={(key) => {
          const newWardId = key || "";
          setSelectedWardId(newWardId);
          // Update administrativeUnits
          updateAdministrativeUnits(selectedProvinceId, newWardId);
        }}
        isDisabled={!selectedProvinceId}
        disallowEmptySelection={false}
      />

      {/* Địa chỉ đường */}
      <IBaseInput
        label={t("street.label")}
        placeholder={t("street.placeholder")}
        value={
          typeof tempAddress.street === "string"
            ? tempAddress.street
            : getLocalizedName(tempAddress.street) || ""
        }
        onValueChange={(value) => {
          const updatedAddress: Address = {
            ...tempAddress,
            street: value,
          };

          setTempAddress({
            ...updatedAddress,
          });
        }}
      />
    </div>
  );
};

export default PickerAddressByCountryVN;
