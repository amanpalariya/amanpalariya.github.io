"use client";

import { ClientOnly } from "@chakra-ui/react";
import { BilingualStoryReaderPageView, BILINGUAL_STORY_READER_TOOL_ID } from "features/bilingual-story-reader";
import { getToolById, ToolDetailsSection } from "features/tools";

export default function BilingualStoryReaderToolPage() {
  const tool = getToolById(BILINGUAL_STORY_READER_TOOL_ID);

  return (
    <>
      {tool ? <ToolDetailsSection tool={tool} /> : null}
      <ClientOnly>
        <BilingualStoryReaderPageView />
      </ClientOnly>
    </>
  );
}

