"use client";

import Input from "@base/client/components/Input";
import Select, { SelectItem } from "@base/client/components/Select";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import type {
  Address,
  AdministrativeUnit,
  countryCode,
} from "@base/client/interface/Address";
import locationService from "@base/client/services/LocationService";
import { createAdministrativeUnit } from "@base/client/utils/address/addressUtils";
import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";

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
      <Select
        selectionMode="single"
        label="Tỉnh/Thành phố"
        size="sm"
        placeholder="Chọn tỉnh hoặc thành phố"
        isRequired
        selectedKeys={
          selectedProvinceId ? new Set([selectedProvinceId]) : new Set()
        }
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          const newProvinceId = selected || "";
          setSelectedProvinceId(newProvinceId);
          // Reset ward khi đổi province
          setSelectedWardId("");
          // Update administrativeUnits
          updateAdministrativeUnits(newProvinceId, "");
        }}
      >
        {provinces.map((province) => {
          const name = getLocalizedName(
            province.name as Record<string, string>
          );
          return <SelectItem key={province.id}>{name}</SelectItem>;
        })}
      </Select>

      {/* Phường/Xã/Thị trấn - Required (trực thuộc tỉnh/TP) */}
      <Select
        selectionMode="single"
        label="Phường/Xã/Thị trấn"
        size="sm"
        placeholder="Chọn phường, xã hoặc thị trấn (trực thuộc tỉnh/TP)"
        isRequired
        selectedKeys={selectedWardId ? new Set([selectedWardId]) : new Set()}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          const newWardId = selected || "";
          setSelectedWardId(newWardId);
          // Update administrativeUnits
          updateAdministrativeUnits(selectedProvinceId, newWardId);
        }}
        isDisabled={!selectedProvinceId}
      >
        {wards.map((ward) => {
          const name = getLocalizedName(ward.name as Record<string, string>);
          return <SelectItem key={ward.id}>{name}</SelectItem>;
        })}
      </Select>

      {/* Địa chỉ đường */}
      <Input
        label="Địa chỉ đường"
        placeholder="Số nhà, tên đường"
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
        isRequired
      />
    </div>
  );
};

export default PickerAddressByCountryVN;
