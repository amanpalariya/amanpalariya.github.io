import { Icon, IconButton } from "@chakra-ui/react";
import { PrimaryActionButton } from "@components/core/Buttons";
import { PersonalData } from "data";
import { FaLinkedin } from "react-icons/fa";
import { Tooltip } from "@components/ui/tooltip";

export default function LinkedInButton() {
  return (
    <Tooltip
      content={`@${PersonalData.linkedIn.username}`}
      showArrow
      closeOnScroll
    >
      <PrimaryActionButton
        as={"a"}
        href={PersonalData.linkedIn.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={"Open LinkedIn profile"}
        icon={FaLinkedin}
        backgroundColor={"app.brand.linkedin.solid"}
      >
        LinkedIn
      </PrimaryActionButton>
    </Tooltip>
  );
}

export function LinkedInButtonSmall() {
  return (
    <Tooltip
      content={`@${PersonalData.linkedIn.username}`}
      showArrow
      closeOnScroll
    >
      <IconButton
        as={"a"}
        href={PersonalData.linkedIn.url}
        target="_blank"
        rel="noopener noreferrer"
        rounded={"full"}
        colorScheme="blue"
        aria-label={"Open LinkedIn profile"}
      >
        <Icon>
          <FaLinkedin />
        </Icon>
      </IconButton>
    </Tooltip>
  );
}
