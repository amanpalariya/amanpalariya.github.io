import { VStack } from "@chakra-ui/react";
import Social from "../common/SocialCard";

export default function WithSocial({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <VStack align={"stretch"}>
      {children}
      <Social />
    </VStack>
  );
}
