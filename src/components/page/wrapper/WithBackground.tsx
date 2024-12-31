import { Container, Box } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";

export default function WithBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Box
        position={"fixed"}
        zIndex={-1}
        m={0}
        p={0}
        w="100vw"
        h="100vh"
        background={useColorModeValue("gray.100", "gray.900")}
      />
      <Container maxW={"3xl"} p={0}>
        {children}
      </Container>
    </>
  );
}
