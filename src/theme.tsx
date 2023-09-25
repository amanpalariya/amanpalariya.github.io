import { extendTheme } from "@chakra-ui/react";
import { StyleFunctionProps, mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  fonts: {
    heading: `'Lexend', serif`,
    body: `'Lexend', sans-serif`,
  },
});

export default theme;
