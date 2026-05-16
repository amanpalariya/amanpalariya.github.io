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
import { useMemo, useState } from "react";
import {
  BILINGUAL_STORY_READER_LENGTHS,
  BILINGUAL_STORY_READER_LEVELS,
  BILINGUAL_STORY_READER_TRANSLATION_STYLES,
} from "../domain/constants";
import type {
  BilingualStoryReaderLength,
  BilingualStoryReaderLevel,
  BilingualStoryReaderSetupFormValues,
  BilingualStoryReaderTranslationStyle,
} from "../domain/types";
import {
  buildBilingualStoryReaderPrompt,
  DEFAULT_BILINGUAL_STORY_READER_SETUP,
  isBilingualStoryReaderSetupComplete,
} from "../services/prompt-builder";
import { writeTextToClipboard } from "../services/clipboard";
import { parseJsonWithCleanup, type JsonParseResult } from "../services/json-cleanup";
import {
  validateBilingualStoryReaderSchema,
  type StoryValidationResult,
} from "../domain/validate-story";
import { RenderedStoryView } from "./RenderedStoryView";

type TextFieldName = Exclude<
  keyof BilingualStoryReaderSetupFormValues,
  "level" | "length" | "translationStyle" | "customLevel"
>;
type CustomLevelFieldName = keyof BilingualStoryReaderSetupFormValues["customLevel"];

export function BilingualStoryReaderPageView() {
  const [setup, setSetup] = useState<BilingualStoryReaderSetupFormValues>(
    DEFAULT_BILINGUAL_STORY_READER_SETUP,
  );
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [rawJsonText, setRawJsonText] = useState("");
  const [jsonParseResult, setJsonParseResult] = useState<JsonParseResult | null>(
    null,
  );
  const [storyValidationResult, setStoryValidationResult] =
    useState<StoryValidationResult | null>(null);

  const prompt = useMemo(() => buildBilingualStoryReaderPrompt(setup), [setup]);
  const isSetupComplete = isBilingualStoryReaderSetupComplete(setup);

  function updateTextField(field: TextFieldName, value: string): void {
    setSetup((current) => ({ ...current, [field]: value }));
  }

  function updateCustomLevelField(
    field: CustomLevelFieldName,
    value: string,
  ): void {
    setSetup((current) => ({
      ...current,
      customLevel: {
        ...current.customLevel,
        [field]: value,
      },
    }));
  }

  async function copyPrompt(): Promise<void> {
    if (!isSetupComplete) return;

    try {
      await writeTextToClipboard(prompt);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    window.setTimeout(() => setCopyStatus("idle"), 1800);
  }

  function renderJson(): void {
    const parseResult = parseJsonWithCleanup(rawJsonText);
    setJsonParseResult(parseResult);
    setStoryValidationResult(
      parseResult.ok ? validateBilingualStoryReaderSchema(parseResult.value) : null,
    );
  }

  function formatJson(): void {
    const result = parseJsonWithCleanup(rawJsonText);
    setJsonParseResult(result);
    setStoryValidationResult(null);

    if (result.ok) {
      setRawJsonText(`${JSON.stringify(result.value, null, 2)}\n`);
    }
  }

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
          <Button colorPalette="blue" disabled={!isSetupComplete} onClick={copyPrompt}>
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
          {storyValidationResult?.ok
            ? "Story loaded"
            : jsonParseResult?.ok
              ? "JSON parsed"
              : "No story loaded"}
        </Badge>
      </Flex>
      {copyStatus === "copied" ? (
        <Text color="green.600" fontSize="sm" role="status">
          Prompt copied.
        </Text>
      ) : null}
      {copyStatus === "failed" ? (
        <Text color="red.600" fontSize="sm" role="alert">
          Could not access the clipboard.
        </Text>
      ) : null}

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
                  <Input
                    aria-label="Known language"
                    placeholder="English"
                    value={setup.knownLanguage}
                    onChange={(event) =>
                      updateTextField("knownLanguage", event.currentTarget.value)
                    }
                  />
                </Field>
                <Field label="Target language">
                  <Input
                    aria-label="Target language"
                    placeholder="Spanish"
                    value={setup.targetLanguage}
                    onChange={(event) =>
                      updateTextField("targetLanguage", event.currentTarget.value)
                    }
                  />
                </Field>
              </Grid>

              <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                <Field label="Level">
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      aria-label="Level"
                      value={setup.level}
                      onChange={(event) =>
                        setSetup((current) => ({
                          ...current,
                          level: event.currentTarget.value as BilingualStoryReaderLevel,
                        }))
                      }
                    >
                      {BILINGUAL_STORY_READER_LEVELS.map((level) => (
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
                    <NativeSelect.Field
                      aria-label="Length"
                      value={setup.length}
                      onChange={(event) =>
                        setSetup((current) => ({
                          ...current,
                          length: event.currentTarget.value as BilingualStoryReaderLength,
                        }))
                      }
                    >
                      {BILINGUAL_STORY_READER_LENGTHS.map((length) => (
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
                <Input
                  aria-label="Theme"
                  placeholder="lost phone at a train station"
                  value={setup.theme}
                  onChange={(event) => updateTextField("theme", event.currentTarget.value)}
                />
              </Field>

              <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                <Field label="Translation style">
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      aria-label="Translation style"
                      value={setup.translationStyle}
                      onChange={(event) =>
                        setSetup((current) => ({
                          ...current,
                          translationStyle: event.currentTarget
                            .value as BilingualStoryReaderTranslationStyle,
                        }))
                      }
                    >
                      {BILINGUAL_STORY_READER_TRANSLATION_STYLES.map((style) => (
                        <option key={style} value={style}>
                          {style}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field>
                <Field label="Vocabulary focus">
                  <Input
                    aria-label="Vocabulary focus"
                    placeholder="common travel verbs"
                    value={setup.vocabularyFocus}
                    onChange={(event) =>
                      updateTextField("vocabularyFocus", event.currentTarget.value)
                    }
                  />
                </Field>
              </Grid>

              <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                <Field label="Tone">
                  <Input
                    aria-label="Tone"
                    placeholder="light mystery"
                    value={setup.tone}
                    onChange={(event) => updateTextField("tone", event.currentTarget.value)}
                  />
                </Field>
                <Field label="Avoid topics">
                  <Input
                    aria-label="Avoid topics"
                    placeholder="violence"
                    value={setup.avoidTopics}
                    onChange={(event) =>
                      updateTextField("avoidTopics", event.currentTarget.value)
                    }
                  />
                </Field>
              </Grid>

              {setup.level === "Custom" ? (
                <VStack align="stretch" gap={3}>
                  <Text fontWeight="medium">Custom Level</Text>
                  <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                    <Field label="Max sentence length">
                      <Input
                        aria-label="Max sentence length"
                        inputMode="numeric"
                        placeholder="12"
                        value={setup.customLevel.maxSentenceLength}
                        onChange={(event) =>
                          updateCustomLevelField(
                            "maxSentenceLength",
                            event.currentTarget.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="CEFR-like target">
                      <Input
                        aria-label="CEFR-like target"
                        placeholder="A2 with familiar topics"
                        value={setup.customLevel.cefrTarget}
                        onChange={(event) =>
                          updateCustomLevelField("cefrTarget", event.currentTarget.value)
                        }
                      />
                    </Field>
                  </Grid>
                  <Field label="Allowed grammar">
                    <Textarea
                      aria-label="Allowed grammar"
                      value={setup.customLevel.allowedGrammar}
                      onChange={(event) =>
                        updateCustomLevelField("allowedGrammar", event.currentTarget.value)
                      }
                    />
                  </Field>
                  <Field label="Tense/aspect comfort">
                    <Textarea
                      aria-label="Tense/aspect comfort"
                      value={setup.customLevel.tenseAspectComfort}
                      onChange={(event) =>
                        updateCustomLevelField(
                          "tenseAspectComfort",
                          event.currentTarget.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Vocabulary comfort">
                    <Textarea
                      aria-label="Vocabulary comfort"
                      value={setup.customLevel.vocabularyComfort}
                      onChange={(event) =>
                        updateCustomLevelField(
                          "vocabularyComfort",
                          event.currentTarget.value,
                        )
                      }
                    />
                  </Field>
                  <Field label="Language features">
                    <Textarea
                      aria-label="Language features"
                      value={setup.customLevel.languageFeatures}
                      onChange={(event) =>
                        updateCustomLevelField(
                          "languageFeatures",
                          event.currentTarget.value,
                        )
                      }
                    />
                  </Field>
                </VStack>
              ) : null}

              <Field label="Extra instructions">
                <Textarea
                  aria-label="Extra instructions"
                  placeholder="Use simple dialogue and include romanization if helpful."
                  value={setup.extraInstructions}
                  onChange={(event) =>
                    updateTextField("extraInstructions", event.currentTarget.value)
                  }
                />
              </Field>

              <Separator />

              <Box>
                <Text fontWeight="medium">Prompt preview</Text>
                <Textarea
                  aria-label="Prompt preview"
                  fontFamily="mono"
                  minH="2xs"
                  mt={2}
                  readOnly
                  value={
                    isSetupComplete
                      ? prompt
                      : "Fill known language, target language, and theme to generate a copyable prompt."
                  }
                />
                <Button
                  colorPalette="blue"
                  disabled={!isSetupComplete}
                  mt={3}
                  onClick={copyPrompt}
                >
                  Copy Prompt
                </Button>
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
                <Textarea
                  aria-describedby="story-json-validation"
                  aria-label="Story JSON"
                  minH="xs"
                  placeholder='{"schemaVersion":"1.0", ...}'
                  value={rawJsonText}
                  onChange={(event) => {
                    setRawJsonText(event.currentTarget.value);
                    setJsonParseResult(null);
                    setStoryValidationResult(null);
                  }}
                />
              </Field>

              <HStack gap={2} wrap="wrap">
                <Button
                  colorPalette="blue"
                  disabled={!rawJsonText.trim()}
                  onClick={renderJson}
                >
                  Render Story
                </Button>
                <Button
                  variant="outline"
                  disabled={!rawJsonText.trim()}
                  onClick={formatJson}
                >
                  Format JSON
                </Button>
              </HStack>

              <VStack align="stretch" gap={2} id="story-json-validation">
                {!jsonParseResult ? (
                  <Text color="app.fg.muted" fontSize="sm">
                    JSON parsing results will appear here.
                  </Text>
                ) : null}

                {jsonParseResult?.warnings.map((warning) => (
                  <Text color="orange.600" fontSize="sm" key={warning.code} role="status">
                    {warning.message}
                  </Text>
                ))}

                {jsonParseResult?.ok ? (
                  <Text color="green.600" fontSize="sm" role="status">
                    JSON parsed.
                  </Text>
                ) : null}

                {storyValidationResult?.ok ? (
                  <Text color="green.600" fontSize="sm" role="status">
                    Story rendered.
                  </Text>
                ) : null}

                {jsonParseResult && !jsonParseResult.ok
                  ? jsonParseResult.errors.map((error) => (
                      <Text color="red.600" fontSize="sm" key={error.message} role="alert">
                        {error.line && error.column
                          ? `${error.message} Line ${error.line}, column ${error.column}.`
                          : error.message}
                      </Text>
                    ))
                  : null}

                {storyValidationResult && !storyValidationResult.ok
                  ? storyValidationResult.errors.map((error) => (
                      <Text color="red.600" fontSize="sm" key={error.path} role="alert">
                        {error.path}: {error.message}
                      </Text>
                    ))
                  : null}
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>

      {storyValidationResult?.ok ? (
        <RenderedStoryView
          story={storyValidationResult.value}
          warnings={storyValidationResult.warnings}
        />
      ) : null}

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
