import { useColorModeValue, Container, Spacer, Box } from "@chakra-ui/react";

export default function Background({
  children,
}: {
  children: JSX.Element | JSX.Element[];
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
      <Container maxWidth={"container.md"} p={0}>
        {children}
      </Container>
    </>
  );
}
