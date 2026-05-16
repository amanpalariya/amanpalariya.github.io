"use client";

import { Badge, Box, Card, HStack, Text, VStack } from "@chakra-ui/react";
import type { RenderableSentence, RenderableStory, BilingualStoryReaderWarning } from "../domain/validate-story";

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
                  <Box as="span" key={sentence.id} mr={2}>
                    <SentenceText sentence={sentence} />
                  </Box>
                ))}
              </Text>
            </Box>
          ))}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
