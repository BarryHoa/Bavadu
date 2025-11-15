"use client";

import Input from "@base/client/components/Input";
import Select, { SelectItem } from "@base/client/components/Select";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import type { Address, countryCode } from "@base/client/interface/Address";
import locationService from "@base/client/services/LocationService";
import { buildAddressString } from "@base/client/utils/address/addressUtils";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
// @ts-ignore
// dynamic import PickerAddressByCountryUS
const PickerAddressByCountryUS = dynamic(
  () => import("./PickerAddressByCountryUS")
);
const PickerAddressByCountryVN = dynamic(
  () => import("./PickerAddressByCountryVN")
);

interface AddressPickerProps {
  value?: Address | null;
  onChange: (value: string) => void;
  label?: string;
}

export default function AddressPicker({
  value,
  onChange,
  label = "Địa chỉ",
}: AddressPickerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const getLocalizedName = useLocalizedText();
  const locale = useLocale();
  const isChangeAddress =
    !!value?.formattedAddress && value.formattedAddress !== "";

  // get countries from database
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await locationService.getCountries();
      return response.data || [];
    },
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState<countryCode>(
    value?.country?.code ?? "VN"
  );

  const [tempAddress, setTempAddress] = useState<Address>({
    country: {
      id: "",
      name: { vi: "", en: "" },
      code: selectedCountryCode,
    },
    administrativeUnits: [],
    street: "",
    postalCode: "",
    latitude: undefined,
    longitude: undefined,
    formattedAddress: "",
  });

  const handleOpen = () => {
    // Reset tempAddress when opening modal
    if (value) {
      setTempAddress(value);
    } else {
      setTempAddress({
        country: {
          id: selectedCountryCode,
          name: countries.find((c) => c.id === selectedCountryCode)?.name || {
            vi: "",
            en: "",
          },
          code: selectedCountryCode,
        },
        administrativeUnits: [],
        street: "",
        postalCode: "",
        latitude: undefined,
        longitude: undefined,
        formattedAddress: "",
      });
    }
    onOpen();
  };

  const fullAddress = buildAddressString(tempAddress, locale ?? "vi");

  const handleSave = () => {
    // Build Address object with administrativeUnits array
    const addressString = buildAddressString(tempAddress, locale ?? "vi");

    // Update formattedAddress in tempAddress
    const updatedAddress: Address = {
      ...tempAddress,
      formattedAddress: addressString,
    };

    // Call onChange with the formatted address string
    onChange(addressString);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const renderPickerAddressByCountry = (countryCode: countryCode) => {
    switch (countryCode) {
      case "VN":
        return (
          <PickerAddressByCountryVN
            countryCode={countryCode}
            tempAddress={tempAddress}
            setTempAddress={setTempAddress}
          />
        );
      default:
        return (
          <PickerAddressByCountryUS
            countryCode={countryCode}
            tempAddress={tempAddress}
            setTempAddress={setTempAddress}
          />
        );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          variant="bordered"
          onPress={handleOpen}
          startContent={<MapPin size={16} />}
        >
          {isChangeAddress ? "Thay đổi" : "Chọn"}
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Chọn địa chỉ
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Select
                    selectionMode="single"
                    label="Quốc gia"
                    size="sm"
                    placeholder="Chọn quốc gia"
                    isRequired
                    selectedKeys={
                      selectedCountryCode
                        ? new Set([selectedCountryCode])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setSelectedCountryCode(selected as countryCode);
                    }}
                  >
                    {countries.map((country) => {
                      const name = getLocalizedName(
                        country.name as Record<string, string>
                      );
                      return <SelectItem key={country.code}>{name}</SelectItem>;
                    })}
                  </Select>

                  {renderPickerAddressByCountry(selectedCountryCode)}

                  <Input
                    label="Mã bưu điện"
                    placeholder="Nhập mã bưu điện"
                    value={tempAddress.postalCode || ""}
                    onValueChange={(value) =>
                      setTempAddress((prev) => ({
                        ...prev,
                        postalCode: value,
                      }))
                    }
                  />

                  {/* show is formattedAddress is a string */}

                  <div className="flex flex-col gap-2">
                    {fullAddress as string}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={handleCancel}>
                  Hủy
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isDisabled={!selectedCountryCode}
                >
                  Áp dụng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
