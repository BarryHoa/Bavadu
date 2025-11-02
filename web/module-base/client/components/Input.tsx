import { Input as HeroUIInput, InputProps } from "@heroui/input";

type InputBaseType = InputProps & {};
const InputBase = (props: InputBaseType) => {
  return <HeroUIInput labelPlacement="outside-top" size="sm" {...props} />;
};

export default InputBase;
