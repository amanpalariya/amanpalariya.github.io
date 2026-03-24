"use client";

import { HStack, Text, Wrap, WrapItem, Icon, Link } from "@chakra-ui/react";
import type { ExternalLink } from "data/external-links";
import type { IconType } from "react-icons";
import {
  FiArrowUpRight,
  FiBarChart2,
  FiCode,
  FiDownload,
  FiFileText,
  FiLink,
  FiMail,
  FiMonitor,
  FiPhone,
  FiVideo,
} from "react-icons/fi";
import {
  FaDev,
  FaGithub,
  FaLinkedin,
  FaMedium,
  FaYoutube,
} from "react-icons/fa";

function resolveHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getHostIcon(url: string): IconType | null {
  if (url.startsWith("mailto:")) return FiMail;
  if (url.startsWith("tel:")) return FiPhone;

  const host = resolveHost(url);
  if (!host) return null;

  if (host.includes("github.com")) return FaGithub;
  if (host.includes("youtube.com") || host.includes("youtu.be"))
    return FaYoutube;
  if (host.includes("linkedin.com")) return FaLinkedin;
  if (host.includes("medium.com")) return FaMedium;
  if (host === "dev.to" || host.endsWith(".dev.to")) return FaDev;

  return null;
}

function getKindIcon(kind?: ExternalLink["kind"]): IconType {
  switch (kind) {
    case "code":
      return FiCode;
    case "video":
      return FiVideo;
    case "demo":
      return FiMonitor;
    case "dashboard":
      return FiBarChart2;
    case "article":
    case "slides":
      return FiFileText;
    case "download":
      return FiDownload;
    default:
      return FiLink;
  }
}

function getLinkIcon(link: ExternalLink): IconType {
  return getHostIcon(link.url) ?? getKindIcon(link.kind);
}

export default function ExternalLinksRow({
  links,
  label,
  showLabel = false,
}: {
  links?: ExternalLink[];
  label?: string;
  showLabel?: boolean;
}) {
  if (!links || links.length === 0) return null;

  return (
    <HStack gap={3} align={"center"} wrap={"wrap"}>
      {showLabel && label ? (
        <Text
          fontSize="xs"
          color="app.fg.subtle"
          textTransform="uppercase"
          letterSpacing="0.08em"
        >
          {`${label}:`}
        </Text>
      ) : null}
      <Wrap gap={2}>
        {links.map((link, index) => (
          <WrapItem key={`${link.url}-${index}`}>
            <Link
              href={link.url}
              target="_blank"
              rel="noreferrer"
              display="inline-flex"
              alignItems="center"
              gap={2}
              px={3}
              py={1.5}
              borderWidth="1px"
              borderColor="app.border.default"
              rounded="full"
              bg="app.bg.default"
              color="app.fg.default"
              textDecoration="none"
              fontSize="sm"
              transition="all 0.16s ease"
              _hover={{
                textDecoration: "none",
                borderColor: "app.fg.icon",
                bg: "app.bg.subtle",
                transform: "translateY(-1px)",
              }}
            >
              <Icon as={getLinkIcon(link)} boxSize={3.5} color="app.fg.icon" />
              <Text as="span">{link.label}</Text>
              <Icon as={FiArrowUpRight} boxSize={3.5} color="app.fg.icon" />
            </Link>
          </WrapItem>
        ))}
      </Wrap>
    </HStack>
  );
}
