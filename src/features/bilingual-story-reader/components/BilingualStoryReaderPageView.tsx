"use client";

import {
  Alert,
  Bleed,
  Box,
  Button,
  Card,
  CloseButton,
  Combobox,
  Flex,
  Grid,
  Group,
  HStack,
  Icon,
  IconButton,
  NativeSelect,
  Popover,
  Portal,
  SegmentGroup,
  Text,
  Textarea,
  VStack,
  useListCollection,
} from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Clipboard } from "@components/ui/clipboard";
import { Field } from "@components/ui/field";
import { Tooltip } from "@components/ui/tooltip";
import {
  useMemo,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
} from "react";
import {
  LuBookOpen,
  LuCheck,
  LuChevronDown,
  LuChevronUp,
  LuClipboardCopy,
  LuClipboardPaste,
  LuCopy,
  LuEye,
  LuFilePlus,
  LuPencil,
} from "react-icons/lu";
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
import { readTextFromClipboard } from "../services/clipboard";
import { parseJsonWithCleanup, type JsonParseResult } from "../services/json-cleanup";
import {
  validateBilingualStoryReaderSchema,
  type StoryValidationResult,
} from "../domain/validate-story";
import { RenderedStoryView } from "./RenderedStoryView";

type TextFieldName = Exclude<
  keyof BilingualStoryReaderSetupFormValues,
  "level" | "length"
>;

type Notice = {
  id: number;
  status: "success" | "warning" | "error" | "info";
  title: string;
  message?: string;
};

const CONTROL_INPUT_PROPS = {
  bg: "app.bilingualStoryReader.bg.control",
  borderColor: "app.bilingualStoryReader.border.default",
  color: "app.bilingualStoryReader.fg.default",
  fontFamily: "ui",
  fontSize: "sm",
  rounded: "xl",
  _placeholder: { color: "app.bilingualStoryReader.fg.subtle" },
} as const;

const ACTION_BUTTON_PROPS = {
  fontFamily: "ui",
  fontSize: "sm",
  rounded: "xl",
} as const;

const PRIMARY_BUTTON_PROPS = {
  bg: "app.bilingualStoryReader.button.primary.bg",
  color: "app.bilingualStoryReader.button.primary.fg",
  _hover: {
    bg: "app.bilingualStoryReader.button.primary.hoverBg",
  },
} as const;

const SUBTLE_BUTTON_PROPS = {
  bg: "app.bilingualStoryReader.button.subtle.bg",
  color: "app.bilingualStoryReader.button.subtle.fg",
  _hover: {
    bg: "app.bilingualStoryReader.button.subtle.hoverBg",
  },
} as const;

type StoryComboboxOption = {
  value: string;
  label: string;
};

const LANGUAGE_COMBOBOX_OPTIONS = BILINGUAL_STORY_READER_LANGUAGE_OPTIONS
  .filter((language) => language.name !== "Custom")
  .map((language) => ({
    value: language.name,
    label: language.label,
  }));

const STORY_THEME_OPTIONS = [
  "Funny",
  "Scary",
  "Mystery",
  "Adventure",
  "Fantasy",
  "Romance",
  "Drama",
].map((theme) => ({ value: theme, label: theme }));

function StoryCombobox({
  ariaLabel,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  ariaLabel: string;
  onValueChange: (value: string) => void;
  options: StoryComboboxOption[];
  placeholder: string;
  value: string;
}) {
  const { collection, filter } = useListCollection({
    initialItems: options,
    itemToString: (item) => item.value,
    itemToValue: (item) => item.value,
    filter: (itemText, filterText, item) => {
      const normalizedFilter = filterText.toLowerCase();
      return (
        itemText.toLowerCase().includes(normalizedFilter) ||
        item.label.toLowerCase().includes(normalizedFilter)
      );
    },
  });

  return (
    <Combobox.Root
      allowCustomValue
      collection={collection}
      inputValue={value}
      openOnClick
      positioning={{ sameWidth: true }}
      selectionBehavior="replace"
      onInputValueChange={(details) => {
        onValueChange(details.inputValue);
        filter(details.inputValue);
      }}
      onValueChange={(details) => {
        const nextValue = details.items[0]?.value ?? details.value[0];
        if (nextValue) onValueChange(nextValue);
      }}
    >
      <Combobox.Control>
        <Combobox.Input
          {...CONTROL_INPUT_PROPS}
          aria-label={ariaLabel}
          placeholder={placeholder}
        />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner zIndex={30}>
          <Combobox.Content
            bg="app.bilingualStoryReader.bg.popover"
            borderColor="app.bilingualStoryReader.border.default"
            borderWidth="1px"
            shadow="lg"
          >
            {collection.items.map((option) => (
              <Combobox.Item item={option} key={option.value}>
                <Combobox.ItemText>{option.label}</Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
            <Combobox.Empty color="app.bilingualStoryReader.fg.muted" fontSize="sm">
              Use typed value
            </Combobox.Empty>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}

function StorySegmentedControl<T extends string>({
  ariaLabel,
  itemMinW = "3rem",
  onValueChange,
  options,
  value,
}: {
  ariaLabel: string;
  itemMinW?: string;
  onValueChange: (value: T) => void;
  options: readonly T[];
  value: T;
}) {
  return (
    <SegmentGroup.Root
      aria-label={ariaLabel}
      bg="app.bilingualStoryReader.bg.control"
      borderColor="app.bilingualStoryReader.border.default"
      borderWidth="1px"
      color="app.bilingualStoryReader.fg.default"
      fontFamily="ui"
      flexWrap="wrap"
      minW={0}
      p={1}
      rounded="xl"
      size="sm"
      value={value}
      w="full"
      onValueChange={(details) => {
        const nextValue = details.value;
        if (options.some((option) => option === nextValue)) {
          onValueChange(nextValue as T);
        }
      }}
    >
      <SegmentGroup.Indicator />
      {options.map((option) => (
        <SegmentGroup.Item
          flex="1 1 auto"
          key={option}
          minW={itemMinW}
          px={3}
          value={option}
          _checked={{
            color: "app.bilingualStoryReader.fg.accent",
            fontWeight: "semibold",
          }}
        >
          <SegmentGroup.ItemText>{option}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
}

export function BilingualStoryReaderPageView() {
  const [setup, setSetup] = useState<BilingualStoryReaderSetupFormValues>(
    DEFAULT_BILINGUAL_STORY_READER_SETUP,
  );
  const [notices, setNotices] = useState<Notice[]>([]);
  const [rawResponseText, setRawResponseText] = useState("");
  const [isManualPasteOpen, setIsManualPasteOpen] = useState(false);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isPromptEditing, setIsPromptEditing] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
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

  function handlePromptDialogOpenChange(open: boolean): void {
    setIsPromptDialogOpen(open);
    if (open) {
      setPromptDraft(prompt);
      setIsPromptEditing(false);
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
    <VStack align="stretch" gap={4} pt={4} pb={0}>
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

      <Box w="full" px={[4, 6]}>
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
                <Button {...ACTION_BUTTON_PROPS} {...PRIMARY_BUTTON_PROPS} onClick={adjustPrompt}>
                  <Icon>
                    <LuPencil />
                  </Icon>
                  Edit Prompt
                </Button>
                <Button
                  {...ACTION_BUTTON_PROPS}
                  {...SUBTLE_BUTTON_PROPS}
                  onClick={resetLoadedStory}
                >
                  <Icon>
                    <LuFilePlus />
                  </Icon>
                  New Story
                </Button>
              </>
            ) : (
              <>
                <Group attached>
                  <Clipboard.Root value={prompt} timeout={1000}>
                    <Clipboard.Trigger asChild>
                      <Button
                        {...ACTION_BUTTON_PROPS}
                        {...PRIMARY_BUTTON_PROPS}
                        aria-label="Copy Prompt"
                        borderRightWidth={0}
                        disabled={!isSetupComplete}
                        minW="9rem"
                        roundedRight={0}
                      >
                        <Clipboard.Indicator copied={<Icon as={LuCheck} />}>
                          <Icon as={LuCopy} />
                        </Clipboard.Indicator>
                        <Clipboard.Indicator copied="Copied">
                          Copy Prompt
                        </Clipboard.Indicator>
                      </Button>
                    </Clipboard.Trigger>
                  </Clipboard.Root>
                  <DialogRoot
                    open={isPromptDialogOpen}
                    onOpenChange={(details) =>
                      handlePromptDialogOpenChange(details.open)
                    }
                  >
                    <Tooltip content="View generated prompt">
                      <DialogTrigger asChild>
                        <IconButton
                          {...ACTION_BUTTON_PROPS}
                          {...PRIMARY_BUTTON_PROPS}
                          aria-label="View generated prompt"
                          borderLeftWidth="1px"
                          borderLeftColor="app.bilingualStoryReader.button.primary.divider"
                          disabled={!isSetupComplete}
                          roundedLeft={0}
                        >
                          <LuEye />
                        </IconButton>
                      </DialogTrigger>
                    </Tooltip>

                    <DialogContent
                      bg="app.bilingualStoryReader.bg.card"
                      borderColor="app.bilingualStoryReader.border.default"
                      borderWidth="1px"
                      color="app.bilingualStoryReader.fg.default"
                      maxW="720px"
                      rounded="2xl"
                    >
                      <DialogHeader>
                        <DialogTitle fontFamily="ui">Generated prompt</DialogTitle>
                      </DialogHeader>
                      <DialogBody>
                        <VStack align="stretch" gap={3}>
                          <Text color="app.bilingualStoryReader.fg.muted" fontSize="sm">
                            Edits are temporary and are not saved to the setup.
                          </Text>
                          <Textarea
                            {...CONTROL_INPUT_PROPS}
                            aria-label="Generated prompt"
                            fontFamily="mono"
                            minH={{ base: "xs", md: "md" }}
                            onChange={(event) =>
                              setPromptDraft(event.currentTarget.value)
                            }
                            readOnly={!isPromptEditing}
                            value={promptDraft}
                          />
                          <HStack gap={2} justify="end" wrap="wrap">
                            <Button
                              {...ACTION_BUTTON_PROPS}
                              onClick={() =>
                                setIsPromptEditing((current) => !current)
                              }
                              variant="outline"
                            >
                              <Icon>
                                {isPromptEditing ? <LuEye /> : <LuPencil />}
                              </Icon>
                              {isPromptEditing ? "View" : "Edit"}
                            </Button>
                            <Clipboard.Root value={promptDraft} timeout={1000}>
                              <Clipboard.Trigger asChild>
                                <Button
                                  {...ACTION_BUTTON_PROPS}
                                  {...PRIMARY_BUTTON_PROPS}
                                  aria-label="Copy generated prompt"
                                  minW="5.75rem"
                                >
                                  <Clipboard.Indicator copied={<Icon as={LuCheck} />}>
                                    <Icon as={LuCopy} />
                                  </Clipboard.Indicator>
                                  <Clipboard.Indicator copied="Copied">
                                    Copy
                                  </Clipboard.Indicator>
                                </Button>
                              </Clipboard.Trigger>
                            </Clipboard.Root>
                          </HStack>
                        </VStack>
                      </DialogBody>
                      <DialogCloseTrigger />
                    </DialogContent>
                  </DialogRoot>
                </Group>
                <Popover.Root
                  open={isManualPasteOpen}
                  onOpenChange={(details) => setIsManualPasteOpen(details.open)}
                  positioning={{ placement: "bottom-start", gutter: 6 }}
                >
                  <Box>
                    <HStack align="stretch" gap={0}>
                      <Button
                        {...ACTION_BUTTON_PROPS}
                        borderWidth={0}
                        {...SUBTLE_BUTTON_PROPS}
                        onClick={pasteResponseFromClipboard}
                        roundedRight={0}
                        variant="outline"
                      >
                        <Icon>
                          <LuClipboardPaste />
                        </Icon>
                        Load Story from Clipboard
                      </Button>
                      <Popover.Trigger asChild>
                        <IconButton
                          {...ACTION_BUTTON_PROPS}
                          aria-label={
                            isManualPasteOpen
                              ? "Hide manual paste"
                              : "Show manual paste"
                          }
                          borderWidth={0}
                          borderLeftColor="app.bilingualStoryReader.button.subtle.divider"
                          borderLeftWidth="1px"
                          {...SUBTLE_BUTTON_PROPS}
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
                      bg="app.bilingualStoryReader.bg.popover"
                      borderColor="app.bilingualStoryReader.border.default"
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
                        placeholder="Paste the AI response here, then load the story."
                        rounded="none"
                        value={rawResponseText}
                      />
                      <Button
                        {...ACTION_BUTTON_PROPS}
                        disabled={!rawResponseText.trim()}
                        mt="-1px"
                        onClick={readStory}
                        rounded="none"
                        size="sm"
                        variant="subtle"
                        w="full"
                        {...SUBTLE_BUTTON_PROPS}
                      >
                        <Icon>
                          <LuBookOpen />
                        </Icon>
                        Load Story
                      </Button>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </>
            )}
          </HStack>
        </Flex>
      </Box>

      {!hasLoadedStory ? (
        <Bleed inline={{ base: 1, md: 2 }}>
          <HighlightedSection
            contentPx={{ base: 3, md: 4 }}
            contentPy={{ base: 3, md: 4 }}
          >
            <VStack align="stretch" gap={4} minW={0}>
              <Card.Root borderColor="app.bilingualStoryReader.border.default" rounded="2xl">
                <Card.Header>
                  <Card.Title>Story Setup</Card.Title>
                </Card.Header>
                <Card.Body>
                  <VStack align="stretch" gap={4}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                      <Field label="Known language">
                        <StoryCombobox
                          ariaLabel="Known language"
                          options={LANGUAGE_COMBOBOX_OPTIONS}
                          placeholder="Search or type a language"
                          value={setup.knownLanguage}
                          onValueChange={(value) =>
                            updateTextField("knownLanguage", value)
                          }
                        />
                      </Field>

                      <Field label="Target language">
                        <StoryCombobox
                          ariaLabel="Target language"
                          options={LANGUAGE_COMBOBOX_OPTIONS}
                          placeholder="Search or type a language"
                          value={setup.targetLanguage}
                          onValueChange={(value) =>
                            updateTextField("targetLanguage", value)
                          }
                        />
                      </Field>
                    </Grid>

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                      <Field label="Level">
                        <NativeSelect.Root w="full">
                          <NativeSelect.Field
                            {...CONTROL_INPUT_PROPS}
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
                        <StorySegmentedControl<BilingualStoryReaderLength>
                          ariaLabel="Length"
                          options={BILINGUAL_STORY_READER_LENGTHS}
                          value={setup.length}
                          onValueChange={(length) =>
                            setSetup((current) => ({ ...current, length }))
                          }
                        />
                      </Field>
                    </Grid>

                    <Field label="Theme">
                      <StoryCombobox
                        ariaLabel="Theme"
                        options={STORY_THEME_OPTIONS}
                        placeholder="Search or type a theme"
                        value={setup.theme}
                        onValueChange={(value) => updateTextField("theme", value)}
                      />
                    </Field>

                    <Field label="Extra instructions">
                      <Textarea
                        {...CONTROL_INPUT_PROPS}
                        aria-label="Extra instructions"
                        placeholder="Use simple dialogue or include romanization."
                        value={setup.extraInstructions}
                        onChange={(event) =>
                          updateTextField("extraInstructions", event.currentTarget.value)
                        }
                      />
                    </Field>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {jsonParseResult || storyValidationResult ? (
                <VStack align="stretch" gap={2} id="ai-response-validation">
                {jsonParseResult?.warnings.map((warning) => (
                  <Text
                    color="app.bilingualStoryReader.fg.warning"
                    fontSize="sm"
                    key={warning.code}
                    role="status"
                  >
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
              ) : null}
            </VStack>
          </HighlightedSection>
        </Bleed>
      ) : null}

      {storyValidationResult?.ok ? (
        <Bleed inline={{ base: 1, md: 2 }}>
          <HighlightedSection
            contentPx={{ base: 3, md: 4 }}
            contentPy={{ base: 3, md: 4 }}
          >
            <RenderedStoryView
              story={storyValidationResult.value}
              warnings={storyValidationResult.warnings}
            />
          </HighlightedSection>
        </Bleed>
      ) : null}

    </VStack>
  );
}
