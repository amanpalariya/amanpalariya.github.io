import { IconButton, Text, VStack } from "@chakra-ui/react";
import { DialogTrigger } from "@components/ui/dialog";
import {
  SiteDialogContent,
  SiteDialogRoot,
  SiteDialogSection,
} from "@components/ui/site-dialog";
import { Tooltip } from "@components/ui/tooltip";
import { LuCircleHelp } from "react-icons/lu";

export function BilingualStoryReaderHelpButton() {
  return (
    <SiteDialogRoot>
      <Tooltip content="Help">
        <DialogTrigger asChild>
          <IconButton
            aria-label="Open story reader help"
            bg="transparent"
            color="app.fg.subtle"
            rounded="full"
            size="md"
            variant="ghost"
            _hover={{ bg: "app.bg.overlay", color: "app.fg.default" }}
          >
            <LuCircleHelp size={20} />
          </IconButton>
        </DialogTrigger>
      </Tooltip>

      <SiteDialogContent title="Story reader help">
        <VStack align="stretch" gap={0} fontFamily="ui" fontSize="sm">
          <SiteDialogSection>
            <Text fontWeight="semibold" mb={2}>
              How to use
            </Text>
            <VStack
              as="ol"
              align="stretch"
              gap={1}
              ps={5}
              listStyleType="decimal"
              listStylePosition="outside"
            >
              <Text as="li" display="list-item" color="app.fg.default">
                Choose your known and target languages, level, story length,
                theme, and any extra instructions.
              </Text>
              <Text as="li" display="list-item" color="app.fg.default">
                Click &quot;Copy Prompt&quot;. Use the eye button to preview or
                temporarily edit the prompt.
              </Text>
              <Text as="li" display="list-item" color="app.fg.default">
                Paste the prompt into your AI chat, then copy the JSON response.
              </Text>
              <Text as="li" display="list-item" color="app.fg.default">
                Click &quot;Load Story from Clipboard&quot; to open the story.
                Use the dropdown for manual paste if clipboard access is
                blocked.
              </Text>
              <Text as="li" display="list-item" color="app.fg.default">
                Click a sentence to see its translation and any note. You can
                also focus a sentence with Tab and press Enter or Space.
              </Text>
            </VStack>
          </SiteDialogSection>

          <SiteDialogSection>
            <Text fontWeight="semibold" mb={2}>
              Saved stories
            </Text>
            <Text color="app.fg.default">
              Open past stories from Story History in the sidebar, or below
              setup on smaller screens. Click the heading to collapse or expand
              the list. Delete individual stories with the trash button, or use
              &quot;Clear History&quot; to remove them all.
            </Text>
          </SiteDialogSection>

          <SiteDialogSection>
            <Text fontWeight="semibold" mb={2}>
              Privacy
            </Text>
            <Text color="app.fg.default">
              Clipboard responses are checked locally in your browser. Your
              setup and saved stories are stored in this browser on this device.
            </Text>
          </SiteDialogSection>
        </VStack>
      </SiteDialogContent>
    </SiteDialogRoot>
  );
}
