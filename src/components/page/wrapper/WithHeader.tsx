import { Box, Spacer } from "@chakra-ui/react";
import Header from "../common/Header";

export default function WithHeader({ children }: { children: JSX.Element }) {
  return (
    <Box>
      <Header />
      <Spacer h={24} />
      {children}
    </Box>
  );
}
