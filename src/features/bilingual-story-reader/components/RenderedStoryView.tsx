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
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  RenderableParagraph,
  RenderableSegment,
  RenderableSentence,
  RenderableStory,
  BilingualStoryReaderWarning,
} from "../domain/validate-story";

type HelpSelection =
  | { type: "sentence"; id: string }
  | { type: "paragraph"; id: string }
  | { type: "segment"; sentenceId: string; index: number };

const CLICK_DELAY_MS = 180;

function textFromUnknown(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const recordValue = record[key];
  return typeof recordValue === "string" && recordValue.trim() ? recordValue : null;
}

function hasWhyItWorks(sentence: RenderableSentence): boolean {
  return (
    sentence.grammarNotes.length > 0 ||
    sentence.usageNotes.length > 0 ||
    sentence.commonMistakes.length > 0 ||
    sentence.wordByWord.length > 0
  );
}

function hasParagraphHelp(paragraph: RenderableParagraph): boolean {
  return Boolean(
    paragraph.question ||
      paragraph.keyPoint ||
      paragraph.summary ||
      paragraph.answer,
  );
}

function isSameHelpSelection(
  current: HelpSelection | null,
  next: HelpSelection,
): boolean {
  if (!current || current.type !== next.type) return false;
  if (current.type === "segment" && next.type === "segment") {
    return current.sentenceId === next.sentenceId && current.index === next.index;
  }
  if (current.type !== "segment" && next.type !== "segment") {
    return current.id === next.id;
  }
  return false;
}

function segmentSummary(segment: RenderableSegment): string {
  return (
    segment.meaning ??
    segment.hint ??
    segment.lemma ??
    segment.partOfSpeech ??
    "Help is available for this part."
  );
}

function PopoverShell({
  title,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
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
            <Text fontWeight="semibold">{title}</Text>
            <CloseButton aria-label={closeLabel} size="sm" onClick={onClose} />
          </HStack>
          {children}
        </VStack>
      </Popover.Content>
    </Popover.Positioner>
  );
}

function SentenceHelpContent({ sentence }: { sentence: RenderableSentence }) {
  return (
    <>
      <Text color="app.fg.muted" fontSize="sm">
        {sentence.text}
      </Text>
      <VStack align="stretch" gap={3}>
        {sentence.clue ? (
          <Box>
            <Text fontWeight="medium">Clue</Text>
            <Text color="app.fg.muted" fontSize="sm">
              {sentence.clue}
            </Text>
          </Box>
        ) : null}

        {sentence.meaning ? (
          <Box>
            <Text fontWeight="medium">Meaning</Text>
            <Text color="app.fg.muted" fontSize="sm">
              {sentence.meaning}
            </Text>
          </Box>
        ) : null}

        <Box>
          <Text fontWeight="medium">Translation</Text>
          <Text color="app.fg.muted" fontSize="sm">
            {sentence.naturalTranslation}
          </Text>
          {sentence.literalTranslation ? (
            <Text color="app.fg.subtle" fontSize="sm" mt={1}>
              Literal: {sentence.literalTranslation}
            </Text>
          ) : null}
        </Box>

        {hasWhyItWorks(sentence) ? (
          <VStack align="stretch" gap={3}>
            <Text fontWeight="medium">Why it works</Text>
            {sentence.grammarNotes.map((note, index) => (
              <Box key={`grammar-${index}`}>
                <Text fontSize="sm" fontWeight="medium">
                  {textFromUnknown(note, "topic") ?? "Grammar"}
                </Text>
                <Text color="app.fg.muted" fontSize="sm">
                  {textFromUnknown(note, "explanation") ??
                    textFromUnknown(note, "whyUsedHere") ??
                    "Grammar note provided."}
                </Text>
              </Box>
            ))}
            {sentence.usageNotes.map((note, index) => (
              <Box key={`usage-${index}`}>
                <Text fontSize="sm" fontWeight="medium">
                  {textFromUnknown(note, "topic") ?? "Usage"}
                </Text>
                <Text color="app.fg.muted" fontSize="sm">
                  {textFromUnknown(note, "explanation") ?? "Usage note provided."}
                </Text>
              </Box>
            ))}
            {sentence.commonMistakes.map((mistake, index) => (
              <Box key={`mistake-${index}`}>
                <Text fontSize="sm" fontWeight="medium">
                  Common mistake
                </Text>
                <Text color="app.fg.muted" fontSize="sm">
                  {textFromUnknown(mistake, "mistake") ?? "Mistake"} →{" "}
                  {textFromUnknown(mistake, "correction") ?? "Correction"}
                </Text>
              </Box>
            ))}
            {sentence.wordByWord.length > 0 ? (
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  Word by word
                </Text>
                <VStack align="stretch" gap={1} mt={1}>
                  {sentence.wordByWord.map((part, index) => (
                    <Text color="app.fg.muted" fontSize="sm" key={`word-${index}`}>
                      {textFromUnknown(part, "text") ?? "?"}:{" "}
                      {textFromUnknown(part, "meaning") ?? "?"}
                    </Text>
                  ))}
                </VStack>
              </Box>
            ) : null}
          </VStack>
        ) : null}
      </VStack>
    </>
  );
}

function SegmentHelpContent({ segment }: { segment: RenderableSegment }) {
  return (
    <VStack align="stretch" gap={3}>
      <Text color="app.fg.muted" fontSize="sm">
        {segmentSummary(segment)}
      </Text>
      {segment.lemma ? (
        <Box>
          <Text fontWeight="medium">Lemma</Text>
          <Text color="app.fg.muted" fontSize="sm">
            {segment.lemma}
          </Text>
        </Box>
      ) : null}
      {segment.partOfSpeech ? (
        <Box>
          <Text fontWeight="medium">Part of speech</Text>
          <Text color="app.fg.muted" fontSize="sm">
            {segment.partOfSpeech}
          </Text>
        </Box>
      ) : null}
      {segment.romanization || segment.pronunciation ? (
        <Box>
          <Text fontWeight="medium">Sound</Text>
          {segment.romanization ? (
            <Text color="app.fg.muted" fontSize="sm">
              Romanization: {segment.romanization}
            </Text>
          ) : null}
          {segment.pronunciation ? (
            <Text color="app.fg.muted" fontSize="sm">
              Pronunciation: {segment.pronunciation}
            </Text>
          ) : null}
        </Box>
      ) : null}
      {segment.wordBreakdown || segment.scriptNote ? (
        <Box>
          <Text fontWeight="medium">Note</Text>
          {segment.wordBreakdown ? (
            <Text color="app.fg.muted" fontSize="sm">
              {segment.wordBreakdown}
            </Text>
          ) : null}
          {segment.scriptNote ? (
            <Text color="app.fg.muted" fontSize="sm">
              {segment.scriptNote}
            </Text>
          ) : null}
        </Box>
      ) : null}
    </VStack>
  );
}

function ParagraphHelpContent({ paragraph }: { paragraph: RenderableParagraph }) {
  return (
    <VStack align="stretch" gap={3}>
      {paragraph.question ? (
        <Box>
          <Text fontWeight="medium">Question</Text>
          <Text color="app.fg.muted" fontSize="sm">
            {paragraph.question}
          </Text>
        </Box>
      ) : null}
      {paragraph.keyPoint ? (
        <Box>
          <Text fontWeight="medium">Key point</Text>
          <Text color="app.fg.muted" fontSize="sm">
            {paragraph.keyPoint}
          </Text>
        </Box>
      ) : null}
      {paragraph.summary ? (
        <Box>
          <Text fontWeight="medium">Summary</Text>
          <Text color="app.fg.muted" fontSize="sm">
            {paragraph.summary}
          </Text>
        </Box>
      ) : null}
      {paragraph.answer ? (
        <Box>
          <Text fontWeight="medium">Answer</Text>
          <Text color="app.fg.muted" fontSize="sm">
            {paragraph.answer}
          </Text>
        </Box>
      ) : null}
    </VStack>
  );
}

function SegmentText({
  sentence,
  segment,
  index,
  helpSelection,
  setHelpSelection,
}: {
  sentence: RenderableSentence;
  segment: RenderableSegment;
  index: number;
  helpSelection: HelpSelection | null;
  setHelpSelection: (selection: HelpSelection | null) => void;
}) {
  const selection = { type: "segment", sentenceId: sentence.id, index } as const;
  const sentenceSelection = { type: "sentence", id: sentence.id } as const;
  const isOpen = isSameHelpSelection(helpSelection, selection);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  if (!segment.kind) return <span>{segment.text}</span>;

  function clearClickTimer(): void {
    if (!clickTimerRef.current) return;
    window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = null;
  }

  function openSegmentHelp(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation();
    clearClickTimer();
    clickTimerRef.current = setTimeout(() => {
      setHelpSelection(selection);
      clickTimerRef.current = null;
    }, CLICK_DELAY_MS);
  }

  function openSentenceHelp(event: MouseEvent<HTMLElement>): void {
    event.preventDefault();
    event.stopPropagation();
    clearClickTimer();
    setHelpSelection(sentenceSelection);
  }

  function openKeyboardSegmentHelp(event: KeyboardEvent<HTMLElement>): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    clearClickTimer();
    setHelpSelection(selection);
  }

  return (
    <Popover.Root
      lazyMount
      open={isOpen}
      onOpenChange={(details) => setHelpSelection(details.open ? selection : null)}
      positioning={{ placement: "top", gutter: 8 }}
      unmountOnExit
    >
      <Popover.Anchor asChild>
        <Box
          aria-label={`${segment.text} help`}
          as="span"
          borderBottom="1px dotted"
          borderColor={isOpen ? "blue.500" : "app.fg.subtle"}
          cursor="help"
          onClick={openSegmentHelp}
          onDoubleClick={openSentenceHelp}
          onKeyDown={openKeyboardSegmentHelp}
          role="button"
          tabIndex={0}
        >
          {segment.text}
        </Box>
      </Popover.Anchor>
      <PopoverShell
        closeLabel="Close word help"
        onClose={() => setHelpSelection(null)}
        title={segment.text}
      >
        <SegmentHelpContent segment={segment} />
      </PopoverShell>
    </Popover.Root>
  );
}

function SentenceText({
  sentence,
  helpSelection,
  setHelpSelection,
}: {
  sentence: RenderableSentence;
  helpSelection: HelpSelection | null;
  setHelpSelection: (selection: HelpSelection | null) => void;
}) {
  if (!sentence.hasValidSegments) return <>{sentence.text}</>;

  return (
    <>
      {sentence.segments.map((segment, index) => (
        <SegmentText
          helpSelection={helpSelection}
          index={index}
          key={`${sentence.id}-${index}-${segment.text}`}
          segment={segment}
          sentence={sentence}
          setHelpSelection={setHelpSelection}
        />
      ))}
    </>
  );
}

function StorySentence({
  sentence,
  helpSelection,
  setHelpSelection,
}: {
  sentence: RenderableSentence;
  helpSelection: HelpSelection | null;
  setHelpSelection: (selection: HelpSelection | null) => void;
}) {
  const selection = { type: "sentence", id: sentence.id } as const;
  const isOpen = isSameHelpSelection(helpSelection, selection);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  function clearClickTimer(): void {
    if (!clickTimerRef.current) return;
    window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = null;
  }

  function openSentenceHelp(): void {
    clearClickTimer();
    setHelpSelection(selection);
  }

  function handleSentenceClick(): void {
    clearClickTimer();
    clickTimerRef.current = setTimeout(() => {
      setHelpSelection(selection);
      clickTimerRef.current = null;
    }, CLICK_DELAY_MS);
  }

  return (
    <Popover.Root
      lazyMount
      open={isOpen}
      onOpenChange={(details) => setHelpSelection(details.open ? selection : null)}
      positioning={{ placement: "bottom-start", gutter: 8 }}
      unmountOnExit
    >
      <Popover.Anchor asChild>
        <Box
          aria-label={`${sentence.text} sentence help`}
          aria-pressed={isOpen}
          as="span"
          bg={isOpen ? "bg.subtle" : "transparent"}
          boxShadow={isOpen ? "inset 0 -2px 0 var(--chakra-colors-blue-500)" : "none"}
          color="inherit"
          cursor="help"
          display="inline"
          mr={2}
          onClick={handleSentenceClick}
          onDoubleClick={(event) => {
            event.preventDefault();
            openSentenceHelp();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openSentenceHelp();
            }
          }}
          role="button"
          tabIndex={0}
          textAlign="start"
        >
          <SentenceText
            helpSelection={helpSelection}
            sentence={sentence}
            setHelpSelection={setHelpSelection}
          />
        </Box>
      </Popover.Anchor>
      <PopoverShell
        closeLabel="Close sentence help"
        onClose={() => setHelpSelection(null)}
        title="Sentence Help"
      >
        <SentenceHelpContent sentence={sentence} />
      </PopoverShell>
    </Popover.Root>
  );
}

function ParagraphHelp({
  paragraph,
  helpSelection,
  setHelpSelection,
}: {
  paragraph: RenderableParagraph;
  helpSelection: HelpSelection | null;
  setHelpSelection: (selection: HelpSelection | null) => void;
}) {
  const selection = { type: "paragraph", id: paragraph.id } as const;
  const isOpen = isSameHelpSelection(helpSelection, selection);

  return (
    <Popover.Root
      lazyMount
      open={isOpen}
      onOpenChange={(details) => setHelpSelection(details.open ? selection : null)}
      positioning={{ placement: "bottom-start", gutter: 8 }}
      unmountOnExit
    >
      <Popover.Trigger asChild>
        <Box
          aria-label="Check paragraph"
          as="button"
          bg={isOpen ? "bg.subtle" : "transparent"}
          borderColor="border"
          borderWidth="1px"
          color="inherit"
          cursor="help"
          fontSize="sm"
          mt={3}
          px={3}
          py={1.5}
          rounded="md"
        >
          Check paragraph
        </Box>
      </Popover.Trigger>
      <PopoverShell
        closeLabel="Close paragraph check"
        onClose={() => setHelpSelection(null)}
        title="Paragraph Check"
      >
        <ParagraphHelpContent paragraph={paragraph} />
      </PopoverShell>
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
  const [helpSelection, setHelpSelection] = useState<HelpSelection | null>(null);

  return (
    <Card.Root>
      <Card.Header>
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" gap={3} wrap="wrap">
            <Box>
              <Card.Title>{story.story.title}</Card.Title>
              <Card.Description>
                {story.story.targetLanguage.name} from {story.story.knownLanguage.name} ·{" "}
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
          {story.story.summary ? (
            <Text color="app.fg.muted" fontSize="sm">
              {story.story.summary}
            </Text>
          ) : null}
        </VStack>
      </Card.Header>
      <Card.Body>
        <VStack
          align="stretch"
          as="article"
          dir={story.story.targetLanguage.direction}
          gap={5}
        >
          {story.paragraphs.map((paragraph, paragraphIndex) => (
            <Box key={paragraph.id}>
              <Text color="app.fg.muted" fontSize="xs" mb={2}>
                Paragraph {paragraphIndex + 1} of {story.paragraphs.length}
              </Text>
              <Text fontSize="lg" lineHeight="1.9">
                {paragraph.sentences.map((sentence) => (
                  <StorySentence
                    helpSelection={helpSelection}
                    key={sentence.id}
                    sentence={sentence}
                    setHelpSelection={setHelpSelection}
                  />
                ))}
              </Text>
              {hasParagraphHelp(paragraph) ? (
                <ParagraphHelp
                  helpSelection={helpSelection}
                  paragraph={paragraph}
                  setHelpSelection={setHelpSelection}
                />
              ) : null}
            </Box>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
