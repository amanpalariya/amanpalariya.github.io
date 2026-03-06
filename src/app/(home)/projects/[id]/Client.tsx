"use client";

import { VStack, Spacer, HStack, Box, Text } from "@chakra-ui/react";
import { Heading1, LinkText } from "@components/core/Texts";
import { HtmlArticleRenderer } from "@components/article/Renderer";
import CopyLinkSecondaryButton from "@components/page/common/CopyLinkSecondaryButton";

type Project = {
  id: string;
  title: string;
  description: string;
  url?: string;
};

function TitleBar({ title }: { title: string }) {
  return (
    <Box mx={[4, 6]} mt={4} letterSpacing={"wide"}>
      <Heading1>{title}</Heading1>
    </Box>
  );
}

function MetaRow({ description, url }: { description: string; url?: string }) {
  return (
    <HStack
      gap={3}
      px={[4, 6]}
      wrap={"wrap"}
      align={"center"}
      justify={"space-between"}
    >
      <VStack align={"start"} gap={0}>
        <Text fontSize="sm" color="gray.500">
          {description}
        </Text>
        {url ? (
          <Text fontSize="sm" color="gray.500">
            <LinkText href={url} isExternal>
              View project link
            </LinkText>
          </Text>
        ) : null}
      </VStack>
      <Spacer />
      <CopyLinkSecondaryButton />
    </HStack>
  );
}

export default function Client({ html, project }: { html: string; project: Project }) {
  if (!project) return null;

  return (
    <VStack align={"stretch"} gap={4}>
      <TitleBar title={project.title} />
      <MetaRow description={project.description} url={project.url} />
      <HtmlArticleRenderer title={project.title} html={html} showTitle={false} />
    </VStack>
  );
}
