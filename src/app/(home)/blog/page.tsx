"use client";

import { VStack, Spacer, Box, Icon } from "@chakra-ui/react";
import { Heading1, SectionText, SubtitleText } from "@components/core/Texts";
import { TitleDescriptionAvatarTile } from "@components/core/Tiles";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { homepageTabs } from "app/route-info";
import BlogsData from "data/blog";
import { FiBookmark } from "react-icons/fi";

function Main() {
  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"tall"}>
      <VStack align={"stretch"} gap={5}>
        <SectionText>{homepageTabs.blog.name}</SectionText>
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

function BlogsListElement() {
  return (
    <HighlightedSection>
      <VStack align={"stretch"} gap={4}>
        {BlogsData.allBlogs.map((blog) => (
          <TitleDescriptionAvatarTile
            key={blog.id}
            title={blog.title}
            description={blog.description}
            url={
              blog.content
                ? homepageTabs.blog.getSubpagePathname(blog.id)
                : blog.url
            }
            isUrlExternal={blog.content ? false : true}
          />
        ))}
      </VStack>
    </HighlightedSection>
  );
}

function Blogs() {
  return BlogsData.allBlogs.length != 0 ? BlogsListElement() : NoBlogsElement();
}

export default function Home() {
  return (
    <VStack align={"stretch"}>
      <Main />
      <Blogs />
    </VStack>
  );
}
