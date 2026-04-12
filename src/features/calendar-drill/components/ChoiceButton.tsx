import { Box, Button, Icon, Text } from "@chakra-ui/react";
import { LuCircleCheck, LuCircleX } from "react-icons/lu";
import type { WeekdayChoice } from "./models";

type ChoiceButtonProps = {
  choice: WeekdayChoice;
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
}