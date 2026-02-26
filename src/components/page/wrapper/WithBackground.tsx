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
        backgroundColor={"app.bg.canvas"}
        backgroundImage={useColorModeValue(
          "radial-gradient(circle, rgba(45, 55, 72, 0.15) 1px, transparent 1px), radial-gradient(circle, rgba(45, 55, 72, 0.12) 1px, transparent 1px)",
          "radial-gradient(circle, rgba(237, 242, 247, 0.10) 1px, transparent 1px), radial-gradient(circle, rgba(237, 242, 247, 0.08) 1px, transparent 1px)",
        )}
        backgroundSize="24px 24px"
        backgroundPosition="0 0, 12px 12px"
      />
      <Container maxW={"3xl"} p={0}>
        {children}
      </Container>
    </>
  );
}
