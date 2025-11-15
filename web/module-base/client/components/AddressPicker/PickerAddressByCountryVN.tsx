"use client";

import { IBaseInput, IBaseSelect, SelectItem } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import type {
  Address,
  AdministrativeUnit,
  countryCode,
} from "@base/client/interface/Address";
import locationService from "@base/client/services/LocationService";
import { createAdministrativeUnit } from "@base/client/utils/address/addressUtils";
import { useQuery } from "@tanstack/react-query";
import MiniSearch from "minisearch";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

interface PickerAddressByCountryVNProps {
  countryCode?: countryCode;
  tempAddress: Address;
  setTempAddress: Dispatch<SetStateAction<Address>>;
}

interface SearchableLocation {
  id: string;
  nameVi: string;
  nameEn: string;
  name: string; // localized name for search
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

  // Create MiniSearch for provinces
  const provinceSearch = useMemo(() => {
    const searchableProvinces: SearchableLocation[] = provinces.map(
      (province) => {
        const name = getLocalizedName(province.name as Record<string, string>);
        const nameObj = province.name as Record<string, string>;
        return {
          id: province.id,
          nameVi: nameObj.vi || "",
          nameEn: nameObj.en || "",
          name: name,
        };
      }
    );

    const ms = new MiniSearch<SearchableLocation>({
      fields: ["name", "nameVi", "nameEn"],
      storeFields: ["id", "name", "nameVi", "nameEn"],
      idField: "id",
    });

    if (searchableProvinces.length) {
      ms.addAll(searchableProvinces);
    }

    return ms;
  }, [provinces, getLocalizedName]);

  // Create MiniSearch for wards
  const wardSearch = useMemo(() => {
    const searchableWards: SearchableLocation[] = wards.map((ward) => {
      const name = getLocalizedName(ward.name as Record<string, string>);
      const nameObj = ward.name as Record<string, string>;
      return {
        id: ward.id,
        nameVi: nameObj.vi || "",
        nameEn: nameObj.en || "",
        name: name,
      };
    });

    const ms = new MiniSearch<SearchableLocation>({
      fields: ["name", "nameVi", "nameEn"],
      storeFields: ["id", "name", "nameVi", "nameEn"],
      idField: "id",
    });

    if (searchableWards.length) {
      ms.addAll(searchableWards);
    }

    return ms;
  }, [wards, getLocalizedName]);

  // Filter provinces using MiniSearch (when user types in Select)
  const filteredProvinces = useMemo(() => {
    // HeroUI Select handles search internally, but we can use MiniSearch
    // for more advanced filtering if needed. For now, return all provinces
    // as HeroUI Select will handle the search with textValue
    return provinces;
  }, [provinces]);

  // Filter wards using MiniSearch (when user types in Select)
  const filteredWards = useMemo(() => {
    // HeroUI Select handles search internally, but we can use MiniSearch
    // for more advanced filtering if needed. For now, return all wards
    // as HeroUI Select will handle the search with textValue
    return wards;
  }, [wards]);

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
      <IBaseSelect
        selectionMode="single"
        label="Tỉnh/Thành phố"
        size="sm"
        placeholder="Chọn tỉnh hoặc thành phố"
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
        disallowEmptySelection={false}
        classNames={{
          popoverContent: "max-w-full",
        }}
      >
        {filteredProvinces.map((province) => {
          const name = getLocalizedName(
            province.name as Record<string, string>
          );
          const nameObj = province.name as Record<string, string>;
          // Include both Vietnamese and English names for better search
          const searchText = `${name} ${nameObj.vi || ""} ${nameObj.en || ""}`;
          return (
            <SelectItem key={province.id} textValue={searchText}>
              {name}
            </SelectItem>
          );
        })}
      </IBaseSelect>

      {/* Phường/Xã/Thị trấn - Required (trực thuộc tỉnh/TP) */}
      <IBaseSelect
        selectionMode="single"
        label="Phường/Xã/Thị trấn"
        size="sm"
        placeholder="Chọn phường, xã hoặc thị trấn (trực thuộc tỉnh/TP)"
        selectedKeys={selectedWardId ? new Set([selectedWardId]) : new Set()}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          const newWardId = selected || "";
          setSelectedWardId(newWardId);
          // Update administrativeUnits
          updateAdministrativeUnits(selectedProvinceId, newWardId);
        }}
        isDisabled={!selectedProvinceId}
        disallowEmptySelection={false}
        classNames={{
          popoverContent: "max-w-full",
        }}
      >
        {filteredWards.map((ward) => {
          const name = getLocalizedName(ward.name as Record<string, string>);
          const nameObj = ward.name as Record<string, string>;
          // Include both Vietnamese and English names for better search
          const searchText = `${name} ${nameObj.vi || ""} ${nameObj.en || ""}`;
          return (
            <SelectItem key={ward.id} textValue={searchText}>
              {name}
            </SelectItem>
          );
        })}
      </IBaseSelect>

      {/* Địa chỉ đường */}
      <IBaseInput
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
      />
    </div>
  );
};

export default PickerAddressByCountryVN;
