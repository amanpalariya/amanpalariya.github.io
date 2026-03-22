import { Box, VStack } from "@chakra-ui/react";
import { MainCard } from "../../core/Cards";
import type { BoxProps } from "@chakra-ui/react";

export default function WithBodyCard({
  children,
  containerProps,
}: {
  children: React.ReactNode;
  containerProps?: BoxProps;
}) {
  return (
    <Box px={[1, 4]} pt={[1, 2]} pb={[1, 1]} {...containerProps}>
      <MainCard>
        <VStack align={"stretch"}>{children}</VStack>
      </MainCard>
    </Box>
  );
}
