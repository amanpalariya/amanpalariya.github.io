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
  Stat,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Switch } from "@components/ui/switch";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useEffect, useState } from "react";
import {
  LuCalendarRange,
  LuCircleCheck,
  LuCircleX,
  LuCornerDownLeft,
  LuPlay,
  LuRotateCcw,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { getWeekdayForDate, type DateParts, type WeekdayIndex, WEEKDAYS } from "../domain/doomsday";
import {
  createDefaultPracticeSettings,
  readCalendarDrillSettings,
  writeCalendarDrillSettings,
} from "../services/settings-storage";
import type { PracticeSettings } from "../types";

type WeekdayChoice = {
  value: string;
  label: string;
  shortcutKey: string;
};

type PracticeQuestion = {
  date: DateParts;
  choices: WeekdayChoice[];
  correctValue: string;
  prompt: string;
};

type PracticeStats = {
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
  totalResponseMs: number;
};

type PracticeTrends = {
  accuracyDelta: number | null;
  avgResponseDeltaMs: number | null;
};

type AnswerState = {
  selectedValue: string;
  isCorrect: boolean;
  responseMs: number;
};

type SessionStatus = "idle" | "running";

const MIN_ALLOWED_YEAR = 1600;
const MAX_ALLOWED_YEAR = 2399;

const SUNDAY_FIRST_ORDER: WeekdayIndex[] = [0, 1, 2, 3, 4, 5, 6];
const MONDAY_FIRST_ORDER: WeekdayIndex[] = [1, 2, 3, 4, 5, 6, 0];

function clampYear(value: number): number {
  return Math.max(MIN_ALLOWED_YEAR, Math.min(MAX_ALLOWED_YEAR, value));
}

function normalizeYearRange(minYear: number, maxYear: number): { minYear: number; maxYear: number } {
  const safeMin = clampYear(minYear);
  const safeMax = clampYear(maxYear);
  if (safeMin <= safeMax) return { minYear: safeMin, maxYear: safeMax };
  return { minYear: safeMax, maxYear: safeMin };
}

function formatDateHuman(parts: DateParts): string {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getRandomDate(minYear: number, maxYear: number): DateParts {
  const { minYear: boundedMin, maxYear: boundedMax } = normalizeYearRange(minYear, maxYear);
  const year = Math.floor(Math.random() * (boundedMax - boundedMin + 1)) + boundedMin;
  const month = Math.floor(Math.random() * 12) + 1;
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.floor(Math.random() * maxDay) + 1;
  return { year, month, day };
}

function weekdayChoices(settings: PracticeSettings): WeekdayChoice[] {
  const weekdayOrder = settings.weekStartDay === "monday" ? MONDAY_FIRST_ORDER : SUNDAY_FIRST_ORDER;

  return weekdayOrder.map((weekdayIndex, displayIndex) => ({
    value: String(weekdayIndex),
    label: WEEKDAYS[weekdayIndex],
    shortcutKey: String(displayIndex + settings.firstDayNumberBase),
  }));
}

function buildQuestion(settings: PracticeSettings): PracticeQuestion {
  const date = getRandomDate(settings.minYear, settings.maxYear);
  const correctWeekday = getWeekdayForDate(date);
  const correctIndex = WEEKDAYS.findIndex((weekday) => weekday === correctWeekday);

  return {
    date,
    choices: weekdayChoices(settings),
    correctValue: String(correctIndex),
    prompt: `Weekday for ${formatDateHuman(date)}?`,
  };
}

function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function toDisplayedAvgMs(avgMs: number): number {
  return Math.round(avgMs / 100) * 100;
}

function formatSignedPercent(delta: number): string {
  if (delta === 0) return "0%";
  return `${delta > 0 ? "+" : ""}${delta}%`;
}

function formatSignedMsDelta(deltaMs: number): string {
  const seconds = (Math.abs(deltaMs) / 1000).toFixed(1);
  if (deltaMs === 0) return "0.0s";
  return `${deltaMs > 0 ? "+" : "-"}${seconds}s`;
}

function getSignalColorPalette(
  delta: number,
  isIncreasePositiveSignal: boolean,
): "green.500" | "red.500" | "app.fg.muted" {
  if (delta === 0) return "app.fg.muted";

  const isUptrend = delta > 0;
  const isPositiveSignal = isUptrend === isIncreasePositiveSignal;
  return isPositiveSignal ? "green.500" : "red.500";
}

function ShortcutHint({ label, icon }: { label: string; icon?: IconType }) {
  return (
    <HStack
      minH={"1.5rem"}
      px={1.5}
      rounded={"md"}
      borderWidth={"1px"}
      borderColor={"currentColor"}
      opacity={0.75}
      fontSize={"2xs"}
      fontWeight={"semibold"}
      gap={1}
      lineHeight={1}
      flexShrink={0}
    >
      {icon ? <Icon as={icon} boxSize={3} /> : null}
      <Text as={"span"}>{label}</Text>
    </HStack>
  );
}

export function WeekdayGuesserPage() {
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

  const [stats, setStats] = useState<PracticeStats>({
    attempts: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    totalResponseMs: 0,
  });
  const [trends, setTrends] = useState<PracticeTrends>({
    accuracyDelta: null,
    avgResponseDeltaMs: null,
  });

  const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const avgResponseMs = stats.attempts > 0 ? Math.round(stats.totalResponseMs / stats.attempts) : 0;
  const displayedAvgResponseMs = avgResponseMs > 0 ? toDisplayedAvgMs(avgResponseMs) : 0;

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
    setStats({ attempts: 0, correct: 0, streak: 0, bestStreak: 0, totalResponseMs: 0 });
    setTrends({ accuracyDelta: null, avgResponseDeltaMs: null });
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
    setStats({ attempts: 0, correct: 0, streak: 0, bestStreak: 0, totalResponseMs: 0 });
    setTrends({ accuracyDelta: null, avgResponseDeltaMs: null });
  }

  useEffect(() => {
    if (status !== "running" || !question || answerState) return;
    const activeQuestion = question;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const pressedKey = event.key.toLowerCase();

      if (/^[0-9]$/.test(pressedKey)) {
        const shortcutMatch = activeQuestion.choices.find((choice) => choice.shortcutKey === pressedKey);
        if (shortcutMatch) {
          event.preventDefault();
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
      setPrefix(nextPrefix);

      const matches = activeQuestion.choices.filter((choice) =>
        choice.label.toLowerCase().startsWith(nextPrefix),
      );

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
          <Card.Root variant={"outline"} rounded={"2xl"}>
            <Card.Body>
              <Grid templateColumns={["repeat(2, minmax(0, 1fr))", "repeat(4, minmax(0, 1fr))"]} gap={3}>
                <Stat.Root minW={0}>
                  <Stat.Label>Accuracy</Stat.Label>
                  <HStack align={"center"} gap={1.5} wrap={"nowrap"}>
                    <Stat.ValueText>{accuracy}%</Stat.ValueText>
                    <Box minW={{ base: "48px", md: "58px" }}>
                      {trends.accuracyDelta !== null && trends.accuracyDelta !== 0 ? (
                        <HStack
                          as={"span"}
                          gap={0.5}
                          color={getSignalColorPalette(trends.accuracyDelta, true)}
                          fontSize={{ base: "2xs", md: "xs" }}
                          fontWeight={"medium"}
                          lineHeight={"short"}
                          align={"center"}
                        >
                          {trends.accuracyDelta > 0 ? <Stat.UpIndicator /> : null}
                          {trends.accuracyDelta < 0 ? <Stat.DownIndicator /> : null}
                          <Text as={"span"} color={"currentColor"}>
                            {formatSignedPercent(trends.accuracyDelta)}
                          </Text>
                        </HStack>
                      ) : null}
                    </Box>
                  </HStack>
                </Stat.Root>
                <Stat.Root minW={0}>
                  <Stat.Label>Answered</Stat.Label>
                  <Stat.ValueText>{stats.attempts}</Stat.ValueText>
                </Stat.Root>
                <Stat.Root minW={0}>
                  <Stat.Label>Avg Time</Stat.Label>
                  <HStack align={"center"} gap={1.5} wrap={"nowrap"}>
                    <Stat.ValueText>{avgResponseMs > 0 ? formatMs(displayedAvgResponseMs) : "-"}</Stat.ValueText>
                    <Box minW={{ base: "48px", md: "58px" }}>
                      {trends.avgResponseDeltaMs !== null && trends.avgResponseDeltaMs !== 0 ? (
                        <HStack
                          as={"span"}
                          gap={0.5}
                          color={getSignalColorPalette(trends.avgResponseDeltaMs, false)}
                          fontSize={{ base: "2xs", md: "xs" }}
                          fontWeight={"medium"}
                          lineHeight={"short"}
                          align={"center"}
                        >
                          {trends.avgResponseDeltaMs > 0 ? (
                            <Stat.UpIndicator color={getSignalColorPalette(trends.avgResponseDeltaMs, false)} />
                          ) : null}
                          {trends.avgResponseDeltaMs < 0 ? (
                            <Stat.DownIndicator color={getSignalColorPalette(trends.avgResponseDeltaMs, false)} />
                          ) : null}
                          <Text as={"span"} color={"currentColor"}>
                            {formatSignedMsDelta(trends.avgResponseDeltaMs)}
                          </Text>
                        </HStack>
                      ) : null}
                    </Box>
                  </HStack>
                </Stat.Root>
                <Stat.Root minW={0}>
                  <Stat.Label>Streak</Stat.Label>
                  <HStack align={"center"} gap={1.5}>
                    <Stat.ValueText>{stats.streak}</Stat.ValueText>
                    {stats.streak >= 5 ? (
                      <Text as={"span"} fontSize={"lg"} lineHeight={1} role={"img"} aria-label={"fire"}>
                        🔥
                      </Text>
                    ) : null}
                  </HStack>
                </Stat.Root>
              </Grid>
            </Card.Body>
          </Card.Root>

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
                            const isCorrectChoice = choice.value === question.correctValue;
                            const isSelected = answerState?.selectedValue === choice.value;
                            const hasPrefix = prefix.length > 0;
                            const matchesPrefix = choice.label.toLowerCase().startsWith(prefix.toLowerCase());

                            let variant: "outline" | "subtle" | "solid" = "outline";
                            let colorPalette: "gray" | "green" | "red" | "yellow" = "gray";

                            if (hasAnswered && isCorrectChoice) {
                              variant = "solid";
                              colorPalette = "green";
                            } else if (hasAnswered && isSelected && !isCorrectChoice) {
                              variant = "subtle";
                              colorPalette = "red";
                            } else if (!hasAnswered && hasPrefix && matchesPrefix) {
                              variant = "subtle";
                              colorPalette = "yellow";
                            }

                            return (
                              <Button
                                rounded={"xl"}
                                key={choice.value}
                                onClick={() => submitAnswer(choice.value)}
                                disabled={
                                  hasAnswered ||
                                  status !== "running" ||
                                  (hasPrefix && !matchesPrefix)
                                }
                                variant={variant}
                                colorPalette={colorPalette}
                                justifyContent={"flex-start"}
                                ps={3}
                                pe={11}
                                position={"relative"}
                              >
                                <Text>{choice.label}</Text>

                                {!hasAnswered ? (
                                  <Box
                                    position={"absolute"}
                                    insetY={0}
                                    insetEnd={0}
                                    minW={8}
                                    px={2}
                                    display={"inline-flex"}
                                    alignItems={"center"}
                                    justifyContent={"center"}
                                    _before={{
                                      content: '""',
                                      position: "absolute",
                                      insetInlineStart: 0,
                                      insetBlock: "20%",
                                      w: "1px",
                                      bg: "currentColor",
                                      opacity: 0.2,
                                    }}
                                    opacity={0.8}
                                    fontSize={"xs"}
                                    fontWeight={"semibold"}
                                    roundedEnd={"xl"}
                                  >
                                    {choice.shortcutKey}
                                  </Box>
                                ) : null}

                                {hasAnswered && isCorrectChoice ? (
                                  <Box position={"absolute"} insetEnd={3}>
                                    <Icon as={LuCircleCheck} />
                                  </Box>
                                ) : null}
                                {hasAnswered && isSelected && !isCorrectChoice ? (
                                  <Box position={"absolute"} insetEnd={3}>
                                    <Icon as={LuCircleX} />
                                  </Box>
                                ) : null}
                              </Button>
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
                        onClick={nextQuestion}
                        disabled={!answerState}
                        colorPalette={"blue"}
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
                      <Button flex={1} rounded={0} variant={"subtle"} colorPalette={"gray"} onClick={resetSession}>
                        <Icon as={LuRotateCcw} />
                        Reset
                      </Button>
                    </HStack>
                  ) : (
                    <Button
                      w={"full"}
                      rounded={0}
                      onClick={startSession}
                      colorPalette={"blue"}
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
