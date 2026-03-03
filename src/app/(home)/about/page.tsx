"use client";

import { Heading1, SectionText } from "@components/core/Texts";
import { homepageTabs } from "app/route-info";
import { Box, Spacer, VStack } from "@chakra-ui/react";
import AboutData from "data/about";
import { renderMarkdownToHtml } from "@utils/markdown";
import { useProseStyles } from "@components/article/proseStyles";
import { useEffect, useState } from "react";

function Main() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    renderMarkdownToHtml(AboutData.markdown).then(setHtml);
  }, []);

  const proseStyles = useProseStyles();
  return (
    <Box m={[4, 6]} letterSpacing={"wide"} lineHeight={"tall"}>
      <VStack align={"stretch"} gap={5}>
        <SectionText>{homepageTabs.about.name}</SectionText>
        <Spacer h={4} />
        <Heading1>{AboutData.aboutPage.title}</Heading1>
        <Box
          className="prose-content"
          css={proseStyles}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </VStack>
    </Box>
  );
}

export default function About() {
  return (
    <VStack align="stretch" gap={8}>
      <Main />
    </VStack>
  );
}
