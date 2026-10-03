"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import { Heading1 } from "@components/core/Texts";
import CopyLinkSecondaryButton from "@components/page/common/CopyLinkSecondaryButton";
import ExternalLinksRow from "@components/page/common/ExternalLinksRow";
import type { ExternalLink } from "data/external-links";
import type { ReactNode } from "react";

export function DetailTitleBar({
  title,
}: {
  title: string;
}) {
  return (
    <Box
      as="header"
      display="grid"
      gridTemplateColumns="minmax(0, 1fr) 32px"
      gap={3}
      alignItems="start"
    >
      <Heading1
        fontSize={{ base: "xl", md: "2xl" }}
        fontWeight={700}
        lineHeight="1.3"
        pt={1}
      >
        {title}
      </Heading1>
      <Box pt={1}>
        <CopyLinkSecondaryButton iconOnly />
      </Box>
    </Box>
  );
}

export function DetailMetaSection({ children }: { children: ReactNode }) {
  return (
    <VStack gap={3} align={"stretch"}>
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
