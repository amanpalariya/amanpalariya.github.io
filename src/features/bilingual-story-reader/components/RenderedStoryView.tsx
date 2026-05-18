"use client";

import {
  Box,
  Card,
  CloseButton,
  HStack,
  Icon,
  Popover,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, type ElementType, type KeyboardEvent } from "react";
import {
  LuBookOpen,
  LuClock,
  LuGauge,
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

function SentenceHelpContent({ sentence }: { sentence: RenderableSentence }) {
  return (
    <VStack align="stretch" gap={3}>
      <Box>
        <Text fontWeight="medium">Translation</Text>
        <Text color="app.bilingualStoryReader.fg.muted" fontSize="sm">
          {sentence.translation}
        </Text>
      </Box>
      {sentence.note ? (
        <Box>
          <Text fontWeight="medium">Note</Text>
          <Text color="app.bilingualStoryReader.fg.muted" fontSize="sm">
            {sentence.note}
          </Text>
        </Box>
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
  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen();
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
          aria-label={`Open translation for sentence ${sentenceNumber}`}
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
          onClick={onOpen}
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
          maxW="min(360px, calc(100vw - 32px))"
          p={0}
          rounded="md"
          shadow="lg"
        >
          <VStack align="stretch" gap={3} p={4}>
            <HStack align="start" justify="space-between">
              <Text fontWeight="semibold">Sentence Translation</Text>
              <CloseButton
                aria-label="Close sentence help"
                size="sm"
                onClick={onClose}
              />
            </HStack>
            <SentenceHelpContent sentence={sentence} />
          </VStack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

export function RenderedStoryView({
  story,
  warnings,
}: {
  story: RenderableStory;
  warnings: BilingualStoryReaderWarning[];
}) {
  const sentenceCount = story.paragraphs.reduce(
    (count, paragraph) => count + paragraph.sentences.length,
    0,
  );
  const [openSentenceId, setOpenSentenceId] = useState<string | null>(null);

  return (
    <Card.Root
      bg="app.bilingualStoryReader.bg.card"
      borderColor="app.bilingualStoryReader.border.default"
      overflow="hidden"
      rounded="2xl"
    >
      <Card.Header>
        <VStack align="stretch" gap={3}>
          <Card.Title>{story.story.title}</Card.Title>
          <HStack gap={2} wrap="wrap">
            <StoryMetadataItem
              icon={LuLanguages}
              value={`${story.story.targetLanguage} from ${story.story.knownLanguage}`}
            />
            <StoryMetadataItem icon={LuGauge} value={story.story.level} />
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
        </VStack>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" as="article" gap={5}>
          {story.paragraphs.map((paragraph, paragraphIndex) => (
            <Box key={paragraph.id}>
              <Text fontSize="lg" lineHeight="1.9">
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
      </Card.Body>
    </Card.Root>
  );
}
