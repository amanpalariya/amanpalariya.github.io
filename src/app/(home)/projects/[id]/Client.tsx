"use client";

import { VStack } from "@chakra-ui/react";
import { HtmlArticleRenderer } from "@components/article/Renderer";
import {
  DetailDescription,
  DetailExternalLinks,
  DetailMetaSection,
  DetailTitleBar,
} from "@components/page/common/DetailPage";
import type { ExternalLink } from "data/external-links";

type Project = {
  id: string;
  title: string;
  description: string;
  url?: string;
  externalLinks?: ExternalLink[];
};

function MetaRow({
  description,
  externalLinks,
}: {
  description: string;
  externalLinks?: ExternalLink[];
}) {
  return (
    <DetailMetaSection>
      <DetailDescription description={description} />
      <DetailExternalLinks links={externalLinks} />
    </DetailMetaSection>
  );
}

export default function Client({
  html,
  project,
}: {
  html: string;
  project: Project;
}) {
  if (!project) return null;

  return (
    <VStack align={"stretch"} gap={4}>
      <DetailTitleBar title={project.title} />
      <MetaRow
        description={project.description}
        externalLinks={project.externalLinks}
      />
      <HtmlArticleRenderer
        title={project.title}
        html={html}
        showTitle={false}
      />
    </VStack>
  );
}
