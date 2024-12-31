import {
  useBreakpointValue,
  Stack,
  HStack,
  IconButton,
  Icon,
  Link,
} from "@chakra-ui/react";
import { FiTwitter, FiInstagram, FiLinkedin, FiGithub } from "react-icons/fi";
import { InnerBgCard } from "../../core/Cards";
import { SectionText } from "../../core/Texts";
import { PersonalData } from "data";
import { Tooltip } from "@components/ui/tooltip";
import { useColorModeValue } from "@components/ui/color-mode";
import React from "react";

function SocialIconButton({
  icon,
  label,
  url,
}: {
  icon: any;
  label: string;
  url?: string;
}) {
  return (
    <Tooltip content={label} closeOnScroll>
      <Link href={url ?? ""} target={"_blank"} rounded={"full"}>
        <IconButton
          as={"a"}
          borderRadius={"50%"}
          variant={"solid"}
          shadow={"md"}
          background={useColorModeValue("white", "gray.700")}
          color={useColorModeValue("gray.600", "gray.400")}
          aria-label={label}
        >
          <Icon boxSize={5}>{React.createElement(icon)}</Icon>
        </IconButton>
      </Link>
    </Tooltip>
  );
}

const TwitterIcon = () => (
  <SocialIconButton
    icon={FiTwitter}
    label={"Twitter"}
    url={PersonalData.twitter.url}
  />
);
const InstagramIcon = () => (
  <SocialIconButton
    icon={FiInstagram}
    label={"Instagram"}
    url={PersonalData.instagram.url}
  />
);
const LinkedinIcon = () => (
  <SocialIconButton
    icon={FiLinkedin}
    label={"LinkedIn"}
    url={PersonalData.linkedIn.url}
  />
);
const GithubIcon = () => (
  <SocialIconButton
    icon={FiGithub}
    label={"Github"}
    url={PersonalData.github.url}
  />
);

export default function SocialCard() {
  const smallLayout = useBreakpointValue([true, false]);

  return (
    <InnerBgCard>
      <Stack
        direction={smallLayout ? "column" : "row"}
        align={"center"}
        gap={4}
        justify={"space-between"}
      >
        <SectionText hideDot={smallLayout}>Follow me</SectionText>
        <HStack gap={4}>
          <LinkedinIcon />
          <GithubIcon />
          <InstagramIcon />
          <TwitterIcon />
        </HStack>
      </Stack>
    </InnerBgCard>
  );
}
