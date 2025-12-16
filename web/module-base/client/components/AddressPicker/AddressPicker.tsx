"use client";

import type { Address, countryCode } from "@base/client/interface/Address";
import type { LocalizeText } from "@base/client/interface/LocalizeText";

import {
  IBaseInput,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
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
  () => import("./PickerAddressByCountryUS"),
);
const PickerAddressByCountryVN = dynamic(
  () => import("./PickerAddressByCountryVN"),
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
      const name = getLocalizedName(country.name as LocalizeText);
      const nameObj = country.name as LocalizeText;

      return {
        value: country.code,
        label: name,
        searchText: `${name} ${nameObj.vi || ""} ${nameObj.en || ""}`,
      };
    });
  }, [countries, getLocalizedName]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<countryCode>(
    value?.country?.code ?? "VN",
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
          name: (countries.find((c) => c.id === selectedCountryCode)
            ?.name as LocalizeText) || {
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
          name: (countries.find((c) => c.id === initialCountryCode)
            ?.name as LocalizeText) || {
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
            setTempAddress={setTempAddress}
            tempAddress={tempAddress}
          />
        );
      default:
        return (
          <PickerAddressByCountryUS
            countryCode={countryCode}
            setTempAddress={setTempAddress}
            tempAddress={tempAddress}
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
            color="primary"
            size="sm"
            startContent={<MapPin size={16} />}
            type="button"
            variant="bordered"
            onPress={handleOpen}
          />
        </Tooltip>
      </div>

      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="2xl"
        onClose={handleClose}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("modal.title")}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <IBaseSingleSelect
                    disallowEmptySelection
                    isRequired
                    classNames={{
                      popoverContent: "max-w-full",
                    }}
                    items={countryItems}
                    label={t("modal.country.label")}
                    placeholder={t("modal.country.placeholder")}
                    selectedKey={selectedCountryCode || "VN"}
                    onSelectionChange={(key) => {
                      // Prevent deselection - at least one item must be selected
                      if (key) {
                        setSelectedCountryCode(key as countryCode);
                      }
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
                <Button size="sm" variant="bordered" onPress={handleCancel}>
                  {tCommon("modal.buttons.cancel")}
                </Button>
                <Button
                  color="primary"
                  isDisabled={!selectedCountryCode}
                  size="sm"
                  onPress={handleSave}
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
