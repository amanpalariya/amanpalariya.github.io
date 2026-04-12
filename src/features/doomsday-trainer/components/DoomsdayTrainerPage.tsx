"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Grid,
  HStack,
  Icon,
  IconButton,
  NumberInput,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DialogCloseTrigger, DialogContent } from "@components/ui/dialog";
import { useEffect, useState } from "react";
import {
  LuCalendarRange,
  LuCircleCheck,
  LuClock3,
  LuFlag,
  LuPlay,
  LuRotateCcw,
  LuSettings2,
  LuTarget,
  LuCircleHelp,
  LuKeyboard,
} from "react-icons/lu";
import type { IconType } from "react-icons";
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

function StatCard({ icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <Card.Root variant={"outline"}>
      <Card.Body>
        <HStack justify={"space-between"}>
          <Icon as={icon} color={"app.fg.subtle"} />
          <Text fontSize={"xs"} color={"app.fg.subtle"}>
            {label}
          </Text>
        </HStack>
        <Text fontWeight={"semibold"} fontSize={"lg"} mt={1}>
          {value}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}

export function WeekdayGuesserPage() {
  const [settingsDraft, setSettingsDraft] = useState<PracticeSettings>({
    minYear: 2000,
    maxYear: new Date().getFullYear(),
  });

  const [settings, setSettings] = useState<PracticeSettings>(settingsDraft);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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

  useEffect(() => {
    if (status !== "running" || !question || answerState || settingsOpen || helpOpen) return;
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
  }, [status, question, answerState, prefix, settingsOpen, helpOpen]);

  useEffect(() => {
    if (settingsOpen || helpOpen) return;

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
  }, [status, answerState, settingsOpen, helpOpen]);

  return (
    <VStack align={"stretch"} gap={5} px={[4, 6]} pb={6}>
      <Card.Root variant={"subtle"}>
        <Card.Body>
          <HStack justify={"space-between"} wrap={"wrap"}>
            <HStack>
              <Icon as={LuTarget} color={"app.fg.subtle"} />
              <Text fontWeight={"semibold"}>Weekday Guesser</Text>
            </HStack>
            <HStack>
              <Dialog.Root open={helpOpen} onOpenChange={(details) => setHelpOpen(details.open)}>
                <Dialog.Trigger asChild>
                  <IconButton aria-label={"Help"} variant={"outline"} size={"sm"}>
                    <LuCircleHelp />
                  </IconButton>
                </Dialog.Trigger>
                <DialogContent maxW={"560px"} rounded={"xl"}>
                  <Dialog.Header>
                    <Dialog.Title>
                      <HStack>
                        <Icon as={LuKeyboard} />
                        <Text>Keyboard & Input Help</Text>
                      </HStack>
                    </Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <VStack align={"stretch"} gap={3}>
                      <Text fontSize={"sm"} color={"app.fg.muted"}>
                        Type weekday letters directly: for example `t` then `h` targets Thursday.
                      </Text>
                      <Text fontSize={"sm"} color={"app.fg.muted"}>
                        Backspace removes one letter. Escape clears the full prefix.
                      </Text>
                      <Text fontSize={"sm"} color={"app.fg.muted"}>
                        When the prefix matches exactly one weekday, the answer is auto-submitted.
                      </Text>
                      <Text fontSize={"sm"} color={"app.fg.muted"}>
                        Press Enter to start a session, and Enter again after answering to go next.
                      </Text>
                    </VStack>
                  </Dialog.Body>
                  <DialogCloseTrigger />
                </DialogContent>
              </Dialog.Root>

              <Dialog.Root open={settingsOpen} onOpenChange={(details) => setSettingsOpen(details.open)}>
                <Dialog.Trigger asChild>
                  <IconButton aria-label={"Settings"} variant={"outline"} size={"sm"}>
                    <LuSettings2 />
                  </IconButton>
                </Dialog.Trigger>
                <DialogContent maxW={"640px"} rounded={"xl"}>
                  <Dialog.Header>
                    <Dialog.Title>
                      <HStack>
                        <Icon as={LuFlag} />
                        <Text>Session Settings</Text>
                      </HStack>
                    </Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
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
                            <NumberInput.Input />
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
                            <NumberInput.Input />
                          </NumberInput.Root>
                        </Field.Root>
                      </Grid>

                      <HStack justify={"space-between"} wrap={"wrap"}>
                        <Button
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
                          Reset to Current Year
                        </Button>
                        <Button onClick={() => setSettingsOpen(false)} colorPalette={"blue"}>
                          Save
                        </Button>
                      </HStack>
                    </VStack>
                  </Dialog.Body>
                  <DialogCloseTrigger />
                </DialogContent>
              </Dialog.Root>

              <Badge>{status === "running" ? "In Session" : "Ready"}</Badge>
            </HStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={[1, 3]} gap={3}>
        <Card.Root variant={"outline"}>
          <Card.Body>
            <HStack justify={"space-between"}>
              <Icon as={LuCircleCheck} color={"app.fg.subtle"} />
              <Text fontSize={"xs"} color={"app.fg.subtle"}>
                Score
              </Text>
            </HStack>
            <Text fontWeight={"semibold"} fontSize={"lg"} mt={1}>
              {stats.correct}/{stats.attempts || 0} ({accuracy}%)
            </Text>
            <Box mt={2}>
              <Progress.Root
                value={accuracy}
                colorPalette={accuracy >= 80 ? "green" : accuracy >= 60 ? "yellow" : "red"}
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
          </Card.Body>
        </Card.Root>

        <StatCard icon={LuClock3} label={"Avg Time"} value={avgResponseMs > 0 ? formatMs(avgResponseMs) : "-"} />

        <StatCard icon={LuFlag} label={"Answered"} value={`${stats.attempts}`} />
      </SimpleGrid>

      {status === "idle" ? (
        <Card.Root borderColor={"app.border.default"}>
          <Card.Body>
            <VStack align={"stretch"} gap={4}>
              <HStack justify={"space-between"} wrap={"wrap"}>
                <Badge>Practice Ready</Badge>
                <Text fontSize={"sm"} color={"app.fg.muted"}>
                  Random full-date mode
                </Text>
              </HStack>
              <Text fontSize={"2xl"} fontWeight={"semibold"}>
                Weekday for Oct 12, 2026?
              </Text>
              <Text color={"app.fg.muted"}>
                Years {settingsDraft.minYear}-{settingsDraft.maxYear}. Infinite questions.
              </Text>
              <HStack>
                <Button onClick={startSession} colorPalette={"blue"}>
                  <Icon as={LuPlay} />
                  Start Guessing
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : null}

      {status === "running" && question ? (
        <Card.Root borderColor={"app.border.default"}>
          <Card.Body>
            <VStack align={"stretch"} gap={4}>
              <HStack justify={"space-between"} wrap={"wrap"}>
                <Badge>Q {questionIndex + 1}</Badge>
              </HStack>

              <Text fontSize={"2xl"} fontWeight={"semibold"}>
                {question.prompt}
              </Text>

              <HStack>
                <Icon as={LuKeyboard} color={"app.fg.subtle"} />
                <Text fontSize={"sm"} color={"app.fg.muted"}>
                  Keyboard: type weekday letters, Enter for next.
                </Text>
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
                <Card.Root variant={"subtle"}>
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

                      <Text color={"app.fg.muted"} fontSize={"sm"}>
                        Response time: {formatMs(answerState.responseMs)}
                      </Text>

                      <HStack>
                        <Button onClick={nextQuestion}>
                          <Icon as={LuPlay} />
                          Next
                        </Button>
                        <Button variant={"outline"} onClick={startSession}>
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
      ) : null}
    </VStack>
  );
}
