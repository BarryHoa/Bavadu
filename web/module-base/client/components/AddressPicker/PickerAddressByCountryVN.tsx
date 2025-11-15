"use client";

import Input from "@base/client/components/Input";
import Select, { SelectItem } from "@base/client/components/Select";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import type {
  Address,
  AdministrativeUnit,
  countryCode,
} from "@base/client/interface/Address";
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

  // Fetch provinces
  const { data: provinces = [] } = useQuery<
    Array<{
      id: string;
      code: string;
      name: { vi: string; en: string };
    }>
  >({
    queryKey: ["provinces", "VN"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/administrative-units/provinces?countryCode=VN");
      // return response.json();

      // Mock data
      return [
        {
          id: "01",
          code: "01",
          name: { vi: "Hà Nội", en: "Hanoi" },
        },
        {
          id: "79",
          code: "79",
          name: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City" },
        },
        {
          id: "31",
          code: "31",
          name: { vi: "Hải Phòng", en: "Hai Phong" },
        },
      ];
    },
  });

  // Fetch wards trực tiếp theo province (cấu trúc mới)
  const { data: wards = [] } = useQuery<
    Array<{
      id: string;
      code: string;
      name: { vi: string; en: string };
      type: "ward" | "commune" | "township";
      provinceCode: string;
    }>
  >({
    queryKey: ["wards", selectedProvinceId],
    queryFn: async () => {
      if (!selectedProvinceId) {
        return [];
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/administrative-units/provinces/${selectedProvinceId}/wards`);
      // return response.json();

      // Mock data
      if (selectedProvinceId === "01") {
        return [
          {
            id: "00001",
            code: "00001",
            name: { vi: "Phường Điện Biên", en: "Dien Bien Ward" },
            type: "ward",
            provinceCode: "01",
          },
          {
            id: "00002",
            code: "00002",
            name: { vi: "Phường Đội Cấn", en: "Doi Can Ward" },
            type: "ward",
            provinceCode: "01",
          },
          {
            id: "00003",
            code: "00003",
            name: { vi: "Xã An Bình", en: "An Binh Commune" },
            type: "commune",
            provinceCode: "01",
          },
        ];
      }
      if (selectedProvinceId === "79") {
        return [
          {
            id: "26734",
            code: "26734",
            name: { vi: "Phường Bến Nghé", en: "Ben Nghe Ward" },
            type: "ward",
            provinceCode: "79",
          },
          {
            id: "26735",
            code: "26735",
            name: { vi: "Phường Đa Kao", en: "Da Kao Ward" },
            type: "ward",
            provinceCode: "79",
          },
        ];
      }
      return [];
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
          createAdministrativeUnit(province.id, province.name, "province")
        );
      }
    }

    // Add Ward/Commune/Township (level 3) - trực thuộc tỉnh/TP
    if (wardId) {
      const ward = wards.find((w) => w.id === wardId);
      if (ward) {
        units.push(createAdministrativeUnit(ward.id, ward.name, ward.type));
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
          const name = getLocalizedName(province.name);
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
          const name = getLocalizedName(ward.name);
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
