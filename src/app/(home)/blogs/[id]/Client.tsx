"use client";

import { VStack, Spacer, HStack, Box } from "@chakra-ui/react";
import { Heading1, SectionText } from "@components/core/Texts";
import { homepageTabs } from "app/route-info";
import ArticleRenderer from "@components/article/Renderer";
import { CategoryBadge } from "@components/core/Badges";
import CopyLinkSecondaryButton from "@components/page/common/CopyLinkSecondaryButton";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import BlogsData from "data/blogs";

type Blog = {
  id: string;
  title: string;
  description: string;
  url?: string;
  content?: any[];
  tags?: string[];
};

function TitleBar({ title }: { title: string }) {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"}>
      <VStack align={"stretch"} gap={3}>
        <SectionText>{homepageTabs.blogs.name}</SectionText>
        <Heading1>{title}</Heading1>
      </VStack>
    </Box>
  );
}

function TagRow({ tags = [] as string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <HighlightedSection>
      <HStack gap={2} wrap={"wrap"}>
        {tags.map((t, i) => (
          <CategoryBadge key={i}>{t}</CategoryBadge>
        ))}
        <Spacer />
        <CopyLinkSecondaryButton />
      </HStack>
    </HighlightedSection>
  );
}

export default function Client({ blogId }: { blogId: string }) {
  const [isLoading, isBlogsFeatureEnabled] = useFeatureFlag(
    FeatureFlagsData.featuresIds.BLOGS,
  );
  const blog = BlogsData.allBlogs.find((b) => b.id === blogId);

  if (isLoading) return null;
  if (!isBlogsFeatureEnabled) return null;
  if (!blog || !blog.content) return null;

  return (
    <VStack align={"stretch"} gap={4}>
      <TitleBar title={blog.title} />
      <TagRow tags={blog.tags} />
      <ArticleRenderer title={blog.title} content={blog.content || []} />
    </VStack>
  );
}
