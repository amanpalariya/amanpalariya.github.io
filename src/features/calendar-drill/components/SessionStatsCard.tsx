import { Box, Card, Grid, HStack, Stat, Text } from "@chakra-ui/react";
import type { PracticeTrends } from "./models";
import { formatMs } from "./practice-utils";
import { TrendDelta } from "./TrendDelta";

type SessionStatsCardProps = {
  accuracy: number;
  attempts: number;
  avgResponseMs: number;
  displayedAvgResponseMs: number;
  streak: number;
  trends: PracticeTrends;
};

export function SessionStatsCard({
  accuracy,
  attempts,
  avgResponseMs,
  displayedAvgResponseMs,
  streak,
  trends,
}: SessionStatsCardProps) {
  return (
    <Card.Root variant={"outline"} rounded={"2xl"}>
      <Card.Body>
        <Grid templateColumns={["repeat(2, minmax(0, 1fr))", "repeat(4, minmax(0, 1fr))"]} gap={3}>
          <Stat.Root minW={0}>
            <Stat.Label>Accuracy</Stat.Label>
            <HStack align={"center"} gap={1.5} wrap={"nowrap"}>
              <Stat.ValueText>{accuracy}%</Stat.ValueText>
              <Box minW={{ base: "48px", md: "58px" }}>
                <TrendDelta delta={trends.accuracyDelta} isIncreasePositiveSignal type={"percent"} />
              </Box>
            </HStack>
          </Stat.Root>

          <Stat.Root minW={0}>
            <Stat.Label>Answered</Stat.Label>
            <Stat.ValueText>{attempts}</Stat.ValueText>
          </Stat.Root>

          <Stat.Root minW={0}>
            <Stat.Label>Avg Time</Stat.Label>
            <HStack align={"center"} gap={1.5} wrap={"nowrap"}>
              <Stat.ValueText>{avgResponseMs > 0 ? formatMs(displayedAvgResponseMs) : "-"}</Stat.ValueText>
              <Box minW={{ base: "48px", md: "58px" }}>
                <TrendDelta
                  delta={trends.avgResponseDeltaMs}
                  isIncreasePositiveSignal={false}
                  type={"milliseconds"}
                />
              </Box>
            </HStack>
          </Stat.Root>

          <Stat.Root minW={0}>
            <Stat.Label>Streak</Stat.Label>
            <HStack align={"center"} gap={1.5}>
              <Stat.ValueText>{streak}</Stat.ValueText>
              {streak >= 5 ? (
                <Text as={"span"} fontSize={"lg"} lineHeight={1} role={"img"} aria-label={"fire"}>
                  🔥
                </Text>
              ) : null}
            </HStack>
          </Stat.Root>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}