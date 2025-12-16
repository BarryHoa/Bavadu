import type { Address, countryCode } from "../../interface/Address";

import { Dispatch, SetStateAction } from "react";

interface PickerAddressByCountryUSProps {
  countryCode?: countryCode;
  tempAddress: Address;
  setTempAddress: Dispatch<SetStateAction<Address>>;
}

const PickerAddressByCountryUS = ({
  countryCode = "US",
  tempAddress,
  setTempAddress,
}: PickerAddressByCountryUSProps) => {
  return (
    <div>
      <h1>Picker Address By Country US</h1>
    </div>
  );
};

export default PickerAddressByCountryUS;
