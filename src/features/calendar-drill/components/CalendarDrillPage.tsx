"use client";

import {
  Box,
  Button,
  Card,
  Field,
  Fieldset,
  Grid,
  HStack,
  Icon,
  NumberInput,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ShortcutHint } from "@components/core/ShortcutHint";
import { Switch } from "@components/ui/switch";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useEffect, useMemo, useState } from "react";
import {
  LuCalendarRange,
  LuCornerDownLeft,
  LuPlay,
  LuRotateCcw,
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
  formatDateHuman,
  MAX_ALLOWED_YEAR,
  MIN_ALLOWED_YEAR,
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

export function CalendarDrillPage() {
  const [settingsDraft, setSettingsDraft] = useState<PracticeSettings>(
    createDefaultPracticeSettings,
  );

  const [settings, setSettings] = useState<PracticeSettings>(settingsDraft);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const [status, setStatus] = useState<SessionStatus>("idle");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(0);
  const [answerState, setAnswerState] = useState<AnswerState | null>(null);
  const [prefix, setPrefix] = useState("");

  const [stats, setStats] = useState<PracticeStats>(createInitialPracticeStats);
  const [trends, setTrends] = useState<PracticeTrends>(createInitialPracticeTrends);

  const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const avgResponseMs = stats.attempts > 0 ? Math.round(stats.totalResponseMs / stats.attempts) : 0;
  const displayedAvgResponseMs = avgResponseMs > 0 ? toDisplayedAvgMs(avgResponseMs) : 0;

  const requiredPrefixLengthByChoiceValue = useMemo(() => {
    if (!question) return new Map<string, number>();

    const result = new Map<string, number>();
    const choices = question.choices;

    for (const choice of choices) {
      const lowerLabel = choice.label.toLowerCase();
      let requiredLength = lowerLabel.length;

      for (let prefixLength = 1; prefixLength <= lowerLabel.length; prefixLength += 1) {
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

  function startSession() {
    const normalizedRange = normalizeYearRange(settingsDraft.minYear, settingsDraft.maxYear);
    const nextSettings: PracticeSettings = {
      ...settingsDraft,
      ...normalizedRange,
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
  }

  function submitAnswer(choiceValue: string) {
    if (!question || status !== "running" || answerState) return;

    const responseMs = Math.max(1, Date.now() - questionStartedAt);
    const isCorrect = choiceValue === question.correctValue;

    const previousAccuracy =
      stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : null;
    const previousAvgResponseDisplayMs =
      stats.attempts > 0 ? toDisplayedAvgMs(Math.round(stats.totalResponseMs / stats.attempts)) : null;

    const attempts = stats.attempts + 1;
    const correct = stats.correct + (isCorrect ? 1 : 0);
    const streak = isCorrect ? stats.streak + 1 : 0;
    const bestStreak = Math.max(stats.bestStreak, streak);
    const totalResponseMs = stats.totalResponseMs + responseMs;
    const nextStats: PracticeStats = { attempts, correct, streak, bestStreak, totalResponseMs };

    const nextAccuracy = Math.round((nextStats.correct / nextStats.attempts) * 100);
    const nextAvgResponseDisplayMs = toDisplayedAvgMs(
      Math.round(nextStats.totalResponseMs / nextStats.attempts),
    );

    setAnswerState({ selectedValue: choiceValue, isCorrect, responseMs });
    setStats(nextStats);
    setTrends({
      accuracyDelta: previousAccuracy === null ? null : nextAccuracy - previousAccuracy,
      avgResponseDeltaMs:
        previousAvgResponseDisplayMs === null
          ? null
          : nextAvgResponseDisplayMs - previousAvgResponseDisplayMs,
    });

    setPrefix("");
  }

  function nextQuestion() {
    if (!question || !answerState) return;

    const next = buildQuestion(settings);
    setQuestion(next);
    setQuestionIndex((current) => current + 1);
    setQuestionStartedAt(Date.now());
    setAnswerState(null);
    setPrefix("");
  }

  function resetSession() {
    setStatus("idle");
    setQuestion(null);
    setQuestionIndex(0);
    setAnswerState(null);
    setPrefix("");
    setStats(createInitialPracticeStats());
    setTrends(createInitialPracticeTrends());
  }

  useEffect(() => {
    if (status !== "running" || !question || answerState) return;
    const activeQuestion = question;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const pressedKey = event.key.toLowerCase();

      if (/^[0-9]$/.test(pressedKey)) {
        event.preventDefault();
        const shortcutMatch = activeQuestion.choices.find((choice) => choice.shortcutKey === pressedKey);
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
  }, [status, question, answerState, prefix]);

  useEffect(() => {
    function onGlobalEnter(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.key !== "Enter") return;

      event.preventDefault();

      if (status === "idle") {
        startSession();
        return;
      }

      if (status === "running" && answerState) {
        nextQuestion();
      }
    }

    window.addEventListener("keydown", onGlobalEnter);
    return () => window.removeEventListener("keydown", onGlobalEnter);
  }, [status, answerState]);

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
            <HighlightedSection contentPx={{ base: 3, md: 4 }} contentPy={{ base: 3, md: 4 }}>
              <Card.Root borderColor={"app.border.default"} rounded={"2xl"} overflow={"hidden"}>
                <Card.Body>
                  <VStack align={"stretch"} gap={4}>
                    {status === "running" && question ? (
                      <VStack align={"stretch"} gap={4}>
                        <HStack justify={"space-between"} align={"center"} gap={3} wrap={"wrap"}>
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
                              <Text as={"span"} color={"app.fg.muted"} fontWeight={"normal"}>
                                Weekday for
                              </Text>{" "}
                              <Text as={"span"} fontWeight={"semibold"}>
                                {formatDateHuman(question.date)}
                              </Text>
                              <Text as={"span"} color={"app.fg.muted"} fontWeight={"normal"}>
                                ?
                              </Text>
                            </Text>
                          </HStack>
                        </HStack>

                        <Grid templateColumns={["repeat(2, 1fr)", "repeat(4, 1fr)"]} gap={3}>
                          {question.choices.map((choice) => {
                            const hasAnswered = Boolean(answerState);
                            const hasPrefix = prefix.length > 0;

                            return (
                              <ChoiceButton
                                key={choice.value}
                                choice={choice}
                                requiredPrefixLength={
                                  requiredPrefixLengthByChoiceValue.get(choice.value) ?? 1
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
                            <Grid templateColumns={["1fr", "1fr 1fr auto"]} gap={3} alignItems={"end"}>
                              <Field.Root>
                                <Field.Label>From Year</Field.Label>
                                <NumberInput.Root
                                  value={String(settingsDraft.minYear)}
                                  min={MIN_ALLOWED_YEAR}
                                  max={MAX_ALLOWED_YEAR}
                                  onValueChange={(details) => {
                                    const parsed = Number(details.value);
                                    if (!Number.isNaN(parsed)) {
                                      setSettingsDraft((current) => ({
                                        ...current,
                                        minYear: clampYear(parsed),
                                      }));
                                    }
                                  }}
                                >
                                  <NumberInput.Control />
                                  <NumberInput.Input rounded={"xl"} />
                                </NumberInput.Root>
                              </Field.Root>

                              <Field.Root>
                                <Field.Label>To Year</Field.Label>
                                <NumberInput.Root
                                  value={String(settingsDraft.maxYear)}
                                  min={MIN_ALLOWED_YEAR}
                                  max={MAX_ALLOWED_YEAR}
                                  onValueChange={(details) => {
                                    const parsed = Number(details.value);
                                    if (!Number.isNaN(parsed)) {
                                      setSettingsDraft((current) => ({
                                        ...current,
                                        maxYear: clampYear(parsed),
                                      }));
                                    }
                                  }}
                                >
                                  <NumberInput.Control />
                                  <NumberInput.Input rounded={"xl"} />
                                </NumberInput.Root>
                              </Field.Root>

                              <Button
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

                            <HStack gap={6} wrap={"wrap"}>
                              <Switch
                                checked={settingsDraft.weekStartDay === "monday"}
                                onCheckedChange={(details) => {
                                  setSettingsDraft((current) => ({
                                    ...current,
                                    weekStartDay: details.checked ? "monday" : "sunday",
                                  }));
                                }}
                              >
                                Monday as first day
                              </Switch>

                              <Switch
                                checked={settingsDraft.firstDayNumberBase === 0}
                                onCheckedChange={(details) => {
                                  setSettingsDraft((current) => ({
                                    ...current,
                                    firstDayNumberBase: details.checked ? 0 : 1,
                                  }));
                                }}
                              >
                                First day starts at 0
                              </Switch>
                            </HStack>
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
                          <Box position={"absolute"} insetEnd={4}>
                            <ShortcutHint icon={LuCornerDownLeft} label={"Enter"} />
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
                      <Box position={"absolute"} insetEnd={4}>
                        <ShortcutHint icon={LuCornerDownLeft} label={"Enter"} />
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
