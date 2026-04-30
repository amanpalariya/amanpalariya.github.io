"use client";

import {
  Box,
  Button,
  Card,
  Grid,
  HStack,
  Icon,
  NativeSelect,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Field, Fieldset } from "@components/ui/field";
import { NumberInput } from "@components/ui/number-input";
import { ShortcutHint } from "@components/core/ShortcutHint";
import { Switch } from "@components/ui/switch";
import HighlightedSection from "@components/page/common/HighlightedSection";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  LuCalendarRange,
  LuChevronDown,
  LuCornerDownLeft,
  LuKeyboard,
  LuPlay,
  LuRotateCcw,
  LuSettings2,
} from "react-icons/lu";
import {
  createDefaultPracticeSettings,
  readCalendarDrillSettings,
  writeCalendarDrillSettings,
} from "../services/settings-storage";
import type { PracticeSettings } from "../types";
import type {
  AnswerState,
  PracticeQuestion,
  PracticeStats,
  PracticeTrends,
  SessionStatus,
} from "./models";
import {
  buildQuestion,
  clampYear,
  createInitialPracticeStats,
  createInitialPracticeTrends,
  ALL_MONTHS,
  formatDateHuman,
  MONTH_LABELS,
  MAX_ALLOWED_YEAR,
  MIN_ALLOWED_YEAR,
  normalizeSelectedMonths,
  normalizeYearRange,
  toDisplayedAvgMs,
} from "./practice-utils";
import { ChoiceButton } from "./ChoiceButton";
import { SessionStatsCard } from "./SessionStatsCard";

const CALENDAR_DRILL_PRIMARY_ACTION_BUTTON_STYLES = {
  bg: "app.calendarDrill.button.primary.bg",
  color: "app.calendarDrill.button.primary.fg",
  _hover: {
    bg: "app.calendarDrill.button.primary.hoverBg",
  },
} as const;

const DATE_FORMAT_OPTIONS: {
  value: PracticeSettings["dateFormat"];
  label: string;
}[] = [
  { value: "month-day-year", label: "Apr 30, 2026" },
  { value: "day-month-year", label: "30 Apr 2026" },
  { value: "iso", label: "2026-04-30" },
];

type MonthDragMode = "select" | "deselect" | null;

function isTextEntryInputElement(input: HTMLInputElement): boolean {
  const inputType = input.type.toLowerCase();

  return inputType !== "checkbox" && inputType !== "radio";
}

function isKeyboardEventFromInteractiveElement(
  target: EventTarget | null,
): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  if (target instanceof HTMLInputElement) {
    return isTextEntryInputElement(target);
  }

  if (
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }

  const closestInput = target.closest("input");
  if (closestInput instanceof HTMLInputElement) {
    return isTextEntryInputElement(closestInput);
  }

  return Boolean(
    target.closest(
      "textarea, select, button, a[href], [role='button'], [contenteditable='true']",
    ),
  );
}

export function CalendarDrillPage() {
  const [settingsDraft, setSettingsDraft] = useState<PracticeSettings>(
    createDefaultPracticeSettings,
  );
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const monthDragModeRef = useRef<MonthDragMode>(null);
  const didHandleMonthPointerRef = useRef(false);

  const [settings, setSettings] = useState<PracticeSettings>(settingsDraft);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const [status, setStatus] = useState<SessionStatus>("idle");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(0);
  const [answerState, setAnswerState] = useState<AnswerState | null>(null);
  const [prefix, setPrefix] = useState("");

  const [stats, setStats] = useState<PracticeStats>(createInitialPracticeStats);
  const [trends, setTrends] = useState<PracticeTrends>(
    createInitialPracticeTrends,
  );

  const accuracy =
    stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const avgResponseMs =
    stats.attempts > 0 ? Math.round(stats.totalResponseMs / stats.attempts) : 0;
  const displayedAvgResponseMs =
    avgResponseMs > 0 ? toDisplayedAvgMs(avgResponseMs) : 0;
  const selectedMonths = normalizeSelectedMonths(settingsDraft.selectedMonths);
  const areAllMonthsSelected = selectedMonths.length === ALL_MONTHS.length;
  const currentLocaleDateFormatLabel = `Current locale (${formatDateHuman(
    { year: 2026, month: 4, day: 30 },
    "locale",
  )})`;
  const dateFormatOptions = [
    {
      value: "locale" as const,
      label: currentLocaleDateFormatLabel,
    },
    ...DATE_FORMAT_OPTIONS,
  ];
  const selectedDateFormatLabel =
    dateFormatOptions.find(
      (option) => option.value === settingsDraft.dateFormat,
    )?.label ?? currentLocaleDateFormatLabel;
  const monthFilterLabel =
    areAllMonthsSelected || selectedMonths.length === 0
      ? "All months"
      : `${selectedMonths.length} month${selectedMonths.length === 1 ? "" : "s"}`;
  const advancedSettingsSummary = `${monthFilterLabel} · ${selectedDateFormatLabel}`;

  const requiredPrefixLengthByChoiceValue = useMemo(() => {
    if (!question) return new Map<string, number>();

    const result = new Map<string, number>();
    const choices = question.choices;

    for (const choice of choices) {
      const lowerLabel = choice.label.toLowerCase();
      let requiredLength = lowerLabel.length;

      for (
        let prefixLength = 1;
        prefixLength <= lowerLabel.length;
        prefixLength += 1
      ) {
        const prefixSlice = lowerLabel.slice(0, prefixLength);
        const isUnique = choices.every(
          (otherChoice) =>
            otherChoice.value === choice.value ||
            !otherChoice.label.toLowerCase().startsWith(prefixSlice),
        );

        if (isUnique) {
          requiredLength = prefixLength;
          break;
        }
      }

      result.set(choice.value, requiredLength);
    }

    return result;
  }, [question]);

  useEffect(() => {
    const savedSettings = readCalendarDrillSettings();
    setSettingsDraft(savedSettings);
    setSettings(savedSettings);
    setIsSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isSettingsLoaded) return;
    writeCalendarDrillSettings(settingsDraft);
  }, [isSettingsLoaded, settingsDraft]);

  const startSession = useCallback(() => {
    const normalizedRange = normalizeYearRange(
      settingsDraft.minYear,
      settingsDraft.maxYear,
    );
    const nextSettings: PracticeSettings = {
      ...settingsDraft,
      ...normalizedRange,
      selectedMonths: normalizeSelectedMonths(settingsDraft.selectedMonths),
    };

    setSettings(nextSettings);
    setSettingsDraft(nextSettings);
    setStats(createInitialPracticeStats());
    setTrends(createInitialPracticeTrends());
    setQuestionIndex(0);
    setAnswerState(null);
    setPrefix("");

    const first = buildQuestion(nextSettings);
    setQuestion(first);
    setQuestionStartedAt(Date.now());
    setStatus("running");
  }, [settingsDraft]);

  const submitAnswer = useCallback(
    (choiceValue: string) => {
      if (!question || status !== "running" || answerState) return;

      const responseMs = Math.max(1, Date.now() - questionStartedAt);
      const isCorrect = choiceValue === question.correctValue;

      const previousAccuracy =
        stats.attempts > 0
          ? Math.round((stats.correct / stats.attempts) * 100)
          : null;
      const previousAvgResponseDisplayMs =
        stats.attempts > 0
          ? toDisplayedAvgMs(Math.round(stats.totalResponseMs / stats.attempts))
          : null;

      const attempts = stats.attempts + 1;
      const correct = stats.correct + (isCorrect ? 1 : 0);
      const streak = isCorrect ? stats.streak + 1 : 0;
      const bestStreak = Math.max(stats.bestStreak, streak);
      const totalResponseMs = stats.totalResponseMs + responseMs;
      const nextStats: PracticeStats = {
        attempts,
        correct,
        streak,
        bestStreak,
        totalResponseMs,
      };

      const nextAccuracy = Math.round(
        (nextStats.correct / nextStats.attempts) * 100,
      );
      const nextAvgResponseDisplayMs = toDisplayedAvgMs(
        Math.round(nextStats.totalResponseMs / nextStats.attempts),
      );

      setAnswerState({ selectedValue: choiceValue, isCorrect, responseMs });
      setStats(nextStats);
      setTrends({
        accuracyDelta:
          previousAccuracy === null ? null : nextAccuracy - previousAccuracy,
        avgResponseDeltaMs:
          previousAvgResponseDisplayMs === null
            ? null
            : nextAvgResponseDisplayMs - previousAvgResponseDisplayMs,
      });

      setPrefix("");
    },
    [answerState, question, questionStartedAt, stats, status],
  );

  const nextQuestion = useCallback(() => {
    if (!question || !answerState) return;

    const next = buildQuestion(settings);
    setQuestion(next);
    setQuestionIndex((current) => current + 1);
    setQuestionStartedAt(Date.now());
    setAnswerState(null);
    setPrefix("");
  }, [answerState, question, settings]);

  function resetSession() {
    setStatus("idle");
    setQuestion(null);
    setQuestionIndex(0);
    setAnswerState(null);
    setPrefix("");
    setStats(createInitialPracticeStats());
    setTrends(createInitialPracticeTrends());
  }

  function toggleAllMonths() {
    setSettingsDraft((current) => ({
      ...current,
      selectedMonths:
        normalizeSelectedMonths(current.selectedMonths).length ===
        ALL_MONTHS.length
          ? []
          : [...ALL_MONTHS],
    }));
  }

  function setMonthSelected(month: number, shouldSelect: boolean) {
    setSettingsDraft((current) => {
      const currentMonths = normalizeSelectedMonths(current.selectedMonths);
      const isSelected = currentMonths.includes(month);

      if (shouldSelect) {
        if (isSelected) return current;

        return {
          ...current,
          selectedMonths: normalizeSelectedMonths([...currentMonths, month]),
        };
      }

      if (!isSelected) return current;

      return {
        ...current,
        selectedMonths: normalizeSelectedMonths(
          currentMonths.filter((selectedMonth) => selectedMonth !== month),
        ),
      };
    });
  }

  function toggleMonth(month: number) {
    setSettingsDraft((current) => {
      const currentMonths = normalizeSelectedMonths(current.selectedMonths);
      const nextMonths = currentMonths.includes(month)
        ? currentMonths.filter((selectedMonth) => selectedMonth !== month)
        : [...currentMonths, month];

      return {
        ...current,
        selectedMonths: normalizeSelectedMonths(nextMonths),
      };
    });
  }

  function beginMonthDrag(
    month: number,
    isSelected: boolean,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const shouldSelect = !isSelected;
    monthDragModeRef.current = shouldSelect ? "select" : "deselect";
    didHandleMonthPointerRef.current = true;
    setMonthSelected(month, shouldSelect);
  }

  function applyMonthDrag(month: number) {
    const dragMode = monthDragModeRef.current;
    if (!dragMode) return;

    didHandleMonthPointerRef.current = true;
    setMonthSelected(month, dragMode === "select");
  }

  function applyMonthDragFromPointer(event: ReactPointerEvent<HTMLElement>) {
    const dragMode = monthDragModeRef.current;
    if (!dragMode) return;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const monthElement =
      target instanceof Element
        ? target.closest("[data-calendar-drill-month]")
        : null;
    const month = Number(
      monthElement?.getAttribute("data-calendar-drill-month"),
    );

    if (Number.isInteger(month)) {
      applyMonthDrag(month);
    }
  }

  useEffect(() => {
    if (status !== "running" || !question || answerState) return;
    const activeQuestion = question;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const pressedKey = event.key.toLowerCase();

      if (/^[0-9]$/.test(pressedKey)) {
        event.preventDefault();
        const shortcutMatch = activeQuestion.choices.find(
          (choice) => choice.shortcutKey === pressedKey,
        );
        if (shortcutMatch) {
          submitAnswer(shortcutMatch.value);
        }
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setPrefix((current) => current.slice(0, -1));
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setPrefix("");
        return;
      }

      if (!/^[a-z]$/.test(pressedKey)) return;

      event.preventDefault();
      const nextPrefix = `${prefix}${pressedKey}`;
      const matches = activeQuestion.choices.filter((choice) =>
        choice.label.toLowerCase().startsWith(nextPrefix),
      );

      if (matches.length === 0) return;

      setPrefix(nextPrefix);

      if (matches.length === 1) {
        submitAnswer(matches[0].value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, question, answerState, prefix, submitAnswer]);

  useEffect(() => {
    function onGlobalEnter(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      if (event.key !== "Enter") return;
      if (isKeyboardEventFromInteractiveElement(event.target)) return;

      if (status === "idle") {
        event.preventDefault();
        startSession();
        return;
      }

      if (status === "running" && answerState) {
        event.preventDefault();
        nextQuestion();
      }
    }

    window.addEventListener("keydown", onGlobalEnter);
    return () => window.removeEventListener("keydown", onGlobalEnter);
  }, [status, answerState, nextQuestion, startSession]);

  useEffect(() => {
    function stopMonthDrag() {
      monthDragModeRef.current = null;
    }

    window.addEventListener("pointerup", stopMonthDrag);
    window.addEventListener("pointercancel", stopMonthDrag);
    return () => {
      window.removeEventListener("pointerup", stopMonthDrag);
      window.removeEventListener("pointercancel", stopMonthDrag);
    };
  }, []);

  return (
    <VStack align={"stretch"} gap={4} pt={4} pb={0}>
      <Box w={"full"} px={[4, 6]}>
        <VStack align={"stretch"} gap={4}>
          <SessionStatsCard
            showPlaceholderStats={status === "idle"}
            accuracy={accuracy}
            attempts={stats.attempts}
            avgResponseMs={avgResponseMs}
            displayedAvgResponseMs={displayedAvgResponseMs}
            streak={stats.streak}
            trends={trends}
          />

          <Box mx={{ base: -4, md: -6 }}>
            <HighlightedSection
              contentPx={{ base: 3, md: 4 }}
              contentPy={{ base: 3, md: 4 }}
            >
              <Card.Root
                borderColor={"app.border.default"}
                rounded={"2xl"}
                overflow={"hidden"}
              >
                <Card.Body>
                  <VStack align={"stretch"} gap={4}>
                    {status === "running" && question ? (
                      <VStack align={"stretch"} gap={4}>
                        <HStack
                          justify={"space-between"}
                          align={"center"}
                          gap={3}
                          wrap={"wrap"}
                        >
                          <HStack align={"center"} gap={2} wrap={"wrap"}>
                            <Box
                              as={"span"}
                              minW={8}
                              h={8}
                              display={"inline-flex"}
                              alignItems={"center"}
                              justifyContent={"center"}
                              rounded={"full"}
                              borderWidth={"1px"}
                              borderColor={"app.border.default"}
                              color={"app.fg.subtle"}
                              fontSize={"sm"}
                              fontWeight={"medium"}
                            >
                              {questionIndex + 1}
                            </Box>
                            <Text fontSize={"2xl"} fontWeight={"normal"}>
                              <Text
                                as={"span"}
                                color={"app.fg.muted"}
                                fontWeight={"normal"}
                              >
                                Weekday for
                              </Text>{" "}
                              <Text as={"span"} fontWeight={"semibold"}>
                                {question.formattedDate}
                              </Text>
                              <Text
                                as={"span"}
                                color={"app.fg.muted"}
                                fontWeight={"normal"}
                              >
                                ?
                              </Text>
                            </Text>
                          </HStack>
                        </HStack>

                        <Grid
                          templateColumns={["repeat(2, 1fr)", "repeat(4, 1fr)"]}
                          gap={3}
                        >
                          {question.choices.map((choice) => {
                            const hasAnswered = Boolean(answerState);
                            const hasPrefix = prefix.length > 0;

                            return (
                              <ChoiceButton
                                key={choice.value}
                                choice={choice}
                                requiredPrefixLength={
                                  requiredPrefixLengthByChoiceValue.get(
                                    choice.value,
                                  ) ?? 1
                                }
                                correctValue={question.correctValue}
                                selectedValue={answerState?.selectedValue}
                                hasAnswered={hasAnswered}
                                hasPrefix={hasPrefix}
                                isSessionRunning={status === "running"}
                                prefix={prefix}
                                onSelect={submitAnswer}
                              />
                            );
                          })}
                        </Grid>
                      </VStack>
                    ) : (
                      <Fieldset.Root>
                        <Fieldset.Legend>
                          <HStack gap={2}>
                            <Icon as={LuCalendarRange} />
                            <Text>Year Range</Text>
                          </HStack>
                        </Fieldset.Legend>
                        <Fieldset.Content>
                          <VStack align={"stretch"} gap={4}>
                            <Grid
                              templateColumns={[
                                "1fr",
                                "repeat(3, minmax(0, 1fr))",
                              ]}
                              gap={3}
                              alignItems={"end"}
                            >
                              <Field.Root w={"full"}>
                                <Field.Label>From Year</Field.Label>
                                <NumberInput.Root
                                  w={"full"}
                                  value={String(settingsDraft.minYear)}
                                  min={MIN_ALLOWED_YEAR}
                                  max={MAX_ALLOWED_YEAR}
                                  onValueChange={(details) => {
                                    const parsed = Number(details.value);
                                    if (!Number.isNaN(parsed)) {
                                      const minYear = clampYear(parsed);
                                      setSettingsDraft((current) => ({
                                        ...current,
                                        minYear,
                                        maxYear: Math.max(
                                          minYear,
                                          current.maxYear,
                                        ),
                                      }));
                                    }
                                  }}
                                >
                                  <NumberInput.Control />
                                  <NumberInput.Input
                                    rounded={"xl"}
                                    w={"full"}
                                  />
                                </NumberInput.Root>
                              </Field.Root>

                              <Field.Root w={"full"}>
                                <Field.Label>To Year</Field.Label>
                                <NumberInput.Root
                                  w={"full"}
                                  value={String(settingsDraft.maxYear)}
                                  min={MIN_ALLOWED_YEAR}
                                  max={MAX_ALLOWED_YEAR}
                                  onValueChange={(details) => {
                                    const parsed = Number(details.value);
                                    if (!Number.isNaN(parsed)) {
                                      const maxYear = clampYear(parsed);
                                      setSettingsDraft((current) => ({
                                        ...current,
                                        minYear: Math.min(
                                          current.minYear,
                                          maxYear,
                                        ),
                                        maxYear,
                                      }));
                                    }
                                  }}
                                >
                                  <NumberInput.Control />
                                  <NumberInput.Input
                                    rounded={"xl"}
                                    w={"full"}
                                  />
                                </NumberInput.Root>
                              </Field.Root>

                              <Button
                                w={"full"}
                                rounded={"xl"}
                                variant={"outline"}
                                onClick={() => {
                                  const currentYear = new Date().getFullYear();
                                  setSettingsDraft((current) => ({
                                    ...current,
                                    minYear: currentYear,
                                    maxYear: currentYear,
                                  }));
                                }}
                              >
                                Current Year
                              </Button>
                            </Grid>

                            <VStack align={"stretch"} gap={3}>
                              <Button
                                variant={"ghost"}
                                justifyContent={"space-between"}
                                rounded={"xl"}
                                px={3}
                                h={"auto"}
                                py={3}
                                onClick={() =>
                                  setIsAdvancedSettingsOpen(
                                    (current) => !current,
                                  )
                                }
                                aria-expanded={isAdvancedSettingsOpen}
                              >
                                <HStack gap={3} minW={0}>
                                  <Icon as={LuSettings2} />
                                  <VStack align={"start"} gap={0} minW={0}>
                                    <Text>Advanced Settings</Text>
                                    <Text
                                      fontSize={"xs"}
                                      color={"app.fg.subtle"}
                                      truncate
                                    >
                                      {advancedSettingsSummary}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <Icon
                                  as={LuChevronDown}
                                  transform={
                                    isAdvancedSettingsOpen
                                      ? "rotate(180deg)"
                                      : undefined
                                  }
                                  transition={"transform 0.15s ease"}
                                />
                              </Button>

                              {isAdvancedSettingsOpen ? (
                                <VStack
                                  align={"stretch"}
                                  gap={5}
                                  borderWidth={"1px"}
                                  borderColor={"app.border.default"}
                                  rounded={"xl"}
                                  bg={"app.bg.subtle"}
                                  p={{ base: 3, md: 4 }}
                                >
                                  <VStack align={"stretch"} gap={3}>
                                    <HStack justify={"space-between"} gap={3}>
                                      <HStack gap={2}>
                                        <Icon
                                          as={LuCalendarRange}
                                          color={"app.fg.subtle"}
                                        />
                                        <Text fontWeight={"medium"}>
                                          Date Display
                                        </Text>
                                      </HStack>
                                    </HStack>

                                    <Field.Root w={"full"}>
                                      <Field.Label>Date Format</Field.Label>
                                      <NativeSelect.Root w={"full"}>
                                        <NativeSelect.Field
                                          rounded={"xl"}
                                          bg={"app.bg.default"}
                                          value={settingsDraft.dateFormat}
                                          aria-label={"Select date format"}
                                          onChange={(event) => {
                                            const dateFormat = event
                                              .currentTarget
                                              .value as PracticeSettings["dateFormat"];
                                            setSettingsDraft((current) => ({
                                              ...current,
                                              dateFormat,
                                            }));
                                          }}
                                        >
                                          {dateFormatOptions.map((option) => (
                                            <option
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </option>
                                          ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                      </NativeSelect.Root>
                                    </Field.Root>
                                  </VStack>

                                  <Box
                                    h={"1px"}
                                    bg={"app.border.default"}
                                    aria-hidden={"true"}
                                  />

                                  <VStack align={"stretch"} gap={3}>
                                    <HStack
                                      justify={"space-between"}
                                      gap={3}
                                      wrap={"wrap"}
                                    >
                                      <HStack gap={2}>
                                        <Icon
                                          as={LuCalendarRange}
                                          color={"app.fg.subtle"}
                                        />
                                        <Text fontWeight={"medium"}>
                                          Month Filter
                                        </Text>
                                      </HStack>
                                      <HStack>
                                        <Button
                                          size={"xs"}
                                          rounded={"full"}
                                          variant={
                                            areAllMonthsSelected
                                              ? "subtle"
                                              : "outline"
                                          }
                                          aria-pressed={areAllMonthsSelected}
                                          onClick={toggleAllMonths}
                                        >
                                          All
                                        </Button>
                                      </HStack>
                                    </HStack>

                                    <Grid
                                      templateColumns={[
                                        "repeat(3, minmax(0, 1fr))",
                                        "repeat(6, minmax(0, 1fr))",
                                      ]}
                                      gap={2}
                                      onPointerMove={applyMonthDragFromPointer}
                                    >
                                      {ALL_MONTHS.map((month) => {
                                        const isSelected =
                                          selectedMonths.includes(month);

                                        return (
                                          <Button
                                            key={month}
                                            data-calendar-drill-month={month}
                                            size={"sm"}
                                            rounded={"lg"}
                                            variant={
                                              isSelected ? "subtle" : "ghost"
                                            }
                                            colorPalette={"gray"}
                                            borderWidth={0}
                                            bg={
                                              isSelected
                                                ? "app.bg.surface"
                                                : "transparent"
                                            }
                                            color={
                                              isSelected
                                                ? "app.fg.default"
                                                : undefined
                                            }
                                            _hover={{ bg: "app.bg.surface" }}
                                            aria-pressed={isSelected}
                                            onPointerDown={(event) =>
                                              beginMonthDrag(
                                                month,
                                                isSelected,
                                                event,
                                              )
                                            }
                                            onPointerEnter={() =>
                                              applyMonthDrag(month)
                                            }
                                            onClick={() => {
                                              if (
                                                didHandleMonthPointerRef.current
                                              ) {
                                                didHandleMonthPointerRef.current = false;
                                                return;
                                              }

                                              toggleMonth(month);
                                            }}
                                          >
                                            {MONTH_LABELS[month - 1]}
                                          </Button>
                                        );
                                      })}
                                    </Grid>
                                  </VStack>

                                  <Box
                                    h={"1px"}
                                    bg={"app.border.default"}
                                    aria-hidden={"true"}
                                  />

                                  <VStack align={"stretch"} gap={3}>
                                    <HStack gap={2}>
                                      <Icon
                                        as={LuKeyboard}
                                        color={"app.fg.subtle"}
                                      />
                                      <Text fontWeight={"medium"}>
                                        Weekdays Layout
                                      </Text>
                                    </HStack>

                                    <Grid
                                      templateColumns={[
                                        "1fr",
                                        "repeat(2, minmax(0, 1fr))",
                                      ]}
                                      gap={{ base: 3, md: 6 }}
                                    >
                                      <Switch
                                        checked={
                                          settingsDraft.weekStartDay ===
                                          "monday"
                                        }
                                        onCheckedChange={(details) => {
                                          const weekStartDay = details.checked
                                            ? "monday"
                                            : "sunday";
                                          setSettingsDraft((current) => ({
                                            ...current,
                                            weekStartDay,
                                          }));
                                        }}
                                      >
                                        Monday as first day
                                      </Switch>

                                      <Switch
                                        checked={
                                          settingsDraft.firstDayNumberBase === 0
                                        }
                                        onCheckedChange={(details) => {
                                          const firstDayNumberBase =
                                            details.checked ? 0 : 1;
                                          setSettingsDraft((current) => ({
                                            ...current,
                                            firstDayNumberBase,
                                          }));
                                        }}
                                      >
                                        First day starts at 0
                                      </Switch>
                                    </Grid>
                                  </VStack>
                                </VStack>
                              ) : null}
                            </VStack>
                          </VStack>
                        </Fieldset.Content>
                      </Fieldset.Root>
                    )}
                  </VStack>
                </Card.Body>
                <Card.Footer p={0} w={"full"}>
                  {status === "running" ? (
                    <HStack w={"full"} gap={0}>
                      <Button
                        flex={1}
                        rounded={0}
                        h={12}
                        onClick={nextQuestion}
                        disabled={!answerState}
                        {...CALENDAR_DRILL_PRIMARY_ACTION_BUTTON_STYLES}
                        justifyContent={"center"}
                        px={4}
                        position={"relative"}
                      >
                        <HStack gap={2}>
                          <Icon as={LuPlay} />
                          <Text>Next</Text>
                        </HStack>
                        {answerState ? (
                          <Box
                            position={"absolute"}
                            insetEnd={{ base: 2, sm: 4 }}
                          >
                            <Box display={{ base: "none", sm: "block" }}>
                              <ShortcutHint
                                icon={LuCornerDownLeft}
                                label={"Enter"}
                              />
                            </Box>
                            <Box display={{ base: "block", sm: "none" }}>
                              <ShortcutHint
                                icon={LuCornerDownLeft}
                                label={""}
                              />
                            </Box>
                          </Box>
                        ) : null}
                      </Button>
                      <Button
                        flex={1}
                        rounded={0}
                        h={12}
                        variant={"subtle"}
                        colorPalette={"gray"}
                        onClick={resetSession}
                      >
                        <Icon as={LuRotateCcw} />
                        Reset
                      </Button>
                    </HStack>
                  ) : (
                    <Button
                      w={"full"}
                      rounded={0}
                      h={12}
                      onClick={startSession}
                      {...CALENDAR_DRILL_PRIMARY_ACTION_BUTTON_STYLES}
                      justifyContent={"center"}
                      px={4}
                      position={"relative"}
                    >
                      <HStack gap={2}>
                        <Icon as={LuPlay} />
                        <Text>Start</Text>
                      </HStack>
                      <Box position={"absolute"} insetEnd={{ base: 2, sm: 4 }}>
                        <Box display={{ base: "none", sm: "block" }}>
                          <ShortcutHint
                            icon={LuCornerDownLeft}
                            label={"Enter"}
                          />
                        </Box>
                        <Box display={{ base: "block", sm: "none" }}>
                          <ShortcutHint icon={LuCornerDownLeft} label={""} />
                        </Box>
                      </Box>
                    </Button>
                  )}
                </Card.Footer>
              </Card.Root>
            </HighlightedSection>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
}
