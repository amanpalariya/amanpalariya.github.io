import { VStack, HStack, Box } from "@chakra-ui/react";
import { FiCopy } from "react-icons/fi";
import { PrimaryActionButton, SecondaryActionButton } from "../../core/Buttons";
import { Heading1, SubtitleText } from "../../core/Texts";
import { FaLinkedin } from "react-icons/fa";
import CopyEmailButton from "./CopyEmailSecondaryButton";
import { Link } from "@chakra-ui/next-js";
import { PersonalData } from "data";
import LinkedInButton from "./LinkedInPrimaryButton";

export default function BottomMessage() {
  return (
    <Box p={8}>
      <VStack align={"center"} spacing={6}>
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
