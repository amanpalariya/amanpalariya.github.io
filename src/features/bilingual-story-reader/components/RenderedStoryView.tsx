"use client";

import { Badge, Box, Button, Card, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { RenderableSentence, RenderableStory, BilingualStoryReaderWarning } from "../domain/validate-story";

type RevealLevel = 0 | 1 | 2 | 3;

const MAX_REVEAL_LEVEL: RevealLevel = 3;

function SentenceText({ sentence }: { sentence: RenderableSentence }) {
  if (!sentence.hasValidSegments) {
    return <>{sentence.text}</>;
  }

  return (
    <>
      {sentence.segments.map((segment, index) => {
        const key = `${sentence.id}-${index}-${segment.text}`;
        if (!segment.kind) return <span key={key}>{segment.text}</span>;

        return (
          <Box
            as="span"
            borderBottom="1px dotted"
            borderColor="app.fg.subtle"
            key={key}
            title={segment.meaning ?? segment.hint ?? undefined}
          >
            {segment.text}
          </Box>
        );
      })}
    </>
  );
}

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

function SentenceHelpPanel({
  sentence,
  revealLevel,
  onRevealNext,
  onResetReveals,
}: {
  sentence: RenderableSentence;
  revealLevel: RevealLevel;
  onRevealNext: () => void;
  onResetReveals: () => void;
}) {
  return (
    <Card.Root>
      <Card.Header>
        <VStack align="stretch" gap={2}>
          <Card.Title>Sentence Help</Card.Title>
          <Text color="app.fg.muted" fontSize="sm">
            {sentence.text}
          </Text>
          <HStack gap={2} wrap="wrap">
            <Button
              colorPalette="blue"
              disabled={revealLevel >= MAX_REVEAL_LEVEL}
              onClick={onRevealNext}
              size="sm"
            >
              Reveal next
            </Button>
            <Button onClick={onResetReveals} size="sm" variant="ghost">
              Reset Reveals
            </Button>
          </HStack>
        </VStack>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          {revealLevel >= 0 && sentence.clue ? (
            <Box>
              <Text fontWeight="medium">Clue</Text>
              <Text color="app.fg.muted" fontSize="sm">
                {sentence.clue}
              </Text>
            </Box>
          ) : null}

          {revealLevel >= 1 && sentence.meaning ? (
            <Box>
              <Text fontWeight="medium">Meaning</Text>
              <Text color="app.fg.muted" fontSize="sm">
                {sentence.meaning}
              </Text>
            </Box>
          ) : null}

          {revealLevel >= 2 ? (
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
          ) : null}

          {revealLevel >= 3 && hasWhyItWorks(sentence) ? (
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
      </Card.Body>
    </Card.Root>
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
  const sentences = useMemo(
    () => story.paragraphs.flatMap((paragraph) => paragraph.sentences),
    [story.paragraphs],
  );
  const [activeSentenceId, setActiveSentenceId] = useState(
    () => sentences[0]?.id ?? "",
  );
  const [revealLevels, setRevealLevels] = useState<Record<string, RevealLevel>>({});
  const activeSentence =
    sentences.find((sentence) => sentence.id === activeSentenceId) ?? sentences[0];
  const activeRevealLevel = activeSentence
    ? revealLevels[activeSentence.id] ?? 0
    : 0;

  function revealNext(): void {
    if (!activeSentence) return;
    setRevealLevels((current) => ({
      ...current,
      [activeSentence.id]: Math.min(
        MAX_REVEAL_LEVEL,
        (current[activeSentence.id] ?? 0) + 1,
      ) as RevealLevel,
    }));
  }

  function resetReveals(): void {
    setRevealLevels({});
  }

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
        <Grid templateColumns={["1fr", null, "minmax(0, 1fr) 320px"]} gap={5}>
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
                  {paragraph.sentences.map((sentence) => {
                    const isActive = sentence.id === activeSentence?.id;
                    return (
                      <Box
                        aria-pressed={isActive}
                        as="button"
                        bg={isActive ? "bg.subtle" : "transparent"}
                        borderLeftWidth={isActive ? "3px" : "0"}
                        borderColor="blue.500"
                        color="inherit"
                        cursor="pointer"
                        display="inline"
                        key={sentence.id}
                        mr={2}
                        onClick={() => setActiveSentenceId(sentence.id)}
                        px={isActive ? 1 : 0}
                        textAlign="start"
                      >
                        <SentenceText sentence={sentence} />
                      </Box>
                    );
                  })}
                </Text>
              </Box>
            ))}
          </VStack>

          {activeSentence ? (
            <SentenceHelpPanel
              onResetReveals={resetReveals}
              onRevealNext={revealNext}
              revealLevel={activeRevealLevel}
              sentence={activeSentence}
            />
          ) : null}
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
