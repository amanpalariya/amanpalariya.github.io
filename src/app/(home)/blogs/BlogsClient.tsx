"use client";

import { VStack, Spacer, Box, Icon } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TitleDescriptionAvatarTile } from "@components/core/Tiles";
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
      <VStack align={"center"} gap={4} py={16}>
        <Icon boxSize={20} color={"gray.500"}>
          <FiBookmark />
        </Icon>
        <SubtitleText>{"There are no blogs yet!"}</SubtitleText>
      </VStack>
    </HighlightedSection>
  );
}

function BlogsListElement({ blogs }: { blogs: BlogMeta[] }) {
  return (
    <HighlightedSection>
      <VStack align={"stretch"} gap={4}>
        {blogs.map((blog) => (
          <TitleDescriptionAvatarTile
            key={blog.id}
            title={blog.title}
            description={blog.description}
            url={homepageTabs.blogs.getSubpagePathname(blog.id)}
            isUrlExternal={false}
          />
        ))}
      </VStack>
    </HighlightedSection>
  );
}

function Blogs({ blogs }: { blogs: BlogMeta[] }) {
  return blogs.length != 0 ? (
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