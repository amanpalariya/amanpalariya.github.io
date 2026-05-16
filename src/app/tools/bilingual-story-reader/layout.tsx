import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { BILINGUAL_STORY_READER_TOOL_ID } from "features/bilingual-story-reader";
import { getToolById } from "features/tools/data/tools-registry";

const bilingualStoryReaderTool = getToolById(BILINGUAL_STORY_READER_TOOL_ID);

export const metadata: Metadata = {
  title: getPageTitle(bilingualStoryReaderTool?.name ?? "Bilingual Story Reader"),
};

export default function BilingualStoryReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

