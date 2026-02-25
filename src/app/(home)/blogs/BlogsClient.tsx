"use client";

import { EmptyState, VStack, Spacer, Box, Icon } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TitleDescriptionMetaTile } from "@components/core/Tiles";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { homepageTabs } from "app/route-info";
import BlogsData from "data/blogs";
import type { BlogMeta } from "data/blogs/loader";
import { FiBookmark } from "react-icons/fi";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import { notFound } from "next/navigation";

function Main() {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"tall"}>
      <VStack align={"stretch"} gap={5}>
        <SectionText>{homepageTabs.blogs.name}</SectionText>
        <Spacer h={4} />
        <Heading1>{BlogsData.blogsPage.title}</Heading1>
        <SubtitleText>{BlogsData.blogsPage.subtitle}</SubtitleText>
      </VStack>
    </Box>
  );
}

function NoBlogsElement() {
  return (
    <HighlightedSection>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <Icon boxSize={12} color={"gray.500"}>
              <FiBookmark />
            </Icon>
          </EmptyState.Indicator>
          <EmptyState.Title>{"There are no blogs yet!"}</EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </HighlightedSection>
  );
}

function BlogsListElement({ blogs }: { blogs: BlogMeta[] }) {
  return (
    <HighlightedSection>
      <VStack align={"stretch"} gap={4}>
        {blogs.map((blog) => (
          <TitleDescriptionMetaTile
            key={blog.id}
            title={blog.title}
            description={blog.description}
            tags={blog.tags}
            published={blog.published}
            updated={blog.updated}
            url={homepageTabs.blogs.getSubpagePathname(blog.id)}
            isUrlExternal={false}
          />
        ))}
      </VStack>
    </HighlightedSection>
  );
}

function Blogs({ blogs }: { blogs: BlogMeta[] }) {
  const [, forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  return blogs.length != 0 && !forceEmptyStates ? (
    <BlogsListElement blogs={blogs} />
  ) : (
    NoBlogsElement()
  );
}

export default function BlogsClient({ blogs }: { blogs: BlogMeta[] }) {
  const [isLoading, isBlogsFeatureEnabled] = useFeatureFlag(
    FeatureFlagsData.featuresIds.BLOGS,
  );

  if (isLoading) {
    return null;
  } else if (!isBlogsFeatureEnabled) {
    return notFound();
  }

  return (
    <VStack align={"stretch"}>
      <Main />
      <Blogs blogs={blogs} />
    </VStack>
  );
}