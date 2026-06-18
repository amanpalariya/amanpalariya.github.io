"use client";

import {
  Box,
  Card,
  HStack,
  Icon,
  Popover,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Heading1, Heading2 } from "@components/core/Texts";
import { useState, type ElementType, type KeyboardEvent } from "react";
import {
  LuBookOpen,
  LuClapperboard,
  LuClock,
  LuGraduationCap,
  LuInfo,
  LuLanguages,
  LuListTree,
  LuTriangleAlert,
} from "react-icons/lu";
import type {
  RenderableSentence,
  RenderableStory,
  BilingualStoryReaderWarning,
} from "../domain/validate-story";

function StoryMetadataItem({
  icon,
  tone = "default",
  value,
}: {
  icon: ElementType;
  tone?: "default" | "warning";
  value: string;
}) {
  return (
    <HStack
      as="span"
      bg="app.bilingualStoryReader.metadata.bg"
      borderColor={
        tone === "warning"
          ? "app.bilingualStoryReader.metadata.warningBorder"
          : "app.bilingualStoryReader.metadata.border"
      }
      borderWidth="1px"
      color={
        tone === "warning"
          ? "app.bilingualStoryReader.metadata.warningFg"
          : "app.bilingualStoryReader.metadata.fg"
      }
      gap={1.5}
      minH={8}
      px={2.5}
      rounded="full"
      whiteSpace="nowrap"
    >
      <Icon as={icon} boxSize={3.5} />
      <Text as="span" fontSize="sm" fontWeight="medium">
        {value}
      </Text>
    </HStack>
  );
}

function getLevelLabel(level: string): string {
  if (level === "Beginner") return "Beginner";
  if (/^[ABC][12]$/.test(level)) return `CEFR ${level}`;
  return level;
}

function SentenceHelpContent({ sentence }: { sentence: RenderableSentence }) {
  return (
    <VStack align="stretch" gap={2}>
      <Text
        color="app.bilingualStoryReader.fg.default"
        fontSize="md"
        lineHeight="1.65"
        textAlign="left"
      >
        <Icon
          as={LuLanguages}
          boxSize={4}
          color="app.bilingualStoryReader.fg.accent"
          display="inline"
          me={1.5}
          verticalAlign="-0.15em"
        />
        {sentence.translation}
      </Text>
      {sentence.note ? (
        <Text
          color="app.bilingualStoryReader.fg.muted"
          fontSize="md"
          lineHeight="1.55"
          textAlign="left"
        >
          <Icon
            as={LuInfo}
            boxSize={3.5}
            color="app.bilingualStoryReader.fg.muted"
            display="inline"
            me={1.5}
            verticalAlign="-0.1em"
          />
          {sentence.note}
        </Text>
      ) : null}
    </VStack>
  );
}

function StorySentence({
  sentence,
  isOpen,
  onOpen,
  onClose,
  sentenceNumber,
}: {
  sentence: RenderableSentence;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  sentenceNumber: number;
}) {
  function togglePopover(): void {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    togglePopover();
  }

  return (
    <Popover.Root
      lazyMount
      open={isOpen}
      onOpenChange={(details) => {
        if (details.open) onOpen();
        else onClose();
      }}
      positioning={{ placement: "bottom-start", gutter: 8 }}
      unmountOnExit
    >
      <Popover.Anchor asChild>
        <Box
          aria-label={`${isOpen ? "Close" : "Open"} translation for sentence ${sentenceNumber}`}
          aria-pressed={isOpen}
          as="span"
          bg={isOpen ? "app.bilingualStoryReader.bg.activeSentence" : "transparent"}
          boxShadow={
            isOpen
              ? "inset 0 -2px 0 var(--chakra-colors-app-bilingual-story-reader-border-active-sentence)"
              : "none"
          }
          color="inherit"
          cursor="help"
          display="inline"
          mr={2}
          onClick={togglePopover}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          textAlign="start"
        >
          {sentence.text}
        </Box>
      </Popover.Anchor>
      <Popover.Positioner zIndex={30}>
        <Popover.Content
          bg="app.bilingualStoryReader.bg.popover"
          borderColor="app.bilingualStoryReader.border.default"
          borderWidth="1px"
          maxW="min(420px, calc(100vw - 32px))"
          minW={0}
          p={0}
          rounded="xl"
          shadow="lg"
          w="max-content"
        >
          <Box p={4}>
            <SentenceHelpContent sentence={sentence} />
          </Box>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

export function RenderedStoryView({
  unframed = false,
  hideTitle = false,
  loadedAt,
  story,
  warnings,
}: {
  unframed?: boolean;
  hideTitle?: boolean;
  loadedAt?: string;
  story: RenderableStory;
  warnings: BilingualStoryReaderWarning[];
}) {
  const sentenceCount = story.paragraphs.reduce(
    (count, paragraph) => count + paragraph.sentences.length,
    0,
  );
  const [openSentenceId, setOpenSentenceId] = useState<string | null>(null);
  const loadedDate = loadedAt ? new Date(loadedAt) : null;
  const loadedLabel =
    loadedDate && !Number.isNaN(loadedDate.getTime())
      ? loadedDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;
  const loadedTimeLabel =
    loadedDate && !Number.isNaN(loadedDate.getTime())
      ? loadedDate.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  const metadataPills = (
    <HStack gap={2} wrap="wrap">
      <StoryMetadataItem
        icon={LuLanguages}
        value={`${story.story.knownLanguage} → ${story.story.targetLanguage}`}
      />
      <StoryMetadataItem icon={LuGraduationCap} value={getLevelLabel(story.story.level)} />
      {story.story.theme.trim() ? (
        <StoryMetadataItem icon={LuClapperboard} value={story.story.theme.trim()} />
      ) : null}
      <StoryMetadataItem
        icon={LuBookOpen}
        value={`${story.paragraphs.length} paragraph${
          story.paragraphs.length === 1 ? "" : "s"
        }`}
      />
      <StoryMetadataItem
        icon={LuListTree}
        value={`${sentenceCount} sentence${sentenceCount === 1 ? "" : "s"}`}
      />
      {story.story.estimatedMinutes ? (
        <StoryMetadataItem
          icon={LuClock}
          value={`${story.story.estimatedMinutes} min`}
        />
      ) : null}
      {warnings.length > 0 ? (
        <StoryMetadataItem
          icon={LuTriangleAlert}
          tone="warning"
          value={`${warnings.length} warning${warnings.length === 1 ? "" : "s"}`}
        />
      ) : null}
    </HStack>
  );

  const storyBody = (
    <VStack align="stretch" as="article" gap={0}>
      {story.paragraphs.map((paragraph, paragraphIndex) => (
        <Box key={paragraph.id}>
          <Text
            color="app.fg.muted"
            fontFamily="body"
            fontSize={["19px", "20px"]}
            fontWeight="normal"
            hyphens="auto"
            lineHeight="1.42"
            mb={paragraphIndex === story.paragraphs.length - 1 ? 0 : 7}
            textAlign="justify"
            css={{ WebkitHyphens: "auto", textWrap: "pretty" }}
          >
            {paragraph.sentences.map((sentence, sentenceIndex) => {
              const sentenceNumber =
                story.paragraphs
                  .slice(0, paragraphIndex)
                  .reduce(
                    (count, previousParagraph) =>
                      count + previousParagraph.sentences.length,
                    0,
                  ) +
                sentenceIndex +
                1;
              return (
                <StorySentence
                  isOpen={openSentenceId === sentence.id}
                  key={sentence.id}
                  onClose={() => setOpenSentenceId(null)}
                  onOpen={() => setOpenSentenceId(sentence.id)}
                  sentence={sentence}
                  sentenceNumber={sentenceNumber}
                />
              );
            })}
          </Text>
        </Box>
      ))}
    </VStack>
  );

  if (unframed) {
    return (
      <VStack align="stretch" as="article" gap={4}>
        {hideTitle ? null : (
          <Box as="header" letterSpacing="wide" mt={4} mx={[4, 6]}>
            <Heading1>{story.story.title}</Heading1>
          </Box>
        )}
        {loadedLabel ? (
          <HStack gap={3} px={[4, 6]} fontSize="sm" color="app.fg.muted">
            <Text as="p">
              <time dateTime={loadedDate?.toISOString()}>
                {loadedTimeLabel ? `${loadedLabel}, ${loadedTimeLabel}` : loadedLabel}
              </time>
            </Text>
          </HStack>
        ) : null}
        <HStack gap={3} wrap="wrap" align="center" px={[4, 6]} py={0}>
          {metadataPills}
        </HStack>
        <Box m={[4, 6]}>{storyBody}</Box>
      </VStack>
    );
  }

  return (
    <Card.Root
      bg="app.bilingualStoryReader.bg.card"
      borderColor="app.bilingualStoryReader.border.default"
      overflow="hidden"
      rounded="2xl"
    >
      <Card.Header>
        <VStack align="stretch" gap={3}>
          {hideTitle ? null : <Heading2>{story.story.title}</Heading2>}
          {metadataPills}
        </VStack>
      </Card.Header>
      <Card.Body>{storyBody}</Card.Body>
    </Card.Root>
  );
}
