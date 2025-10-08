import { Input as HeroUIInput, InputProps } from "@heroui/input";

type InputBaseType = InputProps & {};
const Input = (props: InputBaseType) => {
  return <HeroUIInput labelPlacement="outside-top" {...props} />;
};

export default Input;
