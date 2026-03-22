import { Alert, Box, Button, Code, List, Text } from "@chakra-ui/react";
import type { GenerationWarning } from "../types";

export function StatusAlerts({
  showPasteFallback,
  summary,
  errors,
  warnings,
  generationProgress,
  onDismissWarnings,
}: {
  showPasteFallback: boolean;
  summary: string;
  errors: string[];
  warnings: GenerationWarning[];
  generationProgress: number | null;
  onDismissWarnings: () => void;
}) {
  return (
    <>
      <Alert.Root status={"info"}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Quick steps</Alert.Title>
          <Alert.Description>
            1) Copy HTML/text, 2) Add page(s), 3) Generate EPUB.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      {showPasteFallback ? (
        <Alert.Root status={"warning"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Clipboard fallback enabled</Alert.Title>
            <Alert.Description>
              If automatic clipboard read is blocked, click in the box below and
              press
              <Code> Cmd/Ctrl + V </Code> to paste HTML/text directly.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}

      {generationProgress !== null ? (
        <Box
          borderWidth={"1px"}
          borderColor={"border.subtle"}
          rounded={"md"}
          px={3}
          py={2}
          bg={"bg.subtle"}
        >
          <Text fontSize={"sm"} color={"fg.muted"} mb={1}>
            Generating EPUB… {generationProgress}%
          </Text>
          <Box h={"2"} rounded={"full"} bg={"bg.emphasized"} overflow={"hidden"}>
            <Box
              h={"full"}
              bg={"colorPalette.solid"}
              style={{ width: `${generationProgress}%`, transition: "width 0.2s ease" }}
            />
          </Box>
        </Box>
      ) : null}

      {summary ? (
        <Alert.Root status={"success"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{summary}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : null}

      {errors.length > 0 ? (
        <Alert.Root status={"error"}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Errors</Alert.Title>
            <List.Root>
              {errors.map((error) => (
                <List.Item key={error}>
                  <Code whiteSpace={"pre-wrap"}>{error}</Code>
                </List.Item>
              ))}
            </List.Root>
          </Alert.Content>
        </Alert.Root>
      ) : null}

      {warnings.length > 0 ? (
        <Alert.Root status={"warning"}>
          <Alert.Indicator />
          <Alert.Content>
            <Box display={"flex"} justifyContent={"space-between"} alignItems={"start"} mb={2}>
              <Alert.Title>Warnings</Alert.Title>
              <Button size={"xs"} variant={"ghost"} onClick={onDismissWarnings}>
                Dismiss
              </Button>
            </Box>
            <Box maxH={"150px"} overflowY={"auto"} pr={1}>
              <List.Root>
                {warnings.map((warning, index) => (
                  <List.Item key={`${warning.code}-${warning.source || index}`}>
                    <Code whiteSpace={"pre-wrap"}>{warning.message}</Code>
                  </List.Item>
                ))}
              </List.Root>
            </Box>
          </Alert.Content>
        </Alert.Root>
      ) : null}
    </>
  );
}
