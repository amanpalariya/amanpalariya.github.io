import {
  Box,
  Text,
  VStack,
  Stack,
  Link,
  HStack,
  Icon,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { HeaderCard } from "@components/core/Cards";
import { Tooltip } from "@components/ui/tooltip";
import { homepageTabs } from "app/route-info";
import { PersonalData } from "data";
import {
  FiGithub,
  FiHeart,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiSun,
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { IoSnowOutline } from "react-icons/io5";

const footerLinkProps = {
  fontSize: "sm",
  color: "app.fg.subtle",
  lineHeight: "short",
  _hover: {
    color: "app.fg.default",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
} as const;

export default function Footer({
  hideBottomPart = false,
}: {
  hideBottomPart?: boolean;
}) {
  const currentMonth = new Date().getMonth();
  const seasonalArtifact =
    currentMonth >= 11 || currentMonth <= 1
      ? { label: "Winter artifact", icon: IoSnowOutline }
      : currentMonth >= 2 && currentMonth <= 4
        ? { label: "Spring artifact", icon: FiHeart }
        : { label: "Sunny artifact", icon: FiSun };

  const socialLinks = [
    {
      label: "LinkedIn",
      tooltip: `@${PersonalData.linkedIn.username}`,
      href: PersonalData.linkedIn.url,
      icon: FiLinkedin,
      color: "app.brand.linkedin.solid",
      isExternal: true,
    },
    {
      label: "GitHub",
      tooltip: `@${PersonalData.github.username}`,
      href: PersonalData.github.url,
      icon: FiGithub,
      color: "app.brand.github.solid",
      isExternal: true,
    },
    {
      label: "X",
      tooltip: `@${PersonalData.x.username}`,
      href: PersonalData.x.url,
      icon: FaXTwitter,
      color: "app.brand.x.solid",
      isExternal: true,
    },
    {
      label: "Instagram",
      tooltip: `@${PersonalData.instagram.username}`,
      href: PersonalData.instagram.url,
      icon: FiInstagram,
      color: "app.brand.instagram.solid",
      isExternal: true,
    },
    {
      label: "Email",
      tooltip: PersonalData.email,
      href: `mailto:${PersonalData.email}`,
      icon: FiMail,
      color: "app.fg.muted",
      isExternal: false,
    },
  ] as const;

  return (
    <Box as="footer" p={[1, 4]} pt={[0, 0.5]} role="contentinfo">
      <HeaderCard>
        <VStack align="stretch" gap={4}>
          <Box px={[3, 5]} py={[3, 4]}>
            <Stack
              direction={["column", "row"]}
              justify="space-between"
              align={["flex-start", "start"]}
              gap={[6, 10]}
            >
              <VStack align="flex-start" gap={2} flex={1} minW={0}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color="app.fg.muted"
                >
                  Connect
                </Text>
                <HStack gap={3}>
                  {socialLinks.map((social) => (
                    <Tooltip
                      key={social.label}
                      content={social.tooltip}
                      showArrow
                    >
                      <Link
                        href={social.href}
                        target={social.isExternal ? "_blank" : undefined}
                        rel={social.isExternal ? "noreferrer" : undefined}
                        aria-label={social.label}
                        color={social.color}
                        _hover={{ opacity: 0.85 }}
                      >
                        <Icon as={social.icon} boxSize={5} />
                      </Link>
                    </Tooltip>
                  ))}
                </HStack>
              </VStack>

              <VStack align="flex-start" gap={2} flex={1} minW={0}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color="app.fg.muted"
                >
                  Navigate
                </Text>
                <Wrap gapX={4} gapY={2}>
                  <WrapItem>
                    <Link
                      href={homepageTabs.home.pathname}
                      {...footerLinkProps}
                    >
                      {homepageTabs.home.name}
                    </Link>
                  </WrapItem>
                  <WrapItem>
                    <Link
                      href={homepageTabs.about.pathname}
                      {...footerLinkProps}
                    >
                      {homepageTabs.about.name}
                    </Link>
                  </WrapItem>
                  <WrapItem>
                    <Link
                      href={homepageTabs.projects.pathname}
                      {...footerLinkProps}
                    >
                      {homepageTabs.projects.name}
                    </Link>
                  </WrapItem>
                  <WrapItem>
                    <Link
                      href={homepageTabs.blogs.pathname}
                      {...footerLinkProps}
                    >
                      {homepageTabs.blogs.name}
                    </Link>
                  </WrapItem>
                  <WrapItem>
                    <Link href={homepageTabs.cv.pathname} {...footerLinkProps}>
                      {homepageTabs.cv.name}
                    </Link>
                  </WrapItem>
                </Wrap>
              </VStack>
            </Stack>
          </Box>

          {hideBottomPart ? null : (
            <Box
              background={"app.bg.cardHeader"}
              borderTopWidth={"2px"}
              borderTopColor={"app.border.default"}
              mx={-4}
              mb={-4}
              px={[4, 6]}
              py={3}
              borderBottomRadius={"2xl"}
            >
              <HStack
                justify={"center"}
                gap={2}
                fontSize={"sm"}
                fontWeight={"normal"}
                color={"app.fg.icon"}
              >
                <Icon
                  as={seasonalArtifact.icon}
                  aria-label={seasonalArtifact.label}
                  boxSize={4}
                />
                <Text as="span">{PersonalData.name.full}</Text>
              </HStack>
            </Box>
          )}
        </VStack>
      </HeaderCard>
    </Box>
  );
}
