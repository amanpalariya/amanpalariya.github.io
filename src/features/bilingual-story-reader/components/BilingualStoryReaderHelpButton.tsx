import { Box, HStack, Icon, IconButton, Text, VStack } from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Tooltip } from "@components/ui/tooltip";
import {
  LuBookOpen,
  LuBot,
  LuCircleHelp,
  LuClipboardPaste,
  LuCode,
  LuCopy,
  LuFileJson,
  LuMessageSquareText,
} from "react-icons/lu";

const PROMPT_FLOW = {
  bg: "blue.500",
  fg: "white",
  subtleBg: "blue.50",
  subtleFg: "blue.700",
  border: "blue.200",
  subtleBgDark: "blue.950",
  subtleFgDark: "blue.200",
  borderDark: "blue.800",
} as const;

const JSON_FLOW = {
  bg: "green.500",
  fg: "white",
  subtleBg: "green.50",
  subtleFg: "green.700",
  border: "green.200",
  subtleBgDark: "green.950",
  subtleFgDark: "green.200",
  borderDark: "green.800",
} as const;

const HELP_STEP_CARD_PROPS = {
  bg: "gray.50",
  borderColor: "app.bilingualStoryReader.border.activeSentence",
  borderWidth: "1px",
  boxShadow: "md",
  gap: 0,
  overflow: "hidden",
  rounded: "xl",
  w: { base: "full", md: "82%" },
  maxW: "430px",
  _dark: {
    bg: "gray.950",
  },
} as const;

const HELP_STEP_HEADER_PROPS = {
  bg: "app.bilingualStoryReader.accent.soft",
  borderBottomColor: "app.bilingualStoryReader.accent.softDivider",
  borderBottomWidth: "1px",
  color: "app.bilingualStoryReader.fg.accent",
  gap: 1.5,
  px: 3,
  py: 2.5,
  w: "full",
} as const;

function FlowConnector({
  children,
  flow,
}: {
  children: string;
  flow: typeof PROMPT_FLOW | typeof JSON_FLOW;
}) {
  return (
    <VStack color="app.bilingualStoryReader.fg.muted" gap={1} py={0.5}>
      <Box
        aria-hidden="true"
        h={11}
        position="relative"
        w={4}
        _before={{
          bg: "app.bilingualStoryReader.border.activeSentence",
          bottom: "7px",
          content: "\"\"",
          left: "50%",
          position: "absolute",
          rounded: "full",
          top: 0,
          transform: "translateX(-50%)",
          w: "2px",
        }}
        _after={{
          borderLeftColor: "transparent",
          borderLeftWidth: "6px",
          borderRightColor: "transparent",
          borderRightWidth: "6px",
          borderTopColor: "app.bilingualStoryReader.border.activeSentence",
          borderTopWidth: "8px",
          bottom: 0,
          content: "\"\"",
          h: 0,
          left: "50%",
          position: "absolute",
          transform: "translateX(-50%)",
          w: 0,
        }}
      />
      <Box
        bg={flow.subtleBg}
        borderColor={flow.border}
        borderWidth="1px"
        color={flow.subtleFg}
        fontSize="xs"
        fontWeight="semibold"
        px={2.5}
        py={0.5}
        rounded="full"
        _dark={{
          bg: flow.subtleBgDark,
          borderColor: flow.borderDark,
          color: flow.subtleFgDark,
        }}
      >
        {children}
      </Box>
    </VStack>
  );
}

export function BilingualStoryReaderHelpButton() {
  return (
    <DialogRoot>
      <Tooltip content="Help">
        <DialogTrigger asChild>
          <IconButton
            aria-label="Open story reader help"
            bg="transparent"
            color="app.bilingualStoryReader.fg.muted"
            rounded="full"
            size="md"
            variant="ghost"
            _hover={{
              bg: "app.bilingualStoryReader.bg.subtle",
              color: "app.bilingualStoryReader.fg.default",
            }}
          >
            <LuCircleHelp size={20} />
          </IconButton>
        </DialogTrigger>
      </Tooltip>

      <DialogContent
        bg="app.bilingualStoryReader.bg.card"
        borderColor="app.bilingualStoryReader.border.default"
        borderWidth="1px"
        color="app.bilingualStoryReader.fg.default"
        maxW="760px"
        rounded="2xl"
      >
        <DialogHeader>
          <DialogTitle fontFamily="ui">Story reader help</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack align="stretch" gap={4} fontFamily="ui" fontSize="sm">
            <Box>
              <Text fontWeight="semibold" mb={2}>
                How to use
              </Text>
              <VStack
                align="stretch"
                gap={3}
                >
                <VStack
                  align="start"
                  alignSelf="flex-start"
                  {...HELP_STEP_CARD_PROPS}
                >
                  <HStack {...HELP_STEP_HEADER_PROPS}>
                    <Icon as={LuBookOpen} boxSize={4} />
                    <Text fontSize="sm" fontWeight="semibold">
                      1. Story Reader
                    </Text>
                  </HStack>
                  <VStack align="stretch" gap={2} p={3} w="full">
                    <Box
                      borderColor="app.bilingualStoryReader.border.default"
                      borderWidth="1px"
                      fontSize="xs"
                      px={2}
                      py={1.5}
                      rounded="md"
                    >
                      Setup: English → Spanish
                    </Box>
                    <Box
                      borderColor="app.bilingualStoryReader.border.default"
                      borderWidth="1px"
                      color="app.bilingualStoryReader.fg.muted"
                      fontSize="xs"
                      px={2}
                      py={1.5}
                      rounded="md"
                    >
                      Generated prompt...
                    </Box>
                    <HStack
                      bg={PROMPT_FLOW.bg}
                      color={PROMPT_FLOW.fg}
                      fontSize="xs"
                      fontWeight="semibold"
                      gap={1}
                      justify="center"
                      px={2}
                      py={1.5}
                      rounded="md"
                      _dark={{ bg: "blue.400", color: "gray.900" }}
                    >
                      <Icon as={LuCopy} boxSize={3.5} />
                      <Text>Copy Prompt</Text>
                    </HStack>
                  </VStack>
                </VStack>

                <FlowConnector flow={PROMPT_FLOW}>Prompt</FlowConnector>

                <VStack
                  align="start"
                  alignSelf="flex-end"
                  {...HELP_STEP_CARD_PROPS}
                >
                  <HStack {...HELP_STEP_HEADER_PROPS}>
                    <Icon as={LuBot} boxSize={4} />
                    <Text fontSize="sm" fontWeight="semibold">
                      2. Chat LLM
                    </Text>
                  </HStack>
                  <VStack align="stretch" gap={2} p={3} w="full">
                    <HStack
                      justify="end"
                      w="full"
                    >
                      <HStack
                        bg={PROMPT_FLOW.subtleBg}
                        borderColor={PROMPT_FLOW.border}
                        borderWidth="1px"
                        color={PROMPT_FLOW.subtleFg}
                        fontSize="xs"
                        gap={1.5}
                        maxW="80%"
                        px={2}
                        py={1.5}
                        roundedTop="2xl"
                        roundedBottomLeft="sm"
                        roundedBottomRight="2xl"
                        _dark={{
                          bg: PROMPT_FLOW.subtleBgDark,
                          borderColor: PROMPT_FLOW.borderDark,
                          color: PROMPT_FLOW.subtleFgDark,
                        }}
                      >
                        <Icon as={LuMessageSquareText} boxSize={3.5} />
                        <Text>Paste prompt</Text>
                      </HStack>
                    </HStack>
                    <HStack
                      justify="start"
                      w="full"
                    >
                      <HStack
                        bg={JSON_FLOW.subtleBg}
                        borderColor={JSON_FLOW.border}
                        borderWidth="1px"
                        color={JSON_FLOW.subtleFg}
                        fontSize="xs"
                        gap={1.5}
                        maxW="80%"
                        px={2}
                        py={1.5}
                        roundedTop="2xl"
                        roundedBottomLeft="2xl"
                        roundedBottomRight="sm"
                        _dark={{
                          bg: JSON_FLOW.subtleBgDark,
                          borderColor: JSON_FLOW.borderDark,
                          color: JSON_FLOW.subtleFgDark,
                        }}
                      >
                        <Icon as={LuFileJson} boxSize={3.5} />
                        <Text>Copy JSON response</Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </VStack>

                <FlowConnector flow={JSON_FLOW}>JSON</FlowConnector>

                <VStack
                  align="start"
                  alignSelf="flex-start"
                  {...HELP_STEP_CARD_PROPS}
                >
                  <HStack {...HELP_STEP_HEADER_PROPS}>
                    <Icon as={LuBookOpen} boxSize={4} />
                    <Text fontSize="sm" fontWeight="semibold">
                      3. Story Reader
                    </Text>
                  </HStack>
                  <VStack align="stretch" gap={2} p={3} w="full">
                    <HStack
                      borderColor="app.bilingualStoryReader.border.default"
                      borderWidth="1px"
                      color="app.bilingualStoryReader.fg.muted"
                      fontSize="xs"
                      justify="start"
                      px={2}
                      py={1.5}
                      rounded="md"
                    >
                      <Icon as={LuCode} boxSize={3.5} />
                      <Text>Paste JSON response</Text>
                    </HStack>
                    <HStack
                      bg={JSON_FLOW.bg}
                      color={JSON_FLOW.fg}
                      fontSize="xs"
                      fontWeight="semibold"
                      gap={1}
                      justify="center"
                      px={2}
                      py={1.5}
                      rounded="md"
                      _dark={{ bg: "green.400", color: "gray.900" }}
                    >
                      <Icon as={LuClipboardPaste} boxSize={3.5} />
                      <Text>Load Story</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={1}>
                Privacy
              </Text>
              <Text color="app.bilingualStoryReader.fg.muted">
                Clipboard responses are checked locally in your browser.
              </Text>
            </Box>
            <HStack
              bg="app.bilingualStoryReader.bg.subtle"
              borderColor="app.bilingualStoryReader.border.default"
              borderWidth="1px"
              color="app.bilingualStoryReader.fg.muted"
              p={2.5}
              rounded="lg"
            >
              <Icon as={LuBookOpen} boxSize={4} />
              <Text fontSize="xs">
                Tip: Use the manual paste panel if clipboard access is blocked.
              </Text>
            </HStack>
          </VStack>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
