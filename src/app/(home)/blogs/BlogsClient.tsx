"use client";

import { EmptyState, VStack, Icon } from "@chakra-ui/react";
import PageIntro from "@components/page/common/PageIntro";
import { FeedList, TitleDescriptionMetaTile } from "@components/core/Tiles";
import ContentSection from "@components/page/common/ContentSection";
import { homepageTabs } from "app/route-info";
import BlogsData from "data/blogs";
import type { BlogMeta } from "data/blogs/loader";
import { FiBookmark } from "react-icons/fi";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import { notFound } from "next/navigation";

function Main() {
  return (
    <PageIntro
      title={BlogsData.blogsPage.title}
      subtitle={BlogsData.blogsPage.subtitle}
    />
  );
}

function NoBlogsElement() {
  return (
    <ContentSection borderTop={0}>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <Icon boxSize={12} color={"gray.500"}>
              <FiBookmark />
            </Icon>
          </EmptyState.Indicator>
          <EmptyState.Title textAlign={"center"}>
            {BlogsData.blogsPage.emptyStateTitle}
          </EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </ContentSection>
  );
}

function BlogsListElement({ blogs }: { blogs: BlogMeta[] }) {
  return (
    <FeedList>
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
    </FeedList>
  );
}

function Blogs({ blogs }: { blogs: BlogMeta[] }) {
  const [forceEmptyStates] = useFeatureFlag(
    FeatureFlagsData.featuresIds.FORCE_EMPTY_STATES,
  );

  return blogs.length != 0 && !forceEmptyStates ? (
    <BlogsListElement blogs={blogs} />
  ) : (
    NoBlogsElement()
  );
}

export default function BlogsClient({ blogs }: { blogs: BlogMeta[] }) {
  const [isBlogsFeatureEnabled] = useFeatureFlag(
    FeatureFlagsData.featuresIds.BLOGS,
  );

  if (!isBlogsFeatureEnabled) {
    return notFound();
  }

  return (
    <VStack align="stretch" gap={0}>
      <Main />
      <Blogs blogs={blogs} />
    </VStack>
  );
}
