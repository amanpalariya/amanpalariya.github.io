"use client";

import {
  Box,
  EmptyState,
  Icon,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Heading1 } from "@components/core/Texts";
import WithBackground from "@components/page/wrapper/WithBackground";
import { Tooltip } from "@components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { LuBookOpen, LuTrash2 } from "react-icons/lu";
import {
  removeStoryHistoryEntry,
  readStoryHistory,
  type StoryHistoryEntry,
  writeStoryHistory,
} from "../services/story-history";
import { RenderedStoryView } from "./RenderedStoryView";

const PROMPT_EDITOR_PATH = "/tools/bilingual-story-reader/";

function StoryReaderShell({
  children,
  backLabel = "Prompt Editor",
}: {
  children: ReactNode;
  backLabel?: string;
}) {
  return (
    <WithBackground>
      <Box
        as="main"
        id="main-content"
        tabIndex={-1}
        className="story-reader-main"
      >
        <header className="site-page-navigation story-reader-navigation">
          <NextLink
            href={PROMPT_EDITOR_PATH}
            className="site-back-button"
            aria-label={backLabel}
          >
            <FiChevronLeft size={22} aria-hidden="true" />
          </NextLink>
          <span>Story Reader</span>
        </header>
        <VStack className="site-main-content" align="stretch" gap={0}>
          {children}
        </VStack>
      </Box>
    </WithBackground>
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
    <StoryReaderShell>
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
        </EmptyState.Content>
      </EmptyState.Root>
    </StoryReaderShell>
  );
}

export function BilingualStoryReaderStoryPageView({
  storyId,
}: {
  storyId: string | null;
}) {
  const router = useRouter();
  const [entry, setEntry] = useState<StoryHistoryEntry | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!storyId) {
      setEntry(null);
      setHasLoadedHistory(true);
      return;
    }

    const matchingEntry =
      readStoryHistory().find((historyEntry) => historyEntry.id === storyId) ??
      null;
    setEntry(matchingEntry);
    setHasLoadedHistory(true);
  }, [storyId]);

  useEffect(() => {
    if (!hasLoadedHistory || !storyId || entry) {
      setRedirectCountdown(null);
      return;
    }

    setRedirectCountdown(5);
    const startedAt = Date.now();
    const redirectTimeout = window.setTimeout(() => {
      router.replace(PROMPT_EDITOR_PATH);
    }, 5000);
    const countdownInterval = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const remainingSeconds = Math.max(0, 5 - elapsedSeconds);
      setRedirectCountdown(remainingSeconds);
    }, 250);

    return () => {
      window.clearTimeout(redirectTimeout);
      window.clearInterval(countdownInterval);
    };
  }, [entry, hasLoadedHistory, router, storyId]);

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
    const backLabel = `Go back (${redirectCountdown ?? 5}s)`;

    return (
      <StoryReaderShell backLabel={backLabel}>
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <Icon boxSize={9} color="app.bilingualStoryReader.fg.muted">
                <LuBookOpen />
              </Icon>
            </EmptyState.Indicator>
            <EmptyState.Title textAlign="center">
              Story not found
            </EmptyState.Title>
            <Text color="app.fg.subtle" fontSize="sm">
              Returning to the prompt editor in {redirectCountdown ?? 5}s.
            </Text>
          </EmptyState.Content>
        </EmptyState.Root>
      </StoryReaderShell>
    );
  }

  function deleteCurrentStory(): void {
    if (!entry) return;
    const nextHistory = removeStoryHistoryEntry(readStoryHistory(), entry.id);
    writeStoryHistory(nextHistory);
    router.replace(PROMPT_EDITOR_PATH);
  }

  return (
    <StoryReaderShell>
      <Box as="header" letterSpacing="wide" mb={4} position="relative">
        <Box pr={12}>
          <Heading1>{entry.story.story.title}</Heading1>
        </Box>
        <Box position="absolute" right={0} top={0}>
          <Tooltip content="Delete this story">
            <IconButton
              aria-label="Delete story"
              rounded="full"
              colorPalette="red"
              onClick={deleteCurrentStory}
              variant="ghost"
            >
              <LuTrash2 />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <RenderedStoryView
        hideTitle
        loadedAt={entry.loadedAt}
        unframed
        story={entry.story}
        warnings={[]}
      />
    </StoryReaderShell>
  );
}

export function BilingualStoryReaderStoryRouteView() {
  const searchParams = useSearchParams();
  return <BilingualStoryReaderStoryPageView storyId={searchParams.get("id")} />;
}
