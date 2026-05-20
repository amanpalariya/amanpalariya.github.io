"use client";

import { ClientOnly } from "@chakra-ui/react";
import {
  BilingualStoryReaderHelpButton,
  BilingualStoryReaderStoryRouteView,
  BILINGUAL_STORY_READER_TOOL_ID,
} from "features/bilingual-story-reader";
import { getToolById, ToolDetailsSection } from "features/tools";
import { Suspense } from "react";

export default function BilingualStoryReaderStoryPage() {
  const tool = getToolById(BILINGUAL_STORY_READER_TOOL_ID);

  return (
    <>
      {tool ? (
        <ToolDetailsSection
          tool={tool}
          titleAction={<BilingualStoryReaderHelpButton />}
        />
      ) : null}
      <ClientOnly>
        <Suspense fallback={null}>
          <BilingualStoryReaderStoryRouteView />
        </Suspense>
      </ClientOnly>
    </>
  );
}
