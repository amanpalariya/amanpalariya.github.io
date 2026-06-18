"use client";

import { ClientOnly } from "@chakra-ui/react";
import {
  BilingualStoryReaderStoryRouteView,
} from "features/bilingual-story-reader";
import { Suspense } from "react";

export default function BilingualStoryReaderStoryPage() {
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <BilingualStoryReaderStoryRouteView />
      </Suspense>
    </ClientOnly>
  );
}
