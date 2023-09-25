import { Link } from "@chakra-ui/next-js";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { PrimaryActionButton } from "@components/core/Buttons";
import { PersonalData } from "data";
import { FaLinkedin } from "react-icons/fa";

export default function LinkedInButton() {
  return (
    <Tooltip
      label={`@${PersonalData.linkedIn.username}`}
      hasArrow
      closeOnScroll
    >
      <Link href={PersonalData.linkedIn.url} target="_blank">
        <PrimaryActionButton icon={FaLinkedin}>LinkedIn</PrimaryActionButton>
      </Link>
    </Tooltip>
  );
}

export function LinkedInButtonSmall() {
  return (
    <Tooltip
      label={`@${PersonalData.linkedIn.username}`}
      hasArrow
      closeOnScroll
    >
      <Link href={PersonalData.linkedIn.url} target="_blank" rounded={"full"}>
        <IconButton
          as={"a"}
          rounded={"full"}
          icon={<Icon as={FaLinkedin} />}
          colorScheme="blue"
          aria-label={"LinkedIn"}
        />
      </Link>
    </Tooltip>
  );
}
