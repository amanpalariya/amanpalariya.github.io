import { VStack } from "@chakra-ui/react";
import Footer from "../common/Footer";

export default function WithFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VStack align={"stretch"}>
      {children}
      <Footer />
    </VStack>
  );
}
