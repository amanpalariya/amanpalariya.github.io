import { NumberInput as ChakraNumberInput, type InputProps } from "@chakra-ui/react";
import type React from "react";

const NumberInputInput = ChakraNumberInput.Input as React.ComponentType<InputProps>;

export const NumberInput = {
  ...ChakraNumberInput,
  Input: NumberInputInput,
};
