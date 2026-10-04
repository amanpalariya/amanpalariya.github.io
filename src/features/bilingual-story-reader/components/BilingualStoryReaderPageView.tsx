"use client";

import {
  Alert,
  Box,
  Button,
  CloseButton,
  Collapsible,
  Combobox,
  EmptyState,
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
import { TileList } from "@components/core/Tiles";
import ContentSection from "@components/page/common/ContentSection";
import {
  RightSidebarSlot,
  RightSidebarTarget,
} from "@components/page/wrapper/RightSidebarSlot";
import { DialogTrigger } from "@components/ui/dialog";
import {
  SiteDialogContent,
  SiteDialogRoot,
  SiteDialogSection,
} from "@components/ui/site-dialog";
import { Clipboard } from "@components/ui/clipboard";
import { Field } from "@components/ui/field";
import { Tooltip } from "@components/ui/tooltip";
import { useRouter } from "next/navigation";
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
} from "react";
import {
  LuBookOpen,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuChevronUp,
  LuClapperboard,
  LuClipboardPaste,
  LuClock,
  LuCopy,
  LuEye,
  LuGraduationCap,
  LuHistory,
  LuLanguages,
  LuListTree,
  LuMessageSquareText,
  LuPencil,
  LuRotateCcw,
  LuSlidersHorizontal,
  LuTrash2,
} from "react-icons/lu";
import type { IconType } from "react-icons";
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
import {
  parseJsonWithCleanup,
  type JsonParseResult,
} from "../services/json-cleanup";
import {
  createStoryHistoryEntry,
  prependStoryHistoryEntryObject,
  readStoryHistory,
  removeStoryHistoryEntry,
  type StoryHistoryEntry,
  writeStoryHistory,
} from "../services/story-history";
import {
  readBilingualStoryReaderSetup,
  writeBilingualStoryReaderSetup,
} from "../services/setup-storage";
import {
  type RenderableStory,
  validateBilingualStoryReaderSchema,
  type StoryValidationResult,
} from "../domain/validate-story";

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
  rounded: "md",
  _placeholder: { color: "app.bilingualStoryReader.fg.subtle" },
} as const;

const ACTION_BUTTON_PROPS = {
  fontFamily: "ui",
  fontSize: "sm",
  rounded: "md",
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

const PROMPT_DIALOG_FOOTER_BUTTON_PROPS = {
  h: 10,
  justifyContent: "center",
  minW: 0,
  px: 3,
  rounded: "full",
  w: "full",
} as const;

const DANGER_BUTTON_PROPS = {
  bg: "red.50",
  color: "red.600",
  _hover: {
    bg: "red.100",
  },
  _dark: {
    bg: "red.950",
    color: "red.200",
    _hover: {
      bg: "red.900",
    },
  },
} as const;

type StoryComboboxOption = {
  value: string;
  label: string;
  prefix?: string;
};

const LANGUAGE_COMBOBOX_OPTIONS =
  BILINGUAL_STORY_READER_LANGUAGE_OPTIONS.filter(
    (language) => language.name !== "Custom",
  ).map((language) => ({
    value: language.name,
    label: language.name,
    prefix: getLabelPrefix(language.label),
  }));

const STORY_THEME_OPTIONS = [
  { value: "Funny", label: "Funny", prefix: "😄" },
  { value: "Scary", label: "Scary", prefix: "👻" },
  { value: "Mystery", label: "Mystery", prefix: "🔎" },
  { value: "Adventure", label: "Adventure", prefix: "🧭" },
  { value: "Fantasy", label: "Fantasy", prefix: "✨" },
  { value: "Romance", label: "Romance", prefix: "💌" },
  { value: "Drama", label: "Drama", prefix: "🎭" },
];

function getLabelPrefix(label: string): string | undefined {
  const prefixEnd = label.indexOf(" ");
  return prefixEnd > 0 ? label.slice(0, prefixEnd) : undefined;
}

function getOptionPrefix(
  options: StoryComboboxOption[],
  value: string,
): string | undefined {
  return options.find((option) => option.value === value)?.prefix;
}

function getSelectedOptionValue(
  options: StoryComboboxOption[],
  value: string,
): string[] {
  const selectedOption = options.find((option) => option.value === value);
  return selectedOption ? [selectedOption.value] : [];
}

function toControlId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ControlLeadingIcon({ icon }: { icon: IconType }) {
  return (
    <Icon
      aria-hidden
      as={icon}
      boxSize={4}
      color="app.bilingualStoryReader.fg.muted"
      left={3}
      pointerEvents="none"
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      zIndex={1}
    />
  );
}

function ControlLeadingPrefix({ prefix }: { prefix: string }) {
  return (
    <Text
      aria-hidden
      fontSize="md"
      left={3}
      lineHeight={1}
      pointerEvents="none"
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      zIndex={1}
    >
      {prefix}
    </Text>
  );
}

function TextareaLeadingIcon({ icon }: { icon: IconType }) {
  return (
    <Icon
      aria-hidden
      as={icon}
      boxSize={4}
      color="app.bilingualStoryReader.fg.muted"
      left={3}
      pointerEvents="none"
      position="absolute"
      top={3}
      zIndex={1}
    />
  );
}

function HistoryMetadataPill({
  icon,
  value,
}: {
  icon: IconType;
  value: string;
}) {
  return (
    <HStack
      as="span"
      bg="transparent"
      color="app.bilingualStoryReader.fg.muted"
      gap={1}
      lineHeight="1.4"
      whiteSpace="nowrap"
    >
      <Icon as={icon} boxSize={3} />
      <Text as="span" fontSize="xs" fontWeight="medium">
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

function formatCount(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function getStorySentenceCount(story: RenderableStory): number {
  return story.paragraphs.reduce(
    (count, paragraph) => count + paragraph.sentences.length,
    0,
  );
}

function StoryCombobox({
  ariaLabel,
  allowClear = true,
  icon,
  iconVisibility = "always",
  onValueChange,
  options,
  placeholder,
  value,
}: {
  ariaLabel: string;
  allowClear?: boolean;
  icon?: IconType;
  iconVisibility?: "always" | "custom-value";
  onValueChange: (value: string) => void;
  options: StoryComboboxOption[];
  placeholder: string;
  value: string;
}) {
  const selectedPrefix = getOptionPrefix(options, value);
  const selectedValue = getSelectedOptionValue(options, value);
  const shouldShowIcon =
    Boolean(icon) &&
    (iconVisibility === "always" ||
      (iconVisibility === "custom-value" && !selectedPrefix));
  const optionsLabelId = `${toControlId(ariaLabel)}-options-label`;
  const { collection, filter } = useListCollection({
    initialItems: options,
    itemToString: (item) => [item.prefix, item.label].filter(Boolean).join(" "),
    itemToValue: (item) => item.value,
    filter: (itemText, filterText, item) => {
      const normalizedFilter = filterText.toLowerCase();
      return (
        itemText.toLowerCase().includes(normalizedFilter) ||
        item.label.toLowerCase().includes(normalizedFilter)
      );
    },
  });

  function hasOptionMatch(filterText: string): boolean {
    const normalizedFilter = filterText.toLowerCase();
    if (!normalizedFilter) return true;
    return options.some((option) => {
      const optionText = [option.prefix, option.label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        optionText.includes(normalizedFilter) ||
        option.label.toLowerCase().includes(normalizedFilter)
      );
    });
  }

  return (
    <Combobox.Root
      allowCustomValue
      collection={collection}
      ids={{ label: optionsLabelId }}
      inputValue={value}
      openOnClick
      positioning={{ sameWidth: true }}
      selectionBehavior="replace"
      value={selectedValue}
      w="full"
      onInputValueChange={(details) => {
        if (details.reason === "item-select") return;
        onValueChange(details.inputValue);
        filter(hasOptionMatch(details.inputValue) ? details.inputValue : "");
      }}
      onValueChange={(details) => {
        const nextValue = details.items[0]?.value ?? details.value[0];
        if (nextValue) onValueChange(nextValue);
      }}
    >
      <Combobox.Label id={optionsLabelId} srOnly>
        Available options
      </Combobox.Label>
      <Combobox.Control position="relative" w="full">
        {selectedPrefix ? (
          <ControlLeadingPrefix prefix={selectedPrefix} />
        ) : shouldShowIcon && icon ? (
          <ControlLeadingIcon icon={icon} />
        ) : null}
        <Combobox.Input
          {...CONTROL_INPUT_PROPS}
          aria-label={ariaLabel}
          ps={selectedPrefix || shouldShowIcon ? 10 : undefined}
          placeholder={placeholder}
        />
        <Combobox.IndicatorGroup>
          {allowClear ? <Combobox.ClearTrigger /> : null}
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner zIndex={30}>
          <Combobox.Content
            bg="app.bilingualStoryReader.bg.popover"
            borderColor="app.bilingualStoryReader.border.default"
            borderWidth="1px"
            p={1}
            rounded="md"
            shadow="none"
          >
            {collection.items.map((option) => (
              <Combobox.Item
                item={option}
                key={option.value}
                px={3}
                py={2}
                rounded="lg"
              >
                <Combobox.ItemText>
                  <HStack gap={2}>
                    {option.prefix ? (
                      <Text aria-hidden fontSize="md" lineHeight={1}>
                        {option.prefix}
                      </Text>
                    ) : null}
                    <Text>{option.label}</Text>
                  </HStack>
                </Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
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
      shadow="none"
      rounded="md"
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
      <SegmentGroup.Indicator
        bg="app.bilingualStoryReader.button.subtle.bg"
        borderColor="app.bilingualStoryReader.button.subtle.divider"
        borderWidth="1px"
        rounded="lg"
        shadow="none"
      />
      {options.map((option) => (
        <SegmentGroup.Item
          color="app.bilingualStoryReader.fg.muted"
          flex="1 1 auto"
          key={option}
          minW={itemMinW}
          px={3}
          rounded="lg"
          transition="background-color 0.2s ease, color 0.2s ease"
          value={option}
          _hover={{
            color: "app.bilingualStoryReader.fg.default",
          }}
          _checked={{
            color: "app.bilingualStoryReader.fg.accent",
            fontWeight: "semibold",
          }}
          _focusVisible={{
            outlineColor: "app.bilingualStoryReader.border.activeSentence",
            outlineOffset: "2px",
            outlineStyle: "solid",
            outlineWidth: "2px",
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
  const router = useRouter();
  const sidebarTarget = useContext(RightSidebarTarget);
  const [hasSidebar, setHasSidebar] = useState(false);

  useEffect(() => {
    const sidebar = sidebarTarget?.closest(".site-right-sidebar");
    if (!sidebar) return;

    // Follow the shell's actual layout, as the EPUB maker does.
    const updateSidebar = () => {
      setHasSidebar(getComputedStyle(sidebar).position === "sticky");
    };
    updateSidebar();
    const observer = new ResizeObserver(updateSidebar);
    observer.observe(sidebar);
    window.addEventListener("resize", updateSidebar);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSidebar);
    };
  }, [sidebarTarget]);
  const [setup, setSetup] = useState<BilingualStoryReaderSetupFormValues>(
    DEFAULT_BILINGUAL_STORY_READER_SETUP,
  );
  const [notices, setNotices] = useState<Notice[]>([]);
  const [rawResponseText, setRawResponseText] = useState("");
  const [isManualPasteOpen, setIsManualPasteOpen] = useState(false);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isPromptEditing, setIsPromptEditing] = useState(false);
  const [isPromptTextareaKeyboardFocused, setIsPromptTextareaKeyboardFocused] =
    useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  const [jsonParseResult, setJsonParseResult] =
    useState<JsonParseResult | null>(null);
  const [storyValidationResult, setStoryValidationResult] =
    useState<StoryValidationResult | null>(null);
  const [storyHistory, setStoryHistory] = useState<StoryHistoryEntry[]>([]);
  const [hasLoadedSetup, setHasLoadedSetup] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const prompt = useMemo(() => buildBilingualStoryReaderPrompt(setup), [setup]);
  const isSetupComplete = isBilingualStoryReaderSetupComplete(setup);
  const promptTextareaKeyboardFocusRef = useRef(false);

  useEffect(() => {
    setSetup(readBilingualStoryReaderSetup());
    setHasLoadedSetup(true);
    setStoryHistory(readStoryHistory());
  }, []);

  useEffect(() => {
    if (!hasLoadedSetup) return;
    writeBilingualStoryReaderSetup(setup);
  }, [hasLoadedSetup, setup]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Tab") {
        promptTextareaKeyboardFocusRef.current = true;
      }
    }

    function handlePointerDown(): void {
      promptTextareaKeyboardFocusRef.current = false;
      setIsPromptTextareaKeyboardFocused(false);
    }

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);

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

  function getStoryRoute(entryId: string): string {
    return `/tools/bilingual-story-reader/story/?id=${encodeURIComponent(entryId)}`;
  }

  function saveStoryToHistory(story: RenderableStory): StoryHistoryEntry {
    const entry = createStoryHistoryEntry(story);
    setStoryHistory((current) => {
      const next = prependStoryHistoryEntryObject(current, entry);
      writeStoryHistory(next);
      return next;
    });
    return entry;
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

    const validationResult = validateBilingualStoryReaderSchema(
      parseResult.value,
    );
    setStoryValidationResult(validationResult);
    if (validationResult.ok) {
      setIsManualPasteOpen(false);
      const entry = saveStoryToHistory(validationResult.value);
      router.push(getStoryRoute(entry.id));
    } else {
      notify(
        "error",
        "Response needs repair",
        "The response is missing story fields.",
      );
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

  function handleManualPaste(
    event: ReactClipboardEvent<HTMLTextAreaElement>,
  ): void {
    const text = event.clipboardData.getData("text/plain");
    if (!text.trim()) return;

    event.preventDefault();
    setRawResponseText(text);
    validateResponseText(text);
  }

  function openHistoryStory(entry: StoryHistoryEntry): void {
    router.push(getStoryRoute(entry.id));
  }

  function formatHistoryLoadedAt(loadedAt: string): string {
    const parsedDate = new Date(loadedAt);
    if (Number.isNaN(parsedDate.getTime())) return loadedAt;
    return parsedDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function removeHistoryEntry(entryId: string): void {
    setStoryHistory((current) => {
      const next = removeStoryHistoryEntry(current, entryId);
      writeStoryHistory(next);
      return next;
    });
  }

  function clearHistory(): void {
    setStoryHistory([]);
    writeStoryHistory([]);
  }

  const historySection = (
    <ContentSection
      aria-label="Story history"
      className="bilingual-story-history"
      data-history-open={isHistoryOpen}
      borderTop={hasSidebar ? 0 : "1px solid var(--site-line)"}
      mx={hasSidebar ? -6 : -4}
      px={hasSidebar ? 6 : 4}
      pt={0}
      pb={0}
    >
      <Collapsible.Root
        open={isHistoryOpen}
        onOpenChange={({ open }) => setIsHistoryOpen(open)}
      >
        <Box
          mx={hasSidebar ? -6 : -4}
          px={hasSidebar ? 6 : 4}
          minH="60px"
          display="flex"
          alignItems="center"
          py={2}
          borderBottom="1px solid var(--site-line)"
        >
          <Collapsible.Trigger asChild>
            <Button
              aria-describedby="story-history-count"
              aria-label={
                isHistoryOpen
                  ? "Collapse story history"
                  : "Expand story history"
              }
              color="app.prose.heading"
              fontFamily="ui"
              fontSize="lg"
              fontWeight="semibold"
              gap={2}
              justifyContent="flex-start"
              px={0}
              w="full"
              bg="transparent"
              variant="plain"
              _hover={{ bg: "transparent" }}
              _active={{ bg: "transparent" }}
              _expanded={{ bg: "transparent" }}
            >
              <Icon color="app.bilingualStoryReader.fg.muted" as={LuHistory} />
              Story History
              <Text
                as="span"
                id="story-history-count"
                aria-label={`${storyHistory.length} saved ${storyHistory.length === 1 ? "story" : "stories"}`}
                aria-live="polite"
                bg="app.bilingualStoryReader.button.primary.bg"
                color="app.bilingualStoryReader.button.primary.fg"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                minW={5}
                h={5}
                px={1.5}
                rounded="full"
                fontSize="xs"
                fontWeight="semibold"
                fontVariantNumeric="tabular-nums"
              >
                {storyHistory.length}
              </Text>
              <Icon
                as={isHistoryOpen ? LuChevronDown : LuChevronRight}
                boxSize={4}
                ms="auto"
              />
            </Button>
          </Collapsible.Trigger>
        </Box>

        <Collapsible.Content overflow={isHistoryOpen ? "visible" : "hidden"}>
          {storyHistory.length === 0 ? (
            <EmptyState.Root>
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <Icon boxSize={9} color="app.bilingualStoryReader.fg.muted">
                    <LuHistory />
                  </Icon>
                </EmptyState.Indicator>
                <EmptyState.Title textAlign="center">
                  No story history yet
                </EmptyState.Title>
                <Text
                  color="app.bilingualStoryReader.fg.muted"
                  fontFamily="ui"
                  fontSize="sm"
                  textAlign="center"
                >
                  Stories you read will appear here.
                </Text>
              </EmptyState.Content>
            </EmptyState.Root>
          ) : (
            <Box
              mx={hasSidebar ? -6 : 0}
              maxH={hasSidebar ? "max(12rem, calc(100dvh - 24rem))" : undefined}
              overflowY={hasSidebar ? "auto" : undefined}
              css={{
                "& [role=separator]": {
                  borderColor: "var(--site-line)",
                  borderTopWidth: "1px",
                  borderTopStyle: "dashed",
                },
              }}
            >
              <TileList feed={!hasSidebar}>
                {storyHistory.map((entry) => (
                  <Box
                    cursor="pointer"
                    key={entry.id}
                    onClick={() => openHistoryStory(entry)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openHistoryStory(entry);
                      }
                    }}
                    px={hasSidebar ? 6 : 4}
                    py={2}
                    role="button"
                    rounded={0}
                    tabIndex={0}
                    transition="background-color 0.2s ease"
                    _hover={{ bg: "app.bilingualStoryReader.bg.subtle" }}
                  >
                    <HStack align="start" justify="space-between" gap={2}>
                      <VStack align="start" flex="1" gap={0.5} minW={0}>
                        <Text
                          color="app.bilingualStoryReader.fg.default"
                          fontFamily="ui"
                          fontSize="sm"
                          lineHeight="1.4"
                          fontWeight="medium"
                          lineClamp={1}
                        >
                          {entry.story.story.title}
                        </Text>
                        <HStack columnGap={2} rowGap={0} wrap="wrap">
                          <HistoryMetadataPill
                            icon={LuLanguages}
                            value={`${entry.story.story.knownLanguage} → ${entry.story.story.targetLanguage}`}
                          />
                          <HistoryMetadataPill
                            icon={LuGraduationCap}
                            value={getLevelLabel(entry.story.story.level)}
                          />
                          <HistoryMetadataPill
                            icon={LuBookOpen}
                            value={formatCount(
                              entry.story.paragraphs.length,
                              "paragraph",
                            )}
                          />
                          <HistoryMetadataPill
                            icon={LuListTree}
                            value={formatCount(
                              getStorySentenceCount(entry.story),
                              "sentence",
                            )}
                          />
                          {entry.story.story.estimatedMinutes ? (
                            <HistoryMetadataPill
                              icon={LuClock}
                              value={`${entry.story.story.estimatedMinutes} min`}
                            />
                          ) : null}
                          {entry.story.story.theme.trim() ? (
                            <HistoryMetadataPill
                              icon={LuClapperboard}
                              value={entry.story.story.theme.trim()}
                            />
                          ) : null}
                        </HStack>
                        <Text
                          color="app.bilingualStoryReader.fg.muted"
                          fontSize="xs"
                        >
                          {formatHistoryLoadedAt(entry.loadedAt)}
                        </Text>
                      </VStack>
                      <Tooltip content="Delete story from history">
                        <IconButton
                          {...ACTION_BUTTON_PROPS}
                          {...DANGER_BUTTON_PROPS}
                          aria-label={`Delete ${entry.story.story.title} from history`}
                          rounded="full"
                          h={8}
                          minW={8}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeHistoryEntry(entry.id);
                          }}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                          }}
                          p={0}
                          size="sm"
                          variant="ghost"
                        >
                          <LuTrash2 />
                        </IconButton>
                      </Tooltip>
                    </HStack>
                  </Box>
                ))}
              </TileList>
            </Box>
          )}
          {storyHistory.length > 0 ? (
            <HStack
              justify="flex-end"
              mx={hasSidebar ? -6 : -4}
              px={hasSidebar ? 6 : 4}
              py={2}
              borderTop="1px solid var(--site-line)"
            >
              <Button
                {...ACTION_BUTTON_PROPS}
                onClick={clearHistory}
                rounded="full"
                size="sm"
                variant="plain"
                color="app.fg.subtle"
                bg="transparent"
                fontSize="xs"
                px={0}
                _hover={{
                  color: "red.600",
                  bg: "transparent",
                  _dark: { color: "red.300" },
                }}
              >
                <Icon>
                  <LuTrash2 />
                </Icon>
                Clear History ({storyHistory.length})
              </Button>
            </HStack>
          ) : null}
        </Collapsible.Content>
      </Collapsible.Root>
    </ContentSection>
  );

  return (
    <VStack align="stretch" gap={0}>
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
                    <CloseButton
                      size="sm"
                      onClick={() => dismissNotice(notice.id)}
                    />
                  </Flex>
                </Alert.Content>
              </Alert.Root>
            ))}
          </VStack>
        </Box>
      ) : null}

      <ContentSection pb={0}>
        <VStack align="stretch" gap={4} minW={0}>
          <HStack align="center" justify="space-between" wrap="wrap">
            <HStack gap={2}>
              <Icon color="app.bilingualStoryReader.fg.muted">
                <LuSlidersHorizontal />
              </Icon>
              <Text fontFamily="ui" fontSize="lg" fontWeight="semibold">
                Story Setup
              </Text>
            </HStack>
          </HStack>
          <Box>
            <Box pb={4}>
              <VStack align="stretch" gap={4}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                  <Field label="Known language">
                    <StoryCombobox
                      allowClear={false}
                      ariaLabel="Known language"
                      icon={LuLanguages}
                      iconVisibility="custom-value"
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
                      allowClear={false}
                      ariaLabel="Target language"
                      icon={LuLanguages}
                      iconVisibility="custom-value"
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
                    <Box position="relative" w="full">
                      <ControlLeadingIcon icon={LuGraduationCap} />
                      <NativeSelect.Root w="full">
                        <NativeSelect.Field
                          {...CONTROL_INPUT_PROPS}
                          aria-label="Level"
                          ps={10}
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
                              {getLevelLabel(level)}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Box>
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
                    icon={LuClapperboard}
                    options={STORY_THEME_OPTIONS}
                    placeholder="Search or type a theme"
                    value={setup.theme}
                    onValueChange={(value) => updateTextField("theme", value)}
                  />
                </Field>

                <Field label="Extra instructions">
                  <Box position="relative" w="full">
                    <TextareaLeadingIcon icon={LuMessageSquareText} />
                    <Textarea
                      {...CONTROL_INPUT_PROPS}
                      aria-label="Extra instructions"
                      placeholder="Use simple dialogue or include romanization."
                      ps={10}
                      value={setup.extraInstructions}
                      onChange={(event) =>
                        updateTextField(
                          "extraInstructions",
                          event.currentTarget.value,
                        )
                      }
                    />
                  </Box>
                </Field>
              </VStack>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={3}
              justifyContent="flex-end"
              pb={4}
            >
              <HStack gap={0}>
                <Box>
                  <Clipboard.Root value={prompt} timeout={1000}>
                    <Clipboard.Trigger asChild>
                      <Button
                        {...ACTION_BUTTON_PROPS}
                        {...PRIMARY_BUTTON_PROPS}
                        aria-label="Copy Prompt"
                        borderRightWidth={0}
                        disabled={!isSetupComplete}
                        h={12}
                        px={4}
                        roundedLeft="full"
                        roundedRight={0}
                      >
                        <HStack gap={2}>
                          <Clipboard.Indicator copied={<Icon as={LuCheck} />}>
                            <Icon as={LuCopy} />
                          </Clipboard.Indicator>
                          <Clipboard.Indicator copied="Copied">
                            <Text>Copy Prompt</Text>
                          </Clipboard.Indicator>
                        </HStack>
                      </Button>
                    </Clipboard.Trigger>
                  </Clipboard.Root>
                </Box>
                <SiteDialogRoot
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
                        borderLeftColor="app.bilingualStoryReader.button.primary.divider"
                        borderLeftWidth="1px"
                        disabled={!isSetupComplete}
                        h={12}
                        minW={12}
                        roundedLeft={0}
                        roundedRight="full"
                      >
                        <LuEye />
                      </IconButton>
                    </DialogTrigger>
                  </Tooltip>

                  <SiteDialogContent title="Generated prompt" maxWidth="720px">
                    <VStack align="stretch" gap={0}>
                      <SiteDialogSection>
                        <Text color="app.fg.subtle" fontSize="sm">
                          Edits are temporary and are not saved to the setup.
                        </Text>
                      </SiteDialogSection>
                      <SiteDialogSection px={0} py={0}>
                        <Box position="relative">
                          <Textarea
                            {...CONTROL_INPUT_PROPS}
                            aria-label="Generated prompt"
                            borderWidth={0}
                            p={{ base: 4, md: 6 }}
                            fontFamily="mono"
                            h="min(45dvh, 400px)"
                            minH="12rem"
                            maxH="60dvh"
                            onChange={(event) =>
                              setPromptDraft(event.currentTarget.value)
                            }
                            onBlur={() =>
                              setIsPromptTextareaKeyboardFocused(false)
                            }
                            onFocus={() =>
                              setIsPromptTextareaKeyboardFocused(
                                promptTextareaKeyboardFocusRef.current,
                              )
                            }
                            onPointerDown={() => {
                              promptTextareaKeyboardFocusRef.current = false;
                              setIsPromptTextareaKeyboardFocused(false);
                            }}
                            readOnly={!isPromptEditing}
                            rounded={0}
                            value={promptDraft}
                            _focus={{
                              borderColor:
                                "app.bilingualStoryReader.border.default",
                              boxShadow: "none",
                              outline: "none",
                            }}
                            _focusVisible={
                              isPromptTextareaKeyboardFocused
                                ? {
                                    borderColor:
                                      "app.bilingualStoryReader.border.default",
                                    boxShadow: "none",
                                    outlineColor: "blue.500",
                                    outlineOffset: "-2px",
                                    outlineStyle: "solid",
                                    outlineWidth: "2px",
                                  }
                                : {
                                    borderColor:
                                      "app.bilingualStoryReader.border.default",
                                    boxShadow: "none",
                                    outline: "none",
                                  }
                            }
                          />
                        </Box>
                      </SiteDialogSection>
                      <SiteDialogSection>
                        <Grid
                          templateColumns="repeat(3, minmax(0, 1fr))"
                          gap={2}
                          w="full"
                        >
                          <Button
                            {...ACTION_BUTTON_PROPS}
                            {...PROMPT_DIALOG_FOOTER_BUTTON_PROPS}
                            aria-pressed={isPromptEditing}
                            bg={
                              isPromptEditing
                                ? "app.bilingualStoryReader.button.primary.bg"
                                : "app.bilingualStoryReader.button.subtle.bg"
                            }
                            color={
                              isPromptEditing
                                ? "app.bilingualStoryReader.button.primary.fg"
                                : "app.bilingualStoryReader.button.subtle.fg"
                            }
                            onClick={() =>
                              setIsPromptEditing((current) => !current)
                            }
                            _hover={{
                              bg: isPromptEditing
                                ? "app.bilingualStoryReader.button.primary.hoverBg"
                                : "app.bilingualStoryReader.button.subtle.hoverBg",
                            }}
                          >
                            <Icon as={LuPencil} />
                            Edit
                          </Button>
                          <Box minW={0}>
                            <Clipboard.Root value={promptDraft} timeout={1000}>
                              <Clipboard.Trigger asChild>
                                <Button
                                  {...ACTION_BUTTON_PROPS}
                                  {...PRIMARY_BUTTON_PROPS}
                                  {...PROMPT_DIALOG_FOOTER_BUTTON_PROPS}
                                  aria-label="Copy generated prompt"
                                >
                                  <Clipboard.Indicator
                                    copied={<Icon as={LuCheck} />}
                                  >
                                    <Icon as={LuCopy} />
                                  </Clipboard.Indicator>
                                  Copy
                                </Button>
                              </Clipboard.Trigger>
                            </Clipboard.Root>
                          </Box>
                          <Button
                            {...ACTION_BUTTON_PROPS}
                            {...PROMPT_DIALOG_FOOTER_BUTTON_PROPS}
                            {...DANGER_BUTTON_PROPS}
                            aria-label="Reset generated prompt"
                            onClick={() => setPromptDraft(prompt)}
                          >
                            <Icon as={LuRotateCcw} />
                            Reset
                          </Button>
                        </Grid>
                      </SiteDialogSection>
                    </VStack>
                  </SiteDialogContent>
                </SiteDialogRoot>
              </HStack>
              <Popover.Root
                open={isManualPasteOpen}
                onOpenChange={(details) => setIsManualPasteOpen(details.open)}
                positioning={{ placement: "bottom-end", gutter: 6 }}
              >
                <Box>
                  <HStack align="stretch" gap={0}>
                    <Button
                      {...ACTION_BUTTON_PROPS}
                      borderWidth={0}
                      {...SUBTLE_BUTTON_PROPS}
                      onClick={pasteResponseFromClipboard}
                      h={12}
                      px={4}
                      roundedLeft="full"
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
                        h={12}
                        minW={12}
                        roundedLeft={0}
                        roundedRight="full"
                        variant="outline"
                      >
                        {isManualPasteOpen ? (
                          <LuChevronUp />
                        ) : (
                          <LuChevronDown />
                        )}
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
                    shadow="none"
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
            </Box>
          </Box>

          {jsonParseResult || storyValidationResult ? (
            <VStack align="stretch" gap={2} id="ai-response-validation" pb={4}>
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
                  Story saved.
                </Text>
              ) : null}

              {jsonParseResult && !jsonParseResult.ok
                ? jsonParseResult.errors.map((error) => (
                    <Text
                      color="red.600"
                      fontSize="sm"
                      key={error.message}
                      role="alert"
                    >
                      {error.line && error.column
                        ? `${error.message} Line ${error.line}, column ${error.column}.`
                        : error.message}
                    </Text>
                  ))
                : null}

              {storyValidationResult && !storyValidationResult.ok
                ? storyValidationResult.errors.map((error) => (
                    <Text
                      color="red.600"
                      fontSize="sm"
                      key={error.path}
                      role="alert"
                    >
                      {error.path}: {error.message}
                    </Text>
                  ))
                : null}
            </VStack>
          ) : null}
        </VStack>
      </ContentSection>

      {hasSidebar && sidebarTarget ? (
        <RightSidebarSlot>{historySection}</RightSidebarSlot>
      ) : (
        historySection
      )}
    </VStack>
  );
}
