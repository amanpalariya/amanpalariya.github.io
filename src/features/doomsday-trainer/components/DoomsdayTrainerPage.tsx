"use client";

import {
  Badge,
  Button,
  Card,
  Field,
  Grid,
  HStack,
  Icon,
  NumberInput,
  ProgressCircle,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
  LuCalendarRange,
  LuCircleCheck,
  LuClock3,
  LuFlag,
  LuHash,
  LuPlay,
  LuRotateCcw,
  LuTarget,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { calculateDoomsdaySteps, type DateParts, WEEKDAYS } from "../domain/doomsday";

type PracticeSettings = {
  minYear: number;
  maxYear: number;
  questionCount: number;
};

type PracticeQuestion = {
  date: DateParts;
  choices: Array<{ value: string; label: string }>;
  correctValue: string;
  prompt: string;
  helper: string;
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

type SessionStatus = "idle" | "running" | "finished";

const MIN_ALLOWED_YEAR = 1600;
const MAX_ALLOWED_YEAR = 2399;
const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 50;

function clampYear(value: number): number {
  return Math.max(MIN_ALLOWED_YEAR, Math.min(MAX_ALLOWED_YEAR, value));
}

function clampQuestionCount(value: number): number {
  return Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, value));
}

function normalizeYearRange(minYear: number, maxYear: number): { minYear: number; maxYear: number } {
  const safeMin = clampYear(minYear);
  const safeMax = clampYear(maxYear);
  if (safeMin <= safeMax) return { minYear: safeMin, maxYear: safeMax };
  return { minYear: safeMax, maxYear: safeMin };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatDate(parts: DateParts): string {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
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
  return WEEKDAYS.map((dayName, index) => ({
    value: String(index),
    label: dayName,
  }));
}

function buildQuestion(settings: PracticeSettings): PracticeQuestion {
  const date = getRandomDate(settings.minYear, settings.maxYear);
  const steps = calculateDoomsdaySteps(date);

  return {
    date,
    choices: weekdayChoices(),
    correctValue: String(steps.weekdayIndex),
    prompt: `Weekday for ${formatDate(date)}?`,
    helper: "Full solve from century anchor to day offset.",
  };
}

function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
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

export function DoomsdayTrainerPage() {
  const [settingsDraft, setSettingsDraft] = useState<PracticeSettings>({
    minYear: 1900,
    maxYear: 2099,
    questionCount: 10,
  });

  const [settings, setSettings] = useState<PracticeSettings>(settingsDraft);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(0);
  const [answerState, setAnswerState] = useState<AnswerState | null>(null);
  const [stats, setStats] = useState<PracticeStats>({
    attempts: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    totalResponseMs: 0,
  });

  const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const avgResponseMs = stats.attempts > 0 ? Math.round(stats.totalResponseMs / stats.attempts) : 0;
  const remaining = Math.max(0, settings.questionCount - stats.attempts);
  const progressPercent =
    settings.questionCount > 0 ? Math.round((stats.attempts / settings.questionCount) * 100) : 0;

  const questionSteps = useMemo(() => {
    if (!question) return null;
    return calculateDoomsdaySteps(question.date);
  }, [question]);

  function startSession() {
    const normalizedRange = normalizeYearRange(settingsDraft.minYear, settingsDraft.maxYear);
    const nextSettings: PracticeSettings = {
      ...settingsDraft,
      ...normalizedRange,
      questionCount: clampQuestionCount(settingsDraft.questionCount),
    };

    setSettings(nextSettings);
    setSettingsDraft(nextSettings);
    setStats({ attempts: 0, correct: 0, streak: 0, bestStreak: 0, totalResponseMs: 0 });
    setQuestionIndex(0);
    setAnswerState(null);

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
  }

  function nextQuestion() {
    if (!question || !answerState) return;

    const isLast = stats.attempts >= settings.questionCount;
    if (isLast) {
      setStatus("finished");
      return;
    }

    const next = buildQuestion(settings);
    setQuestion(next);
    setQuestionIndex((current) => current + 1);
    setQuestionStartedAt(Date.now());
    setAnswerState(null);
  }

  return (
    <VStack align={"stretch"} gap={5} px={[4, 6]} pb={6}>
      <Card.Root variant={"subtle"}>
        <Card.Body>
          <HStack justify={"space-between"} wrap={"wrap"}>
            <HStack>
              <Icon as={LuTarget} color={"app.fg.subtle"} />
              <Text fontWeight={"semibold"}>Doomsday Practice</Text>
            </HStack>
            <Badge>{status === "running" ? "In Session" : status === "finished" ? "Finished" : "Ready"}</Badge>
          </HStack>
        </Card.Body>
      </Card.Root>

      <Card.Root variant={"outline"}>
        <Card.Body>
          <VStack align={"stretch"} gap={4}>
            <HStack>
              <Icon as={LuFlag} />
              <Text fontWeight={"semibold"}>Session Settings</Text>
            </HStack>

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
            <Field.Root maxW={"280px"}>
              <Field.Label>
                <HStack gap={2}>
                  <Icon as={LuHash} />
                  <Text>Questions</Text>
                </HStack>
              </Field.Label>
              <NumberInput.Root
                value={String(settingsDraft.questionCount)}
                min={MIN_QUESTIONS}
                max={MAX_QUESTIONS}
                onValueChange={(details) => {
                  const parsed = Number(details.value);
                  if (!Number.isNaN(parsed)) {
                    setSettingsDraft((current) => ({
                      ...current,
                      questionCount: clampQuestionCount(parsed),
                    }));
                  }
                }}
              >
                <NumberInput.Control />
                <NumberInput.Input />
              </NumberInput.Root>
            </Field.Root>

            <HStack justify={"space-between"} wrap={"wrap"}>
              <Text color={"app.fg.muted"} fontSize={"sm"}>
                Full-date mode | Years {settingsDraft.minYear}-{settingsDraft.maxYear} |{" "}
                {settingsDraft.questionCount} questions
              </Text>
              <Button onClick={startSession} colorPalette={"blue"}>
                <Icon as={LuPlay} />
                Start Test
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={[1, 3]} gap={3}>
        <StatCard
          icon={LuCircleCheck}
          label={"Score"}
          value={`${stats.correct}/${settings.questionCount} (${accuracy}%)`}
        />
        <StatCard
          icon={LuClock3}
          label={"Avg Time"}
          value={avgResponseMs > 0 ? formatMs(avgResponseMs) : "-"}
        />
        <Card.Root variant={"outline"}>
          <Card.Body>
            <HStack justify={"space-between"}>
              <Icon as={LuFlag} color={"app.fg.subtle"} />
              <Text fontSize={"xs"} color={"app.fg.subtle"}>
                Progress
              </Text>
            </HStack>
            <HStack mt={1} justify={"space-between"}>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                {stats.attempts}/{settings.questionCount}
              </Text>
              <ProgressCircle.Root value={progressPercent} size="xs" colorPalette={"blue"}>
                <ProgressCircle.Circle>
                  <ProgressCircle.Track />
                  <ProgressCircle.Range />
                </ProgressCircle.Circle>
              </ProgressCircle.Root>
            </HStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {status === "idle" ? (
        <Card.Root variant={"subtle"}>
          <Card.Body>
            <Text color={"app.fg.muted"}>Configure settings and start a question-count test.</Text>
          </Card.Body>
        </Card.Root>
      ) : null}

      {status !== "idle" && question ? (
        <Card.Root borderColor={"app.border.default"}>
          <Card.Body>
            <VStack align={"stretch"} gap={4}>
              <HStack justify={"space-between"} wrap={"wrap"}>
                <Badge>Q {Math.min(questionIndex + 1, settings.questionCount)} / {settings.questionCount}</Badge>
                <Text fontSize={"sm"} color={"app.fg.muted"}>{question.helper}</Text>
              </HStack>

              <Text fontSize={"xl"} fontWeight={"semibold"}>{question.prompt}</Text>

              <Grid templateColumns={["repeat(2, 1fr)", "repeat(4, 1fr)"]} gap={3}>
                {question.choices.map((choice) => {
                  const hasAnswered = Boolean(answerState);
                  const isCorrectChoice = choice.value === question.correctValue;
                  const isSelected = answerState?.selectedValue === choice.value;

                  let variant: "outline" | "subtle" | "solid" = "outline";
                  let colorPalette: "gray" | "green" | "red" = "gray";

                  if (hasAnswered && isCorrectChoice) {
                    variant = "solid";
                    colorPalette = "green";
                  } else if (hasAnswered && isSelected && !isCorrectChoice) {
                    variant = "subtle";
                    colorPalette = "red";
                  }

                  return (
                    <Button
                      key={choice.value}
                      onClick={() => submitAnswer(choice.value)}
                      disabled={hasAnswered || status !== "running"}
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
                        Response time: {formatMs(answerState.responseMs)} | Remaining: {remaining}
                      </Text>

                      {questionSteps ? (
                        <Text color={"app.fg.muted"} fontSize={"sm"}>
                          Date: {formatDate(question.date)} | Century: {WEEKDAYS[questionSteps.centuryAnchor]} |
                          Year: {WEEKDAYS[questionSteps.yearAnchor]} | Month ref: {question.date.month}/
                          {questionSteps.monthDoomsdayDay}
                        </Text>
                      ) : null}

                      <HStack>
                        <Button onClick={nextQuestion}>
                          <Icon as={LuPlay} />
                          {stats.attempts >= settings.questionCount ? "Finish" : "Next"}
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

      {status === "finished" ? (
        <Card.Root variant={"subtle"}>
          <Card.Body>
            <VStack align={"stretch"} gap={2}>
              <Text fontWeight={"semibold"}>Session complete</Text>
              <Text color={"app.fg.muted"}>
                Score: {stats.correct}/{settings.questionCount} | Accuracy: {accuracy}% | Avg time: {avgResponseMs > 0 ? formatMs(avgResponseMs) : "-"}
              </Text>
              <HStack>
                <Button onClick={startSession}>
                  <Icon as={LuPlay} />
                  New Session
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : null}

      <Card.Root variant={"subtle"}>
        <Card.Body>
          <HStack gap={2}>
            <Icon as={LuClock3} color={"app.fg.subtle"} />
            <Text color={"app.fg.muted"} fontSize={"sm"}>
              Timed mode is intentionally disabled. This tool runs question-count sessions only.
            </Text>
          </HStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}
