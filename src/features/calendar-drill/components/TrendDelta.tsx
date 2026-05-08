import { Icon, Text, VStack } from "@chakra-ui/react";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { formatMs, getSignalColorToken } from "./practice-utils";

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
    type === "percent" ? `${Math.abs(delta)}%` : formatMs(Math.abs(delta));

  return (
    <VStack
      as={"span"}
      gap={0}
      color={signalColor}
      fontSize={{ base: "2xs", md: "xs" }}
      fontWeight={"medium"}
      lineHeight={1}
      align={"center"}
    >
      {delta > 0 ? <Icon as={LuTrendingUp} boxSize={"1em"} /> : null}
      {delta < 0 ? <Icon as={LuTrendingDown} boxSize={"1em"} /> : null}
      <Text as={"span"} color={"currentColor"}>
        {formattedValue}
      </Text>
    </VStack>
  );
}
