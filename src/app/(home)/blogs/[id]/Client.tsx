"use client";

import { VStack, Spacer, HStack, Box, Text } from "@chakra-ui/react";
import { Heading1 } from "@components/core/Texts";
import { HtmlArticleRenderer } from "@components/article/Renderer";
import { CategoryBadge } from "@components/core/Badges";
import CopyLinkSecondaryButton from "@components/page/common/CopyLinkSecondaryButton";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
type Blog = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  published?: string;
  updated?: string;
};

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TitleBar({ title }: { title: string }) {
  return (
    <Box mx={[4, 6]} mt={4} letterSpacing={"wide"}>
      <Heading1>{title}</Heading1>
    </Box>
  );
}

function DateRow({
  published,
  updated,
}: {
  published?: string;
  updated?: string;
}) {
  const publishedLabel = formatDate(published);
  const updatedLabel = formatDate(updated);
  if (!publishedLabel) return null;
  return (
    <HStack gap={3} px={[4, 6]} fontSize="sm" color="gray.500">
      <Text>
        <Text as="span" color="gray.500">
          {publishedLabel}
        </Text>
        {updatedLabel ? (
          <Text
            as="span"
            color="gray.500"
          >{` (updated on ${updatedLabel})`}</Text>
        ) : null}
      </Text>
    </HStack>
  );
}

function TagRow({ tags = [] as string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <HStack gap={3} wrap={"wrap"} align={"center"} px={[4, 6]} py={0}>
      {tags.map((t, i) => (
        <CategoryBadge key={i}>{t}</CategoryBadge>
      ))}
      <Spacer />
      <CopyLinkSecondaryButton />
    </HStack>
  );
}

export default function Client({
  blogId,
  html,
  blog,
}: {
  blogId: string;
  html: string;
  blog: Blog;
}) {
  const [isLoading, isBlogsFeatureEnabled] = useFeatureFlag(
    FeatureFlagsData.featuresIds.BLOGS,
  );
  if (isLoading) return null;
  if (!isBlogsFeatureEnabled) return null;
  if (!blog) return null;

  return (
    <VStack align={"stretch"} gap={4}>
      <TitleBar title={blog.title} />
      <DateRow published={blog.published} updated={blog.updated} />
      <TagRow tags={blog.tags} />
      <HtmlArticleRenderer title={blog.title} html={html} showTitle={false} />
    </VStack>
  );
}
