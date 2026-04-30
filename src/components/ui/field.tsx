import { Field as ChakraField, Fieldset as ChakraFieldset } from "@chakra-ui/react";
import type React from "react";
import type { ReactNode } from "react";

const FieldLabel = ChakraField.Label as React.ComponentType<{
  children?: ReactNode;
}>;

const FieldsetLegend = ChakraFieldset.Legend as React.ComponentType<{
  children?: ReactNode;
}>;

export const Field = {
  ...ChakraField,
  Label: FieldLabel,
};

export const Fieldset = {
  ...ChakraFieldset,
  Legend: FieldsetLegend,
};
