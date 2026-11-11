"use client";

import { EmptyState, VStack, Icon } from "@chakra-ui/react";
import {
  FeaturedTile,
  FeedList,
  TitleDescriptionMetaTile,
} from "@components/core/Tiles";
import ContentSection from "@components/page/common/ContentSection";
import { homepageTabs } from "app/route-info";
import BlogsData from "data/blogs";
import type { BlogMeta } from "data/blogs/loader";
import { FiBookmark } from "react-icons/fi";
import { useFeatureFlag } from "utils/features";
import FeatureFlagsData from "data/features";
import { notFound } from "next/navigation";

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
          <EmptyState.Title as="h1" textAlign={"center"}>
            {BlogsData.blogsPage.emptyStateTitle}
          </EmptyState.Title>
        </EmptyState.Content>
      </EmptyState.Root>
    </ContentSection>
  );
}

function BlogsListElement({ blogs }: { blogs: BlogMeta[] }) {
  const [featured, ...remainingBlogs] = blogs;
  if (!featured) return null;

  return (
    <>
      <FeaturedTile
        title={featured.title}
        description={featured.description}
        published={featured.published}
        updated={featured.updated}
        tags={featured.tags}
        url={homepageTabs.blogs.getSubpagePathname(featured.id)}
        actionLabel="Read article"
      />
      {remainingBlogs.length > 0 ? (
        <FeedList>
          {remainingBlogs.map((blog) => (
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
      ) : null}
    </>
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
      <Blogs blogs={blogs} />
    </VStack>
  );
}
