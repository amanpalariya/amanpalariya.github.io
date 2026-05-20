"use client";

import { Box, Button, EmptyState, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuBookOpen } from "react-icons/lu";
import {
  readStoryHistory,
  type StoryHistoryEntry,
} from "../services/story-history";
import { RenderedStoryView } from "./RenderedStoryView";

const PROMPT_EDITOR_PATH = "/tools/bilingual-story-reader/";

function PromptEditorButton() {
  return (
    <Button
      asChild
      bg="app.bilingualStoryReader.button.subtle.bg"
      color="app.bilingualStoryReader.button.subtle.fg"
      fontFamily="ui"
      fontSize="sm"
      rounded="xl"
      _hover={{ bg: "app.bilingualStoryReader.button.subtle.hoverBg" }}
    >
      <NextLink href={PROMPT_EDITOR_PATH}>
        <Icon as={LuArrowLeft} />
        Prompt Editor
      </NextLink>
    </Button>
  );
}

function MissingStoryState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <HighlightedSection contentPx={{ base: 3, md: 4 }} contentPy={{ base: 3, md: 4 }}>
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
          <PromptEditorButton />
        </EmptyState.Content>
      </EmptyState.Root>
    </HighlightedSection>
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
    <VStack align="stretch" gap={4} pt={4} pb={0}>
      <Box w="full" px={[4, 6]}>
        <HStack justify="space-between" wrap="wrap">
          <PromptEditorButton />
          <Text color="app.bilingualStoryReader.fg.muted" fontSize="sm">
            Saved {new Date(entry.loadedAt).toLocaleString()}
          </Text>
        </HStack>
      </Box>
      <HighlightedSection contentPx={{ base: 3, md: 4 }} contentPy={{ base: 3, md: 4 }}>
        <RenderedStoryView setup={entry.setup} story={entry.story} warnings={[]} />
      </HighlightedSection>
    </VStack>
  );
}

export function BilingualStoryReaderStoryRouteView() {
  const searchParams = useSearchParams();
  return <BilingualStoryReaderStoryPageView storyId={searchParams.get("id")} />;
}
