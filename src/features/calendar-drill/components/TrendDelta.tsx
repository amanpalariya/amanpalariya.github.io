import { HStack, Stat, Text } from "@chakra-ui/react";
import { formatSignedMsDelta, formatSignedPercent, getSignalColorToken } from "./practice-utils";

type TrendDeltaProps = {
  delta: number | null;
  isIncreasePositiveSignal: boolean;
  type: "percent" | "milliseconds";
};

export function TrendDelta({
  delta,
  isIncreasePositiveSignal,
  type,
}: TrendDeltaProps) {
  if (delta === null || delta === 0) return null;

  const signalColor = getSignalColorToken(delta, isIncreasePositiveSignal);
  const formattedValue =
    type === "percent" ? formatSignedPercent(delta) : formatSignedMsDelta(delta);

  return (
    <HStack
      as={"span"}
      gap={0.5}
      color={signalColor}
      fontSize={{ base: "2xs", md: "xs" }}
      fontWeight={"medium"}
      lineHeight={"short"}
      align={"center"}
    >
      {delta > 0 ? <Stat.UpIndicator /> : null}
      {delta < 0 ? <Stat.DownIndicator /> : null}
      <Text as={"span"} color={"currentColor"}>
        {formattedValue}
      </Text>
    </HStack>
  );
}