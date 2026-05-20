"use client";

import { Box, EmptyState, HStack, Icon, Spacer, Text } from "@chakra-ui/react";
import { HeaderCard } from "@components/core/Cards";
import { Heading2 } from "@components/core/Texts";
import {
  ColorModeToggleIconButton,
  HEADER_OFFSET_HEIGHT,
} from "@components/page/common/Header";
import HeaderNavIconButton from "@components/page/common/header/HeaderNavIconButton";
import WithBackground from "@components/page/wrapper/WithBackground";
import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { LuBookOpen } from "react-icons/lu";
import {
  readStoryHistory,
  type StoryHistoryEntry,
} from "../services/story-history";
import { RenderedStoryView } from "./RenderedStoryView";

const PROMPT_EDITOR_PATH = "/tools/bilingual-story-reader/";

function MissingStoryState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <WithBackground>
      <WithBodyCard>
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <Icon boxSize={9} color="app.bilingualStoryReader.fg.muted">
                <LuBookOpen />
              </Icon>
            </EmptyState.Indicator>
            <EmptyState.Title textAlign="center">{title}</EmptyState.Title>
            <Text
              color="app.bilingualStoryReader.fg.muted"
              fontFamily="ui"
              fontSize="sm"
              textAlign="center"
            >
              {message}
            </Text>
            <HeaderNavIconButton
              icon={FiChevronLeft}
              label="Prompt Editor"
              url={PROMPT_EDITOR_PATH}
            />
          </EmptyState.Content>
        </EmptyState.Root>
      </WithBodyCard>
    </WithBackground>
  );
}

export function BilingualStoryReaderStoryPageView({
  storyId,
}: {
  storyId: string | null;
}) {
  const [entry, setEntry] = useState<StoryHistoryEntry | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  useEffect(() => {
    if (!storyId) {
      setEntry(null);
      setHasLoadedHistory(true);
      return;
    }

    const matchingEntry =
      readStoryHistory().find((historyEntry) => historyEntry.id === storyId) ?? null;
    setEntry(matchingEntry);
    setHasLoadedHistory(true);
  }, [storyId]);

  if (!storyId) {
    return (
      <MissingStoryState
        title="Story link is missing"
        message="Open a saved story from your story history."
      />
    );
  }

  if (!hasLoadedHistory) {
    return null;
  }

  if (!entry) {
    return (
      <MissingStoryState
        title="Story not found"
        message="This story is not available in this browser's saved history."
      />
    );
  }

  return (
    <WithBackground>
      <>
        <Box
          as="header"
          role="banner"
          position="fixed"
          width="100%"
          maxW="3xl"
          left="50%"
          transform="translateX(-50%)"
          zIndex={10}
        >
          <Box p={[1, 4]}>
            <HeaderCard>
              <HStack align="center" justify="space-between">
                <HStack gap={4} minW={0}>
                  <HeaderNavIconButton
                    icon={FiChevronLeft}
                    label="Prompt Editor"
                    url={PROMPT_EDITOR_PATH}
                  />
                <Heading2 lineClamp={1}>Story Reader</Heading2>
                </HStack>
                <ColorModeToggleIconButton />
              </HStack>
            </HeaderCard>
          </Box>
        </Box>
        <Spacer h={HEADER_OFFSET_HEIGHT} />
        <WithBodyCard containerProps={{ pt: { base: 4, sm: 2 } }}>
          <RenderedStoryView
            loadedAt={entry.loadedAt}
            unframed
            setup={entry.setup}
            story={entry.story}
            warnings={[]}
          />
        </WithBodyCard>
      </>
    </WithBackground>
  );
}

export function BilingualStoryReaderStoryRouteView() {
  const searchParams = useSearchParams();
  return <BilingualStoryReaderStoryPageView storyId={searchParams.get("id")} />;
}
