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
import { MainCard } from "@components/core/Cards";
import { homepageTabs } from "app/route-info";
import { PersonalData } from "data";
import { FiGithub, FiInstagram, FiLinkedin, FiMail } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

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

export default function Footer() {
  return (
    <Box as="footer" p={[1, 4]} pt={[0, 0.5]} role="contentinfo">
      <MainCard>
        <VStack align="stretch" gap={4}>
          <Box px={[1, 2]} pt={1}>
            <Stack
              direction={["column", "row"]}
              justify="space-between"
              align={["flex-start", "start"]}
              gap={[4, 6]}
            >
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
                    <Link href={homepageTabs.home.pathname} {...footerLinkProps}>
                      {homepageTabs.home.name}
                    </Link>
                  </WrapItem>
                  <WrapItem>
                    <Link href={homepageTabs.about.pathname} {...footerLinkProps}>
                      {homepageTabs.about.name}
                    </Link>
                  </WrapItem>
                  <WrapItem>
                    <Link href={homepageTabs.projects.pathname} {...footerLinkProps}>
                      {homepageTabs.projects.name}
                    </Link>
                  </WrapItem>
                  <WrapItem>
                    <Link href={homepageTabs.blogs.pathname} {...footerLinkProps}>
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
                  <Link href={PersonalData.linkedIn.url} target="_blank" rel="noreferrer" aria-label="LinkedIn" color="app.fg.subtle" _hover={{ color: "app.fg.default" }}>
                    <Icon as={FiLinkedin} boxSize={5} />
                  </Link>
                  <Link href={PersonalData.github.url} target="_blank" rel="noreferrer" aria-label="GitHub" color="app.fg.subtle" _hover={{ color: "app.fg.default" }}>
                    <Icon as={FiGithub} boxSize={5} />
                  </Link>
                  <Link href={PersonalData.x.url} target="_blank" rel="noreferrer" aria-label="X" color="app.fg.subtle" _hover={{ color: "app.fg.default" }}>
                    <Icon as={FaXTwitter} boxSize={5} />
                  </Link>
                  <Link href={PersonalData.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram" color="app.fg.subtle" _hover={{ color: "app.fg.default" }}>
                    <Icon as={FiInstagram} boxSize={5} />
                  </Link>
                  <Link href={`mailto:${PersonalData.email}`} aria-label="Email" color="app.fg.subtle" _hover={{ color: "app.fg.default" }}>
                    <Icon as={FiMail} boxSize={5} />
                  </Link>
                </HStack>
              </VStack>
            </Stack>
          </Box>

          <Box
            background={"app.bg.cardHeader"}
            borderTopWidth={"2px"}
            borderTopColor={"app.border.default"}
            mx={[-2, -4]}
            mb={-4}
            px={[4, 6]}
            py={3}
            borderBottomRadius={"2xl"}
          >
            <Text
              fontSize={"sm"}
              fontWeight={"normal"}
              color={"app.fg.subtle"}
              textAlign={"center"}
            >
              {PersonalData.name.full}
            </Text>
          </Box>
        </VStack>
      </MainCard>
    </Box>
  );
}
