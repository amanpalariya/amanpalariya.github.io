"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { Heading1 } from "@components/core/Texts";
import CopyLinkSecondaryButton from "@components/page/common/CopyLinkSecondaryButton";
import ExternalLinksRow from "@components/page/common/ExternalLinksRow";
import type { ExternalLink } from "data/external-links";
import type { ReactNode } from "react";

export function DetailTitleBar({ title }: { title: string }) {
  return (
    <Box
      as="header"
      mx={[4, 6]}
      mt={4}
      letterSpacing={"wide"}
      position={"relative"}
    >
      <Box pr={12}>
        <Heading1>{title}</Heading1>
      </Box>
      <Box position={"absolute"} top={0} right={0}>
        <CopyLinkSecondaryButton iconOnly />
      </Box>
    </Box>
  );
}

export function DetailMetaSection({ children }: { children: ReactNode }) {
  return (
    <VStack gap={3} px={[4, 6]} align={"stretch"}>
      {children}
    </VStack>
  );
}

export function DetailDescription({ description }: { description: string }) {
  return (
    <Text fontSize="sm" color="app.fg.muted">
      {description}
    </Text>
  );
}

export function DetailExternalLinks({ links }: { links?: ExternalLink[] }) {
  return <ExternalLinksRow links={links} />;
}
