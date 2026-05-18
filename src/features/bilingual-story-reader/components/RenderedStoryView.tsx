"use client";

import {
  Badge,
  Box,
  Card,
  CloseButton,
  HStack,
  Popover,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, type KeyboardEvent } from "react";
import type {
  RenderableSentence,
  RenderableStory,
  BilingualStoryReaderWarning,
} from "../domain/validate-story";

function SentenceHelpContent({ sentence }: { sentence: RenderableSentence }) {
  return (
    <VStack align="stretch" gap={3}>
      <Box>
        <Text fontWeight="medium">Translation</Text>
        <Text color="app.fg.muted" fontSize="sm">
          {sentence.translation}
        </Text>
      </Box>
      {sentence.note ? (
        <Box>
          <Text fontWeight="medium">Note</Text>
          <Text color="app.fg.muted" fontSize="sm">
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
          bg={isOpen ? "bg.subtle" : "transparent"}
          boxShadow={isOpen ? "inset 0 -2px 0 var(--chakra-colors-blue-500)" : "none"}
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
          bg="bg.panel"
          borderColor="border"
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
    <Card.Root>
      <Card.Header>
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" gap={3} wrap="wrap">
            <Box>
              <Card.Title>{story.story.title}</Card.Title>
              <Card.Description>
                {story.story.targetLanguage} from {story.story.knownLanguage} ·{" "}
                {story.story.level}
              </Card.Description>
            </Box>
            <HStack gap={2} wrap="wrap">
              <Badge colorPalette="blue">
                {story.paragraphs.length} paragraph
                {story.paragraphs.length === 1 ? "" : "s"}
              </Badge>
              <Badge colorPalette="gray">
                {sentenceCount} sentence{sentenceCount === 1 ? "" : "s"}
              </Badge>
              {story.story.estimatedMinutes ? (
                <Badge colorPalette="gray">{story.story.estimatedMinutes} min</Badge>
              ) : null}
              {warnings.length > 0 ? (
                <Badge colorPalette="orange">
                  {warnings.length} warning{warnings.length === 1 ? "" : "s"}
                </Badge>
              ) : null}
            </HStack>
          </HStack>
        </VStack>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" as="article" gap={5}>
          {story.paragraphs.map((paragraph, paragraphIndex) => (
            <Box key={paragraph.id}>
              <Text color="app.fg.muted" fontSize="xs" mb={2}>
                Paragraph {paragraphIndex + 1} of {story.paragraphs.length}
              </Text>
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
