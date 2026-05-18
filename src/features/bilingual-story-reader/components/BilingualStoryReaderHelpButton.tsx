import { Box, IconButton, Text, VStack } from "@chakra-ui/react";
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
import { LuCircleHelp } from "react-icons/lu";

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
        maxW="520px"
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
                as="ol"
                align="stretch"
                gap={1}
                ps={5}
                listStylePosition="outside"
                listStyleType="decimal"
              >
                <Text as="li" display="list-item">
                  Copy the prompt.
                </Text>
                <Text as="li" display="list-item">
                  Generate the story in your AI assistant.
                </Text>
                <Text as="li" display="list-item">
                  Paste the response.
                </Text>
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
          </VStack>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
