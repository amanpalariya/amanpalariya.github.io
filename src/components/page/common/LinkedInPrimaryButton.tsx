import { Icon, IconButton, Link } from "@chakra-ui/react";
import { PrimaryActionButton } from "@components/core/Buttons";
import { PersonalData } from "data";
import { FaLinkedin } from "react-icons/fa";
import { Tooltip } from "@components/ui/tooltip";
import { useColorModeValue } from "@components/ui/color-mode";

export default function LinkedInButton() {
  return (
    <Tooltip
      content={`@${PersonalData.linkedIn.username}`}
      hasArrow
      closeOnScroll
    >
      <Link href={PersonalData.linkedIn.url} target="_blank">
        <PrimaryActionButton
          icon={FaLinkedin}
          backgroundColor={useColorModeValue("#0077B5", "#70C0EC")}
        >
          LinkedIn
        </PrimaryActionButton>
      </Link>
    </Tooltip>
  );
}

export function LinkedInButtonSmall() {
  return (
    <Tooltip
      content={`@${PersonalData.linkedIn.username}`}
      hasArrow
      closeOnScroll
    >
      <Link href={PersonalData.linkedIn.url} target="_blank" rounded={"full"}>
        <IconButton
          as={"a"}
          rounded={"full"}
          colorScheme="blue"
          aria-label={"LinkedIn"}
        >
          <Icon>
            <FaLinkedin />
          </Icon>
        </IconButton>
      </Link>
    </Tooltip>
  );
}
