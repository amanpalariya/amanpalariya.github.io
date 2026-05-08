import { Box, Card, Grid, HStack, Text } from "@chakra-ui/react";
import type { PracticeTrends } from "./models";
import { formatMs } from "./practice-utils";
import { TrendDelta } from "./TrendDelta";

type SessionStatsCardProps = {
  showPlaceholderStats: boolean;
  accuracy: number;
  attempts: number;
  avgResponseMs: number;
  displayedAvgResponseMs: number;
  streak: number;
  trends: PracticeTrends;
};

export function SessionStatsCard({
  showPlaceholderStats,
  accuracy,
  attempts,
  avgResponseMs,
  displayedAvgResponseMs,
  streak,
  trends,
}: SessionStatsCardProps) {
  const statLabelProps = {
    color: "app.fg.subtle",
    fontSize: "sm",
    fontWeight: "medium",
  } as const;
  const statValueProps = {
    color: "app.fg.default",
    fontSize: "2xl",
    fontWeight: "semibold",
    lineHeight: "short",
  } as const;

  return (
    <Card.Root variant={"outline"} rounded={"2xl"}>
      <Card.Body>
        <Grid templateColumns={["repeat(2, minmax(0, 1fr))", "repeat(4, minmax(0, 1fr))"]} gap={3}>
          <Box minW={0}>
            <Text {...statLabelProps}>Accuracy</Text>
            <HStack align={"center"} gap={1.5} wrap={"nowrap"}>
              <Text {...statValueProps}>{showPlaceholderStats ? "-" : `${accuracy}%`}</Text>
              <Box minW={{ base: "48px", md: "58px" }}>
                <TrendDelta delta={trends.accuracyDelta} isIncreasePositiveSignal type={"percent"} />
              </Box>
            </HStack>
          </Box>

          <Box minW={0}>
            <Text {...statLabelProps}>Answered</Text>
            <Text {...statValueProps}>{showPlaceholderStats ? "-" : attempts}</Text>
          </Box>

          <Box minW={0}>
            <Text {...statLabelProps}>Avg Time</Text>
            <HStack align={"center"} gap={1.5} wrap={"nowrap"}>
              <Text {...statValueProps}>
                {showPlaceholderStats
                  ? "-"
                  : avgResponseMs > 0
                    ? formatMs(displayedAvgResponseMs)
                    : "-"}
              </Text>
              <Box minW={{ base: "48px", md: "58px" }}>
                <TrendDelta
                  delta={trends.avgResponseDeltaMs}
                  isIncreasePositiveSignal={false}
                  type={"milliseconds"}
                />
              </Box>
            </HStack>
          </Box>

          <Box minW={0}>
            <Text {...statLabelProps}>Streak</Text>
            <HStack align={"center"} gap={1.5}>
              <Text {...statValueProps}>{showPlaceholderStats ? "-" : streak}</Text>
              {!showPlaceholderStats && streak >= 5 ? (
                <Text as={"span"} fontSize={"lg"} lineHeight={1} role={"img"} aria-label={"fire"}>
                  🔥
                </Text>
              ) : null}
            </HStack>
          </Box>
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
