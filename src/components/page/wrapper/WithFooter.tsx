import { VStack } from "@chakra-ui/react";
import Footer from "../common/Footer";

export default function WithFooter({
  children,
  hideFooterBottomPart = false,
}: {
  children: React.ReactNode;
  hideFooterBottomPart?: boolean;
}) {
  return (
    <VStack align={"stretch"} gap={0}>
      {children}
      <Footer hideBottomPart={hideFooterBottomPart} />
    </VStack>
  );
}
