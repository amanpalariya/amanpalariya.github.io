import { Box, Button, Icon, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuCircleX } from "react-icons/lu";
import type { WeekdayChoice } from "./models";
import { ShortcutHint } from "./ShortcutHint";

type ChoiceButtonProps = {
  choice: WeekdayChoice;
  requiredPrefixLength: number;
  correctValue: string;
  selectedValue?: string;
  hasAnswered: boolean;
  hasPrefix: boolean;
  isSessionRunning: boolean;
  prefix: string;
  onSelect: (choiceValue: string) => void;
};

export function ChoiceButton({
  choice,
  requiredPrefixLength,
  correctValue,
  selectedValue,
  hasAnswered,
  hasPrefix,
  isSessionRunning,
  prefix,
  onSelect,
}: ChoiceButtonProps) {
  const isCorrectChoice = choice.value === correctValue;
  const isSelected = selectedValue === choice.value;
  const matchesPrefix = choice.label.toLowerCase().startsWith(prefix.toLowerCase());
  const safeRequiredPrefixLength = Math.min(
    Math.max(1, requiredPrefixLength),
    choice.label.length,
  );
  const showPrefixHints = !hasAnswered && isSessionRunning;
  const typedPrefixLength =
    showPrefixHints && hasPrefix && matchesPrefix ? Math.min(prefix.length, choice.label.length) : 0;

  const requiredPrefixText = choice.label.slice(0, safeRequiredPrefixLength);
  const typedPrefixText = choice.label.slice(0, typedPrefixLength);
  const remainingRequiredPrefixText = choice.label.slice(typedPrefixLength, safeRequiredPrefixLength);
  const remainderText = choice.label.slice(Math.max(typedPrefixLength, safeRequiredPrefixLength));

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
      onClick={() => onSelect(choice.value)}
      disabled={hasAnswered || !isSessionRunning || (hasPrefix && !matchesPrefix)}
      variant={variant}
      colorPalette={colorPalette}
      borderWidth={"2px"}
      justifyContent={"flex-start"}
      ps={3}
      pe={10}
      position={"relative"}
    >
      <Text>
        {showPrefixHints ? (
          typedPrefixLength > 0 ? (
            <>
              <Text as={"span"} bg={"colorPalette.emphasized"} color={"colorPalette.fg"}>
                {typedPrefixText}
              </Text>
              {remainingRequiredPrefixText ? (
                <Text
                  as={"span"}
                  textDecoration={"underline"}
                  textDecorationThickness={"1px"}
                  textDecorationColor={"app.fg.subtle"}
                >
                  {remainingRequiredPrefixText}
                </Text>
              ) : null}
              <Text as={"span"}>{remainderText}</Text>
            </>
          ) : (
            <>
              <Text
                as={"span"}
                textDecoration={"underline"}
                textDecorationThickness={"1px"}
                textDecorationColor={"app.fg.subtle"}
              >
                {requiredPrefixText}
              </Text>
              <Text as={"span"}>{choice.label.slice(safeRequiredPrefixLength)}</Text>
            </>
          )
        ) : (
          choice.label
        )}
      </Text>

      {!hasAnswered ? (
        <Box
          position={"absolute"}
          insetY={0}
          insetEnd={0}
          w={9}
          px={0}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"center"}
          opacity={0.65}
          roundedEnd={"xl"}
        >
          <ShortcutHint label={choice.shortcutKey} shape={"square"} />
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
}