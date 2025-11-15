"use client";

import {
  IBaseInput,
  IBaseSelectWithSearch,
  SelectItemOption,
} from "@base/client/components";
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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
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
  isShowPostalCode?: boolean;
}

export default function AddressPicker({
  value,
  onChange,
  isShowPostalCode = false,
}: AddressPickerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const getLocalizedName = useLocalizedText();
  const locale = useLocale();
  const t = useTranslations("addressPicker");
  const tCommon = useTranslations("common");
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

  const countryItems = useMemo<SelectItemOption[]>(() => {
    return countries.map((country) => {
      const name = getLocalizedName(country.name as Record<string, string>);
      const nameObj = country.name as Record<string, string>;
      return {
        value: country.code,
        label: name,
        searchText: `${name} ${nameObj.vi || ""} ${nameObj.en || ""}`,
      };
    });
  }, [countries, getLocalizedName]);

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

  const handleClose = () => {
    // Reset state when closing modal
    const initialCountryCode = value?.country?.code ?? "VN";
    setSelectedCountryCode(initialCountryCode);

    if (value) {
      setTempAddress(value);
    } else {
      setTempAddress({
        country: {
          id: initialCountryCode,
          name: countries.find((c) => c.id === initialCountryCode)?.name || {
            vi: "",
            en: "",
          },
          code: initialCountryCode,
        },
        administrativeUnits: [],
        street: "",
        postalCode: "",
        latitude: undefined,
        longitude: undefined,
        formattedAddress: "",
      });
    }
    onClose();
  };

  const handleCancel = () => {
    handleClose();
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
        <Tooltip
          content={isChangeAddress ? t("tooltip.change") : t("tooltip.select")}
          placement="top"
        >
          <Button
            isIconOnly
            type="button"
            size="sm"
            variant="bordered"
            onPress={handleOpen}
            startContent={<MapPin size={16} />}
            color="primary"
          />
        </Tooltip>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("modal.title")}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <IBaseSelectWithSearch
                    label={t("modal.country.label")}
                    placeholder={t("modal.country.placeholder")}
                    items={countryItems}
                    isRequired
                    selectedKeys={
                      selectedCountryCode
                        ? new Set([selectedCountryCode])
                        : new Set(["VN"])
                    }
                    onSelectionChange={(keys) => {
                      const keySet = keys as Set<string>;
                      const selected = Array.from(keySet)[0] as string;
                      // Prevent deselection - at least one item must be selected
                      if (selected) {
                        setSelectedCountryCode(selected as countryCode);
                      }
                    }}
                    disallowEmptySelection
                    classNames={{
                      popoverContent: "max-w-full",
                    }}
                  />

                  {renderPickerAddressByCountry(selectedCountryCode)}

                  {isShowPostalCode && (
                    <IBaseInput
                      label={t("modal.postalCode.label")}
                      placeholder={t("modal.postalCode.placeholder")}
                      value={tempAddress.postalCode || ""}
                      onValueChange={(value) =>
                        setTempAddress((prev) => ({
                          ...prev,
                          postalCode: value,
                        }))
                      }
                    />
                  )}

                  {/* show is formattedAddress is a string */}

                  <div className="flex flex-col gap-2 text-sm text-default-400 italic">
                    {fullAddress as string}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="bordered" onPress={handleCancel} size="sm">
                  {tCommon("modal.buttons.cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isDisabled={!selectedCountryCode}
                  size="sm"
                >
                  {tCommon("modal.buttons.apply")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
