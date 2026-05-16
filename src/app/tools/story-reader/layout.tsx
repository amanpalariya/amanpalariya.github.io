import type { Metadata } from "next";
import { getPageTitle } from "app/metadata";
import { STORY_READER_TOOL_ID } from "features/story-reader";
import { getToolById } from "features/tools/data/tools-registry";

const storyReaderTool = getToolById(STORY_READER_TOOL_ID);

export const metadata: Metadata = {
  title: getPageTitle(storyReaderTool?.name ?? "Bilingual Story Reader"),
};

export default function StoryReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

