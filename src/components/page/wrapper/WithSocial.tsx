import { VStack } from "@chakra-ui/react";
import Social from "../common/SocialCard";

export default function WithSocial({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VStack align={"stretch"}>
      {children}
      <Social />
    </VStack>
  );
}
