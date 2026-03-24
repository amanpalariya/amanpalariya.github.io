import {
  HStack,
  VStack,
  Link,
  Icon,
  Wrap,
  WrapItem,
  Text,
} from "@chakra-ui/react";
import { Heading2, ParagraphText } from "@components/core/Texts";
import type { CvProfile } from "data/cv";
import {
  FiMail,
  FiMapPin,
  FiGlobe,
  FiLink,
  FiLinkedin,
  FiGithub,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { Tooltip } from "@components/ui/tooltip";
import { useState } from "react";
import PersonalData from "../../../data/Personal";
import { CV_CMU_FONT_FAMILY } from "./cvStyleTokens";

export default function CvHero({ profile }: { profile: CvProfile }) {
  const secondaryColor = "app.fg.muted";
  const contactTextSize = "19px";
  const [emailCopied, setEmailCopied] = useState(false);

  function getSocialIcon(label: string) {
    const normalized = label.toLowerCase();
    if (normalized.includes("website")) return FiGlobe;
    if (normalized.includes("linkedin")) return FiLinkedin;
    if (normalized.includes("github")) return FiGithub;
    if (normalized === "x") return FaXTwitter;
    return FiLink;
  }

  function getLinkHoverText(label: string, url: string) {
    const normalized = label.toLowerCase();

    if (normalized.includes("website")) return url;
    if (normalized.includes("linkedin"))
      return `@${PersonalData.linkedIn.username}`;
    if (normalized.includes("github"))
      return `@${PersonalData.github.username}`;
    if (normalized === "x") return `@${PersonalData.x.username}`;

    return url;
  }

  async function copyEmail() {
    if (!profile.email || emailCopied) return;
    await navigator.clipboard.writeText(profile.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1200);
  }

  const profileLinks = [
    ...(profile.website ? [{ label: "Website", url: profile.website }] : []),
    ...(profile.links ?? []),
  ];

  return (
    <VStack align={"stretch"} gap={4}>
      <VStack align={"stretch"} gap={2}>
        <Heading2>{profile.name}</Heading2>
        <Text
          fontSize={"19px"}
          color={"app.fg.subtle"}
          fontFamily={CV_CMU_FONT_FAMILY}
        >
          {profile.headline}
        </Text>
      </VStack>
      <VStack align="stretch" gap={2}>
        {profile.location ? (
          <Wrap gap={3} align="center">
            <WrapItem>
              <HStack gap={2} color={secondaryColor}>
                <Icon as={FiMapPin} />
                <Text
                  fontSize={contactTextSize}
                  fontFamily={CV_CMU_FONT_FAMILY}
                  fontWeight="medium"
                >
                  {profile.location}
                </Text>
              </HStack>
            </WrapItem>
          </Wrap>
        ) : null}

        {profile.email ? (
          <Wrap gap={3} align="center">
            <WrapItem>
              <HStack gap={2} color={secondaryColor}>
                <Icon as={FiMail} />
                <Link
                  fontSize={contactTextSize}
                  fontFamily={CV_CMU_FONT_FAMILY}
                  fontWeight="medium"
                  href={`mailto:${profile.email}`}
                >
                  {profile.email}
                </Link>
              </HStack>
            </WrapItem>
            <WrapItem>
              <Tooltip
                content={emailCopied ? "Copied" : "Copy email"}
                showArrow
              >
                <Link
                  as="button"
                  fontSize="17px"
                  color={secondaryColor}
                  fontFamily={CV_CMU_FONT_FAMILY}
                  fontWeight="medium"
                  onClick={() => {
                    void copyEmail();
                  }}
                >
                  <HStack gap={1}>
                    <Icon as={emailCopied ? FiCheck : FiCopy} />
                    <Text>{emailCopied ? "Copied" : "Copy"}</Text>
                  </HStack>
                </Link>
              </Tooltip>
            </WrapItem>
          </Wrap>
        ) : null}

        {profileLinks.length > 0 ? (
          <Wrap gap={3} align="center">
            {profileLinks.map((link, index) => (
              <WrapItem key={link.url}>
                <HStack gap={2} align="center">
                  <Icon as={getSocialIcon(link.label)} color={secondaryColor} />
                  <Tooltip
                    content={getLinkHoverText(link.label, link.url)}
                    showArrow
                  >
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      fontSize={contactTextSize}
                      color={secondaryColor}
                      fontFamily={CV_CMU_FONT_FAMILY}
                      fontWeight="medium"
                    >
                      {link.label}
                    </Link>
                  </Tooltip>
                  {index < profileLinks.length - 1 ? (
                    <Text
                      fontSize={contactTextSize}
                      color={secondaryColor}
                      fontFamily={CV_CMU_FONT_FAMILY}
                      aria-hidden="true"
                    >
                      •
                    </Text>
                  ) : null}
                </HStack>
              </WrapItem>
            ))}
          </Wrap>
        ) : null}
      </VStack>
      <ParagraphText justifyText>{profile.summary}</ParagraphText>
    </VStack>
  );
}
