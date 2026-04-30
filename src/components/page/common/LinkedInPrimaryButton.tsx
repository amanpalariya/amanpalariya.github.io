import { Button, Icon, IconButton } from "@chakra-ui/react";
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
      <Button
        asChild
        fontFamily="ui"
        fontSize="sm"
        px={2.5}
        shadow="xs"
        rounded="xl"
        variant="solid"
        background="app.brand.linkedin.solid"
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
          LinkedIn
        </a>
      </Button>
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
