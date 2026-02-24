"use client";

import { HtmlArticleRenderer } from "@components/article/Renderer";
import { homepageTabs } from "app/route-info";
import { VStack } from "@chakra-ui/react";
import CvCtaSection from "@components/page/cv/CvCtaSection";
import AboutArticle from "data/about";
import { renderMarkdownToHtml } from "@utils/markdown";

async function Main() {
  const html = await renderMarkdownToHtml(AboutArticle);
  return (
    <HtmlArticleRenderer
      title={homepageTabs.about.name}
      html={html}
      showTitle
    />
  );
}

export default function About() {
  return (
    <VStack align="stretch" gap={8}>
      <Main />
      <CvCtaSection
        title="Need the full CV?"
        description="See a focused timeline of roles, skills, and projects in one place."
      />
    </VStack>
  );
}
