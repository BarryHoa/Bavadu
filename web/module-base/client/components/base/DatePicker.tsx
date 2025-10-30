import { DatePicker, DatePickerProps } from "@heroui/date-picker";

type DatePickerBaseProps = DatePickerProps & {};

const DatePickerBase = (props: DatePickerBaseProps) => {
  return (
    <DatePicker
      labelPlacement="outside"
      size="sm"
      variant="bordered"
      {...props}
    />
  );
};

export default DatePickerBase;
