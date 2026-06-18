"use client";

import {
  Box,
  Button,
  EmptyState,
  HStack,
  Icon,
  IconButton,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { HeaderCard } from "@components/core/Cards";
import { Heading1, Heading2 } from "@components/core/Texts";
import {
  ColorModeToggleIconButton,
  HEADER_OFFSET_HEIGHT,
} from "@components/page/common/Header";
import HeaderNavIconButton from "@components/page/common/header/HeaderNavIconButton";
import WithBackground from "@components/page/wrapper/WithBackground";
import WithBodyCard from "@components/page/wrapper/WithBodyCard";
import { Tooltip } from "@components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { useEffect, useState } from "react";
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
  const router = useRouter();
  const [entry, setEntry] = useState<StoryHistoryEntry | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

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
            <EmptyState.Root>
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <Icon boxSize={9} color="app.bilingualStoryReader.fg.muted">
                    <LuBookOpen />
                  </Icon>
                </EmptyState.Indicator>
                <EmptyState.Title textAlign="center">Story not found</EmptyState.Title>
                <Button asChild variant="ghost" rounded="xl" fontFamily="ui">
                  <NextLink href={PROMPT_EDITOR_PATH}>
                    <Icon as={FiChevronLeft} />
                    {backLabel}
                  </NextLink>
                </Button>
              </EmptyState.Content>
            </EmptyState.Root>
          </WithBodyCard>
        </>
      </WithBackground>
    );
  }

  function deleteCurrentStory(): void {
    if (!entry) return;
    const nextHistory = removeStoryHistoryEntry(readStoryHistory(), entry.id);
    writeStoryHistory(nextHistory);
    router.replace(PROMPT_EDITOR_PATH);
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
          <Box
            as="header"
            letterSpacing="wide"
            mt={4}
            mx={[4, 6]}
            position="relative"
          >
            <Box pr={12}>
              <Heading1>{entry.story.story.title}</Heading1>
            </Box>
            <Box position="absolute" right={0} top={0}>
              <Tooltip content="Delete this story">
                <IconButton
                  aria-label="Delete story"
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
        </WithBodyCard>
      </>
    </WithBackground>
  );
}

export function BilingualStoryReaderStoryRouteView() {
  const searchParams = useSearchParams();
  return <BilingualStoryReaderStoryPageView storyId={searchParams.get("id")} />;
}
