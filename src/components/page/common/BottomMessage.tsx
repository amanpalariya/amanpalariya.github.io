import { VStack, HStack, Box } from "@chakra-ui/react";
import { Heading1, SubtitleText } from "../../core/Texts";
import CopyEmailButton from "./CopyEmailSecondaryButton";
import LinkedInButton from "./LinkedInPrimaryButton";

export default function BottomMessage() {
  return (
    <Box p={8}>
      <VStack align={"center"} gap={6}>
        <VStack align={"center"}>
          <Heading1 centerAlign>{`Let's grow together.`}</Heading1>
          <SubtitleText centerAlign>
            Connect with me to talk, work, and share ideas
          </SubtitleText>
        </VStack>
        <HStack justify={"center"}>
          <LinkedInButton />
          <CopyEmailButton />
        </HStack>
      </VStack>
    </Box>
  );
}
