"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Field,
  Grid,
  HStack,
  Icon,
  NumberInput,
  Stat,
  StatGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import HighlightedSection from "@components/page/common/HighlightedSection";
import { useEffect, useState } from "react";
import {
  LuCalendarRange,
  LuCircleCheck,
  LuClock3,
  LuFlag,
  LuPlay,
  LuRotateCcw,
} from "react-icons/lu";
import { getWeekdayForDate, type DateParts, WEEKDAYS } from "../domain/doomsday";

type PracticeSettings = {
  minYear: number;
  maxYear: number;
};

type PracticeQuestion = {
  date: DateParts;
  choices: Array<{ value: string; label: string }>;
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

type AnswerState = {
  selectedValue: string;
  isCorrect: boolean;
  responseMs: number;
};

type SessionStatus = "idle" | "running";

const MIN_ALLOWED_YEAR = 1600;
const MAX_ALLOWED_YEAR = 2399;

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

function weekdayChoices(): Array<{ value: string; label: string }> {
  return WEEKDAYS.map((dayName, index) => ({ value: String(index), label: dayName }));
}

function buildQuestion(settings: PracticeSettings): PracticeQuestion {
  const date = getRandomDate(settings.minYear, settings.maxYear);
  const correctWeekday = getWeekdayForDate(date);
  const correctIndex = WEEKDAYS.findIndex((weekday) => weekday === correctWeekday);

  return {
    date,
    choices: weekdayChoices(),
    correctValue: String(correctIndex),
    prompt: `Weekday for ${formatDateHuman(date)}?`,
  };
}

function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function WeekdayGuesserPage() {
  const [settingsDraft, setSettingsDraft] = useState<PracticeSettings>({
    minYear: 2000,
    maxYear: new Date().getFullYear(),
  });

  const [settings, setSettings] = useState<PracticeSettings>(settingsDraft);

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

  const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const avgResponseMs = stats.attempts > 0 ? Math.round(stats.totalResponseMs / stats.attempts) : 0;

  function startSession() {
    const normalizedRange = normalizeYearRange(settingsDraft.minYear, settingsDraft.maxYear);
    const nextSettings: PracticeSettings = {
      ...settingsDraft,
      ...normalizedRange,
    };

    setSettings(nextSettings);
    setSettingsDraft(nextSettings);
    setStats({ attempts: 0, correct: 0, streak: 0, bestStreak: 0, totalResponseMs: 0 });
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
    setAnswerState({ selectedValue: choiceValue, isCorrect, responseMs });
    setStats((current) => {
      const attempts = current.attempts + 1;
      const correct = current.correct + (isCorrect ? 1 : 0);
      const streak = isCorrect ? current.streak + 1 : 0;
      const bestStreak = Math.max(current.bestStreak, streak);
      const totalResponseMs = current.totalResponseMs + responseMs;
      return { attempts, correct, streak, bestStreak, totalResponseMs };
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
  }

  useEffect(() => {
    if (status !== "running" || !question || answerState) return;
    const activeQuestion = question;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

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

      if (!/^[a-zA-Z]$/.test(event.key)) return;

      event.preventDefault();
      const nextPrefix = `${prefix}${event.key.toLowerCase()}`;
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
              <StatGroup>
                <Stat.Root>
                  <Stat.Label>Accuracy</Stat.Label>
                  <Stat.ValueText>{accuracy}%</Stat.ValueText>
                </Stat.Root>
                <Stat.Root>
                  <Stat.Label>Answered</Stat.Label>
                  <Stat.ValueText>{stats.attempts}</Stat.ValueText>
                </Stat.Root>
                <Stat.Root>
                  <Stat.Label>Avg Time</Stat.Label>
                  <Stat.ValueText>{avgResponseMs > 0 ? formatMs(avgResponseMs) : "-"}</Stat.ValueText>
                </Stat.Root>
                <Stat.Root>
                  <Stat.Label>Streak</Stat.Label>
                  <Stat.ValueText>{stats.streak}</Stat.ValueText>
                </Stat.Root>
              </StatGroup>
            </Card.Body>
          </Card.Root>

          {status === "idle" ? (
            <Box mx={{ base: -4, md: -6 }}>
              <HighlightedSection contentPx={{ base: 3, md: 4 }} contentPy={{ base: 3, md: 4 }}>
                <Card.Root borderColor={"app.border.default"} rounded={"2xl"}>
                  <Card.Body>
                    <VStack align={"stretch"} gap={4}>
              <Grid templateColumns={["1fr", "1fr 1fr"]} gap={3}>
                <Field.Root>
                  <Field.Label>
                    <HStack gap={2}>
                      <Icon as={LuCalendarRange} />
                      <Text>From Year</Text>
                    </HStack>
                  </Field.Label>
                  <NumberInput.Root
                    value={String(settingsDraft.minYear)}
                    min={MIN_ALLOWED_YEAR}
                    max={MAX_ALLOWED_YEAR}
                    onValueChange={(details) => {
                      const parsed = Number(details.value);
                      if (!Number.isNaN(parsed)) {
                        setSettingsDraft((current) => ({ ...current, minYear: clampYear(parsed) }));
                      }
                    }}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input rounded={"xl"} />
                  </NumberInput.Root>
                </Field.Root>

                <Field.Root>
                  <Field.Label>
                    <HStack gap={2}>
                      <Icon as={LuCalendarRange} />
                      <Text>To Year</Text>
                    </HStack>
                  </Field.Label>
                  <NumberInput.Root
                    value={String(settingsDraft.maxYear)}
                    min={MIN_ALLOWED_YEAR}
                    max={MAX_ALLOWED_YEAR}
                    onValueChange={(details) => {
                      const parsed = Number(details.value);
                      if (!Number.isNaN(parsed)) {
                        setSettingsDraft((current) => ({ ...current, maxYear: clampYear(parsed) }));
                      }
                    }}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input rounded={"xl"} />
                  </NumberInput.Root>
                </Field.Root>
              </Grid>

                      <HStack>
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
                    <Button rounded={"xl"} onClick={startSession} colorPalette={"blue"}>
                      <Icon as={LuPlay} />
                      Start
                    </Button>
                    <Button rounded={"xl"} variant={"ghost"} onClick={resetSession}>
                      Reset
                    </Button>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </HighlightedSection>
            </Box>
          ) : null}

          {status === "running" && question ? (
            <Box mx={{ base: -4, md: -6 }}>
              <HighlightedSection contentPx={{ base: 3, md: 4 }} contentPy={{ base: 3, md: 4 }}>
                <Card.Root borderColor={"app.border.default"} rounded={"2xl"}>
                  <Card.Body>
                    <VStack align={"stretch"} gap={4}>
                      <HStack justify={"space-between"} align={"center"} gap={3} wrap={"wrap"}>
                        <HStack align={"baseline"} gap={2} wrap={"wrap"}>
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
                        <Button rounded={"xl"} variant={"ghost"} size={"sm"} onClick={resetSession}>
                          Reset
                        </Button>
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
                            >
                              {choice.label}
                            </Button>
                          );
                        })}
                      </Grid>

                      {answerState ? (
                        <Card.Root variant={"subtle"} rounded={"2xl"}>
                          <Card.Body>
                            <VStack align={"stretch"} gap={2}>
                              <Text fontWeight={"semibold"}>
                                {answerState.isCorrect
                                  ? "Correct"
                                  : `Correct answer: ${
                                      question.choices.find((choice) => choice.value === question.correctValue)
                                        ?.label ?? question.correctValue
                                    }`}
                              </Text>

                              <HStack>
                                <Button rounded={"xl"} onClick={nextQuestion}>
                                  <Icon as={LuPlay} />
                                  Next
                                </Button>
                                <Button rounded={"xl"} variant={"outline"} onClick={startSession}>
                                  <Icon as={LuRotateCcw} />
                                  Restart
                                </Button>
                              </HStack>
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ) : null}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </HighlightedSection>
            </Box>
          ) : null}

        </VStack>
      </Box>
    </VStack>
  );
}
