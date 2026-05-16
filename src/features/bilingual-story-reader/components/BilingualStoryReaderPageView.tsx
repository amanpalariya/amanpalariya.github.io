"use client";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Popover,
  Separator,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Field } from "@components/ui/field";
import { useMemo, useState, type ClipboardEvent as ReactClipboardEvent } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import {
  BILINGUAL_STORY_READER_LANGUAGE_OPTIONS,
  BILINGUAL_STORY_READER_LENGTHS,
  BILINGUAL_STORY_READER_LEVELS,
} from "../domain/constants";
import type {
  BilingualStoryReaderLength,
  BilingualStoryReaderLevel,
  BilingualStoryReaderSetupFormValues,
} from "../domain/types";
import {
  buildBilingualStoryReaderPrompt,
  DEFAULT_BILINGUAL_STORY_READER_SETUP,
  isBilingualStoryReaderPromptText,
  isBilingualStoryReaderSetupComplete,
} from "../services/prompt-builder";
import { readTextFromClipboard, writeTextToClipboard } from "../services/clipboard";
import { parseJsonWithCleanup, type JsonParseResult } from "../services/json-cleanup";
import {
  validateBilingualStoryReaderSchema,
  type StoryValidationResult,
} from "../domain/validate-story";
import { RenderedStoryView } from "./RenderedStoryView";

type TextFieldName = Exclude<
  keyof BilingualStoryReaderSetupFormValues,
  "level" | "length" | "customLevel"
>;
type CustomLevelFieldName = keyof BilingualStoryReaderSetupFormValues["customLevel"];

type Notice = {
  id: number;
  status: "success" | "warning" | "error" | "info";
  title: string;
  message?: string;
};

const CUSTOM_LANGUAGE_VALUE = "Custom";

function languageSelectValue(language: string): string {
  return BILINGUAL_STORY_READER_LANGUAGE_OPTIONS.some((option) => option.name === language)
    ? language
    : CUSTOM_LANGUAGE_VALUE;
}

export function BilingualStoryReaderPageView() {
  const [setup, setSetup] = useState<BilingualStoryReaderSetupFormValues>(
    DEFAULT_BILINGUAL_STORY_READER_SETUP,
  );
  const [notices, setNotices] = useState<Notice[]>([]);
  const [rawResponseText, setRawResponseText] = useState("");
  const [isManualPasteOpen, setIsManualPasteOpen] = useState(false);
  const [jsonParseResult, setJsonParseResult] = useState<JsonParseResult | null>(
    null,
  );
  const [storyValidationResult, setStoryValidationResult] =
    useState<StoryValidationResult | null>(null);

  const prompt = useMemo(() => buildBilingualStoryReaderPrompt(setup), [setup]);
  const isSetupComplete = isBilingualStoryReaderSetupComplete(setup);
  const hasLoadedStory = storyValidationResult?.ok === true;

  function notify(
    status: Notice["status"],
    title: string,
    message?: string,
  ): void {
    const id = Date.now();
    setNotices((current) => [...current, { id, status, title, message }]);
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, 3200);
  }

  function dismissNotice(id: number): void {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }

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
      notify("success", "Prompt copied", "Paste it into your AI assistant.");
    } catch {
      notify("warning", "Can’t access clipboard", "Select and copy the prompt manually.");
    }
  }

  function validateResponseText(responseText: string): void {
    if (isBilingualStoryReaderPromptText(responseText)) {
      setJsonParseResult(null);
      setStoryValidationResult(null);
      notify(
        "warning",
        "That is the prompt",
        "Paste the AI assistant’s response, not the prompt you copied from this tool.",
      );
      return;
    }

    const parseResult = parseJsonWithCleanup(responseText);
    setJsonParseResult(parseResult);

    if (!parseResult.ok) {
      setStoryValidationResult(null);
      notify(
        "error",
        "Couldn’t read the response",
        "Paste the full response from the AI assistant.",
      );
      return;
    }

    const validationResult = validateBilingualStoryReaderSchema(parseResult.value);
    setStoryValidationResult(validationResult);
    if (validationResult.ok) {
      setIsManualPasteOpen(false);
      notify("success", "Story loaded");
    } else {
      notify("error", "Response needs repair", "The response is missing story fields.");
    }
  }

  async function pasteResponseFromClipboard(): Promise<void> {
    try {
      const responseText = await readTextFromClipboard();
      setRawResponseText(responseText);
      validateResponseText(responseText);
    } catch {
      notify("warning", "Clipboard is empty", "Copy the AI response first.");
    }
  }

  function readStory(): void {
    validateResponseText(rawResponseText);
  }

  function handleManualPaste(event: ReactClipboardEvent<HTMLTextAreaElement>): void {
    const text = event.clipboardData.getData("text/plain");
    if (!text.trim()) return;

    event.preventDefault();
    setRawResponseText(text);
    validateResponseText(text);
  }

  function adjustPrompt(): void {
    setStoryValidationResult(null);
    setJsonParseResult(null);
    setRawResponseText("");
  }

  function resetLoadedStory(): void {
    setSetup(DEFAULT_BILINGUAL_STORY_READER_SETUP);
    setRawResponseText("");
    setJsonParseResult(null);
    setStoryValidationResult(null);
    setIsManualPasteOpen(false);
  }

  return (
    <VStack align="stretch" gap={5} px={[4, 6]} pb={6}>
      {notices.length > 0 ? (
        <Box
          pointerEvents="none"
          position="fixed"
          right={4}
          top={4}
          w={["calc(100vw - 2rem)", "360px"]}
          zIndex={2000}
        >
          <VStack align="stretch" gap={2}>
            {notices.map((notice) => (
              <Alert.Root
                boxShadow="md"
                key={notice.id}
                pointerEvents="auto"
                rounded="lg"
                status={notice.status}
              >
                <Alert.Indicator />
                <Alert.Content>
                  <Flex align="start" gap={3} justify="space-between">
                    <Box>
                      <Alert.Title>{notice.title}</Alert.Title>
                      {notice.message ? (
                        <Alert.Description>{notice.message}</Alert.Description>
                      ) : null}
                    </Box>
                    <CloseButton size="sm" onClick={() => dismissNotice(notice.id)} />
                  </Flex>
                </Alert.Content>
              </Alert.Root>
            ))}
          </VStack>
        </Box>
      ) : null}

      <Flex
        align={["stretch", "center"]}
        direction={["column", "row"]}
        gap={3}
        justify="space-between"
        wrap="wrap"
      >
        <HStack gap={2} wrap="wrap">
          {hasLoadedStory ? (
            <>
              <Button colorPalette="blue" onClick={adjustPrompt}>
                Adjust Prompt
              </Button>
              <Button variant="ghost" onClick={resetLoadedStory}>
                New Story
              </Button>
            </>
          ) : (
            <>
              <Button colorPalette="blue" disabled={!isSetupComplete} onClick={copyPrompt}>
                Copy Prompt
              </Button>
              <Popover.Root
                open={isManualPasteOpen}
                onOpenChange={(details) => setIsManualPasteOpen(details.open)}
                positioning={{ placement: "bottom-start", gutter: 6 }}
              >
                <Box>
                  <HStack align="stretch" gap={0}>
                    <Button
                      borderRightWidth={0}
                      onClick={pasteResponseFromClipboard}
                      roundedRight={0}
                      variant="outline"
                    >
                      Paste Response
                    </Button>
                    <Popover.Trigger asChild>
                      <IconButton
                        aria-label={
                          isManualPasteOpen ? "Hide manual paste" : "Show manual paste"
                        }
                        borderLeftWidth="1px"
                        roundedLeft={0}
                        variant="outline"
                      >
                        {isManualPasteOpen ? <LuChevronUp /> : <LuChevronDown />}
                      </IconButton>
                    </Popover.Trigger>
                  </HStack>
                </Box>

                <Popover.Positioner zIndex={20}>
                  <Popover.Content
                    bg="bg.panel"
                    borderColor="border.subtle"
                    borderWidth="1px"
                    minW={{ base: "280px", sm: "420px" }}
                    overflow="hidden"
                    p={0}
                    rounded="lg"
                    shadow="lg"
                    w={{ base: "calc(100vw - 2rem)", sm: "420px" }}
                  >
                    <Textarea
                      aria-describedby="ai-response-validation"
                      aria-label="AI response"
                      borderWidth={0}
                      minH="140px"
                      onChange={(event) => {
                        setRawResponseText(event.currentTarget.value);
                        setJsonParseResult(null);
                        setStoryValidationResult(null);
                      }}
                      onPaste={handleManualPaste}
                      placeholder="Paste the AI response here. It will be read automatically."
                      rounded="none"
                      value={rawResponseText}
                    />
                    <Button
                      disabled={!rawResponseText.trim()}
                      mt="-1px"
                      onClick={readStory}
                      rounded="none"
                      size="sm"
                      variant="subtle"
                      w="full"
                    >
                      Read pasted response
                    </Button>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
            </>
          )}
        </HStack>
        <Badge colorPalette="gray" alignSelf={["flex-start", "center"]}>
          {hasLoadedStory ? "Story loaded" : jsonParseResult?.ok ? "Response parsed" : "Ready"}
        </Badge>
      </Flex>

      {!hasLoadedStory ? (
        <VStack align="stretch" gap={4}>
          <Grid templateColumns={["1fr", null, "minmax(0, 1fr)"]} gap={4}>
          <Card.Root>
            <Card.Header>
              <Card.Title>Story Setup</Card.Title>
              <Card.Description>
                Defaults are ready. Change only what matters, then copy the prompt.
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <VStack align="stretch" gap={4}>
                <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                  <Field label="Known language">
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        aria-label="Known language"
                        value={languageSelectValue(setup.knownLanguage)}
                        onChange={(event) => {
                          const nextLanguage = event.currentTarget.value;
                          updateTextField(
                            "knownLanguage",
                            nextLanguage === CUSTOM_LANGUAGE_VALUE
                              ? ""
                              : nextLanguage,
                          );
                        }}
                      >
                        {BILINGUAL_STORY_READER_LANGUAGE_OPTIONS.map((language) => (
                          <option key={language.name} value={language.name}>
                            {language.label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    {languageSelectValue(setup.knownLanguage) === CUSTOM_LANGUAGE_VALUE ? (
                      <Input
                        aria-label="Custom known language"
                        mt={2}
                        placeholder="Type a language"
                        value={setup.knownLanguage}
                        onChange={(event) =>
                          updateTextField("knownLanguage", event.currentTarget.value)
                        }
                      />
                    ) : null}
                  </Field>

                  <Field label="Target language">
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        aria-label="Target language"
                        value={languageSelectValue(setup.targetLanguage)}
                        onChange={(event) => {
                          const nextLanguage = event.currentTarget.value;
                          updateTextField(
                            "targetLanguage",
                            nextLanguage === CUSTOM_LANGUAGE_VALUE
                              ? ""
                              : nextLanguage,
                          );
                        }}
                      >
                        {BILINGUAL_STORY_READER_LANGUAGE_OPTIONS.map((language) => (
                          <option key={language.name} value={language.name}>
                            {language.label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    {languageSelectValue(setup.targetLanguage) === CUSTOM_LANGUAGE_VALUE ? (
                      <Input
                        aria-label="Custom target language"
                        mt={2}
                        placeholder="Type a language"
                        value={setup.targetLanguage}
                        onChange={(event) =>
                          updateTextField("targetLanguage", event.currentTarget.value)
                        }
                      />
                    ) : null}
                  </Field>
                </Grid>

                <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                  <Field label="Level">
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        aria-label="Level"
                        value={setup.level}
                        onChange={(event) => {
                          const nextLevel = event.currentTarget
                            .value as BilingualStoryReaderLevel;
                          setSetup((current) => ({
                            ...current,
                            level: nextLevel,
                          }));
                        }}
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
                        onChange={(event) => {
                          const nextLength = event.currentTarget
                            .value as BilingualStoryReaderLength;
                          setSetup((current) => ({
                            ...current,
                            length: nextLength,
                          }));
                        }}
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

                <Field label="Theme" optionalText="Automatic">
                  <Input
                    aria-label="Theme"
                    placeholder="Automatic random theme"
                    value={setup.theme}
                    onChange={(event) => updateTextField("theme", event.currentTarget.value)}
                  />
                </Field>

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

                <Field label="Extra instructions" optionalText="Optional">
                  <Textarea
                    aria-label="Extra instructions"
                    placeholder="Use simple dialogue or include romanization."
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
                        : "Choose the known and target languages to generate a copyable prompt."
                    }
                  />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>
          </Grid>

          <VStack align="stretch" gap={2} id="ai-response-validation">
            {!jsonParseResult ? (
              <Text color="app.fg.muted" fontSize="sm">
                Clipboard responses are checked locally in your browser.
              </Text>
            ) : null}

            {jsonParseResult?.warnings.map((warning) => (
              <Text color="orange.600" fontSize="sm" key={warning.code} role="status">
                {warning.message}
              </Text>
            ))}

            {jsonParseResult?.ok ? (
              <Text color="green.600" fontSize="sm" role="status">
                Response parsed.
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
      ) : null}

      {storyValidationResult?.ok ? (
        <RenderedStoryView
          story={storyValidationResult.value}
          warnings={storyValidationResult.warnings}
        />
      ) : null}

      {!hasLoadedStory ? (
        <Card.Root>
          <Card.Body>
            <HStack gap={3} wrap="wrap" color="app.fg.muted" fontSize="sm">
              <Text>Copy the prompt.</Text>
              <Text>Generate in your AI assistant.</Text>
              <Text>Paste the response.</Text>
              <Text>Read here.</Text>
            </HStack>
          </Card.Body>
        </Card.Root>
      ) : null}
    </VStack>
  );
}
