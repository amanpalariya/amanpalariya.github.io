"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Input,
  NativeSelect,
  Separator,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Field } from "@components/ui/field";
import {
  STORY_READER_LENGTHS,
  STORY_READER_LEVELS,
  STORY_READER_TRANSLATION_STYLES,
} from "../domain/constants";

export function BilingualStoryReaderPageView() {
  return (
    <VStack align="stretch" gap={5} px={[4, 6]} pb={6}>
      <Flex
        align={["stretch", "center"]}
        direction={["column", "row"]}
        gap={3}
        justify="space-between"
        wrap="wrap"
      >
        <HStack gap={2} wrap="wrap">
          <Button colorPalette="blue" disabled>
            Copy Prompt
          </Button>
          <Button variant="outline" disabled>
            Load Example
          </Button>
          <Button variant="ghost" disabled>
            Clear
          </Button>
        </HStack>
        <Badge colorPalette="gray" alignSelf={["flex-start", "center"]}>
          No story loaded
        </Badge>
      </Flex>

      <Grid templateColumns={["1fr", null, "minmax(0, 1fr) minmax(0, 1fr)"]} gap={4}>
        <Card.Root>
          <Card.Header>
            <Card.Title>Story Setup</Card.Title>
            <Card.Description>
              Define the languages and story constraints before copying the AI prompt.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <VStack align="stretch" gap={4}>
              <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                <Field label="Known language">
                  <Input placeholder="English" />
                </Field>
                <Field label="Target language">
                  <Input placeholder="Spanish" />
                </Field>
              </Grid>

              <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                <Field label="Level">
                  <NativeSelect.Root>
                    <NativeSelect.Field aria-label="Level" defaultValue="A1">
                      {STORY_READER_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field>
                <Field label="Length">
                  <NativeSelect.Root>
                    <NativeSelect.Field aria-label="Length" defaultValue="Short">
                      {STORY_READER_LENGTHS.map((length) => (
                        <option key={length} value={length}>
                          {length}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field>
              </Grid>

              <Field label="Theme">
                <Input placeholder="lost phone at a train station" />
              </Field>

              <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                <Field label="Translation style">
                  <NativeSelect.Root>
                    <NativeSelect.Field aria-label="Translation style" defaultValue="Both">
                      {STORY_READER_TRANSLATION_STYLES.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field>
                <Field label="Vocabulary focus">
                  <Input placeholder="common travel verbs" />
                </Field>
              </Grid>

              <Field label="Extra instructions">
                <Textarea placeholder="Use simple dialogue and include romanization if helpful." />
              </Field>

              <Separator />

              <Box>
                <Text fontWeight="medium">Prompt preview</Text>
                <Text color="app.fg.muted" fontSize="sm" mt={1}>
                  Fill the required fields to generate a copyable prompt.
                </Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title>Paste JSON</Card.Title>
            <Card.Description>
              Paste the AI-generated JSON here. The story stays local in your browser.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <VStack align="stretch" gap={4}>
              <Field label="Story JSON">
                <Textarea minH="xs" placeholder='{"schemaVersion":"1.0", ...}' />
              </Field>

              <HStack gap={2} wrap="wrap">
                <Button colorPalette="blue" disabled>
                  Render Story
                </Button>
                <Button variant="outline" disabled>
                  Format JSON
                </Button>
              </HStack>

              <Text color="app.fg.muted" fontSize="sm">
                Validation results will appear here after JSON parsing is implemented.
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>

      <Card.Root>
        <Card.Body>
          <HStack gap={3} wrap="wrap" color="app.fg.muted" fontSize="sm">
            <Text>Fill the setup fields.</Text>
            <Text>Copy the generated prompt.</Text>
            <Text>Generate JSON in an AI assistant.</Text>
            <Text>Paste and read here.</Text>
          </HStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
