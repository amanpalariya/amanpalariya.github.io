import { Field as ChakraField, Fieldset as ChakraFieldset } from "@chakra-ui/react";
import * as React from "react";
import type { ReactNode } from "react";

const FieldLabel = ChakraField.Label as React.ComponentType<{
  children?: ReactNode;
}>;

const FieldsetLegend = ChakraFieldset.Legend as React.ComponentType<{
  children?: ReactNode;
}>;

export interface FieldProps extends Omit<ChakraField.RootProps, "label"> {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  optionalText?: ReactNode;
  labelProps?: ChakraField.LabelProps;
  helperTextProps?: ChakraField.HelperTextProps;
  errorTextProps?: ChakraField.ErrorTextProps;
}

const FieldRoot = React.forwardRef<HTMLDivElement, FieldProps>(
  function FieldRoot(props, ref) {
    const {
      label,
      children,
      helperText,
      errorText,
      optionalText,
      labelProps,
      helperTextProps,
      errorTextProps,
      ...rest
    } = props;

    return (
      <ChakraField.Root ref={ref} {...rest}>
        {label ? (
          <ChakraField.Label {...labelProps}>
            {label}
            <ChakraField.RequiredIndicator
              color="app.fg.muted"
              fallback={optionalText}
              fontWeight="normal"
              ms={1}
            />
          </ChakraField.Label>
        ) : null}
        {children}
        {helperText ? (
          <ChakraField.HelperText {...helperTextProps}>
            {helperText}
          </ChakraField.HelperText>
        ) : null}
        {errorText ? (
          <ChakraField.ErrorText {...errorTextProps}>
            {errorText}
          </ChakraField.ErrorText>
        ) : null}
      </ChakraField.Root>
    );
  },
);

export const Field = Object.assign(FieldRoot, {
  ...ChakraField,
  Label: FieldLabel,
});

export const Fieldset = {
  ...ChakraFieldset,
  Legend: FieldsetLegend,
};
