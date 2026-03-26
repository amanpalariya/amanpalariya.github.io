"use client";

import { VStack, HStack, Text } from "@chakra-ui/react";
import { HtmlArticleRenderer } from "@components/article/Renderer";
import { CategoryBadge } from "@components/core/Badges";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import {
  DetailExternalLinks,
  DetailTitleBar,
} from "@components/page/common/DetailPage";
import type { ExternalLink } from "data/external-links";
type Blog = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  published?: string;
  updated?: string;
  externalLinks?: ExternalLink[];
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

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function DateRow({
  published,
  updated,
}: {
  published?: string;
  updated?: string;
}) {
  const publishedDate = parseDate(published);
  const updatedDate = parseDate(updated);
  if (!publishedDate) return null;

  const publishedLabel = formatDate(publishedDate.toISOString());
  const updatedLabel = updatedDate
    ? formatDate(updatedDate.toISOString())
    : null;

  return (
    <HStack gap={3} px={[4, 6]} fontSize="sm" color="app.fg.muted">
      <Text as="p">
        <Text as="time" dateTime={publishedDate.toISOString()} color="app.fg.muted">
          {publishedLabel}
        </Text>
        {updatedDate && updatedLabel ? (
          <Text
            as="time"
            dateTime={updatedDate.toISOString()}
            color="app.fg.muted"
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
    </HStack>
  );
}

function ExternalLinksBlock({ links }: { links?: ExternalLink[] }) {
  if (!links || links.length === 0) return null;

  return (
    <HStack gap={3} px={[4, 6]} wrap={"wrap"} align={"center"}>
      <DetailExternalLinks links={links} />
    </HStack>
  );
}

export default function Client({ html, blog }: { html: string; blog: Blog }) {
  const [isLoading, isBlogsFeatureEnabled] = useFeatureFlag(
    FeatureFlagsData.featuresIds.BLOGS,
  );
  if (isLoading) return null;
  if (!isBlogsFeatureEnabled) return null;
  if (!blog) return null;

  return (
    <VStack as="article" align={"stretch"} gap={4}>
      <DetailTitleBar title={blog.title} />
      <DateRow published={blog.published} updated={blog.updated} />
      <TagRow tags={blog.tags} />
      <ExternalLinksBlock links={blog.externalLinks} />
      <HtmlArticleRenderer title={blog.title} html={html} showTitle={false} />
    </VStack>
  );
}
