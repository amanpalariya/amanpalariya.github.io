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
import React from "react";

function SocialIconButton({
  icon,
  label,
  url,
  color,
}: {
  icon: any;
  label: string;
  url?: string;
  color: string;
}) {
  return (
    <Tooltip content={label} closeOnScroll>
      <Link href={url ?? ""} target="_blank" rel="noreferrer">
        <IconButton
          borderRadius={"50%"}
          borderWidth={1}
          borderColor={"app.border.default"}
          variant={"solid"}
          background={"gray.emphasized"}
          color={color}
          _hover={{ opacity: 0.9 }}
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
    color={"app.brand.twitter.solid"}
  />
);
const InstagramIcon = () => (
  <SocialIconButton
    icon={FiInstagram}
    label={"Instagram"}
    url={PersonalData.instagram.url}
    color={"app.brand.instagram.solid"}
  />
);
const LinkedinIcon = () => (
  <SocialIconButton
    icon={FiLinkedin}
    label={"LinkedIn"}
    url={PersonalData.linkedIn.url}
    color={"app.brand.linkedin.solid"}
  />
);
const GithubIcon = () => (
  <SocialIconButton
    icon={FiGithub}
    label={"Github"}
    url={PersonalData.github.url}
    color={"app.brand.github.solid"}
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
