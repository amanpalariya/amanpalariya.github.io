"use client";

import { ClientOnly } from "@chakra-ui/react";
import { BilingualStoryReaderPageView, STORY_READER_TOOL_ID } from "features/story-reader";
import { getToolById, ToolDetailsSection } from "features/tools";

export default function StoryReaderToolPage() {
  const tool = getToolById(STORY_READER_TOOL_ID);

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} /> : null}
      <ClientOnly>
        <BilingualStoryReaderPageView />
      </ClientOnly>
    </>
  );
}

