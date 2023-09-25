import { Box, VStack } from "@chakra-ui/react";
import { MainCard } from "../../core/Cards";

export default function WithBodyCard({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <Box p={[2, 4]}>
      <MainCard>
        <VStack align={"stretch"}>{children}</VStack>
      </MainCard>
    </Box>
  );
}
