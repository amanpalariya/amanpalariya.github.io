import PageNavigation from "../common/PageNavigation";
import { Box, VStack } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";

export default function WithBodyCard({
  children,
  containerProps,
}: {
  children: React.ReactNode;
  containerProps?: BoxProps;
}) {
  return (
    <Box
      as="main"
      className="site-main"
      id="main-content"
      tabIndex={-1}
      scrollMarginTop={{ base: "6rem", sm: "7rem" }}
      p={0}
      {...containerProps}
    >
      <PageNavigation />
      <VStack className="site-main-content" align={"stretch"} gap={0}>
        {children}
      </VStack>
    </Box>
  );
}
