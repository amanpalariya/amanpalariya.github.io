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
        asChild
        aria-label={"Open LinkedIn profile (opens in a new tab)"}
        icon={FaLinkedin}
        backgroundColor={"app.brand.linkedin.solid"}
      >
        <a
          href={PersonalData.linkedIn.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
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
        asChild
        rounded={"full"}
        color={"app.brand.linkedin.contrast"}
        backgroundColor={"app.brand.linkedin.solid"}
        _hover={{ opacity: 0.9 }}
        aria-label={"Open LinkedIn profile (opens in a new tab)"}
      >
        <a
          href={PersonalData.linkedIn.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon>
            <FaLinkedin />
          </Icon>
        </a>
      </IconButton>
    </Tooltip>
  );
}
