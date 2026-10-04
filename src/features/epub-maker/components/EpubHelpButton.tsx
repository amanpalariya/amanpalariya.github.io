import { HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { ShortcutHint } from "@components/core/ShortcutHint";
import { DialogTrigger } from "@components/ui/dialog";
import {
  SiteDialogContent,
  SiteDialogRoot,
  SiteDialogSection,
} from "@components/ui/site-dialog";
import { Tooltip } from "@components/ui/tooltip";
import { LuCircleHelp, LuCommand } from "react-icons/lu";

function ShortcutJoiner({ value }: { value: string }) {
  return (
    <Text fontSize={"xs"} color={"app.fg.subtle"} fontWeight={"medium"}>
      {value}
    </Text>
  );
}

export function EpubHelpButton() {
  return (
    <SiteDialogRoot>
      <Tooltip content={"Help"}>
        <DialogTrigger asChild>
          <IconButton
            size={"md"}
            rounded={"full"}
            variant={"ghost"}
            aria-label={"Open ePub Maker help"}
            bg={"transparent"}
            color={"app.fg.subtle"}
            _hover={{
              bg: "app.bg.overlay",
              color: "app.fg.default",
            }}
          >
            <LuCircleHelp size={20} />
          </IconButton>
        </DialogTrigger>
      </Tooltip>

      <SiteDialogContent title="EPUB Maker help">
        <VStack align={"stretch"} gap={0} fontFamily={"ui"} fontSize={"sm"}>
          <SiteDialogSection>
            <Text fontWeight={"semibold"} mb={2}>
              How to use
            </Text>
            <VStack
              as={"ol"}
              align={"stretch"}
              gap={1}
              ps={5}
              listStyleType={"decimal"}
              listStylePosition={"outside"}
            >
              <Text as={"li"} display={"list-item"} color={"app.fg.default"}>
                Add pages from clipboard, upload files, drag and drop, or paste.
              </Text>
              <Text as={"li"} display={"list-item"} color={"app.fg.default"}>
                Use the cover controls to upload a custom cover image, reset to
                the auto cover (title + author), or disable cover export.
              </Text>
              <Text as={"li"} display={"list-item"} color={"app.fg.default"}>
                Rename, reorder, or remove pages in the draft grid. Cover stays
                pinned first and cannot be dragged.
              </Text>
              <Text as={"li"} display={"list-item"} color={"app.fg.default"}>
                Set book metadata and generation options.
              </Text>
              <Text as={"li"} display={"list-item"} color={"app.fg.default"}>
                Click &quot;Save EPUB&quot; to generate and download the final
                EPUB.
              </Text>
            </VStack>
          </SiteDialogSection>

          <SiteDialogSection>
            <Text fontWeight={"semibold"} mb={2}>
              Keyboard shortcuts
            </Text>
            <VStack align={"stretch"} gap={2}>
              <HStack justify={"space-between"}>
                <Text color={"app.fg.default"}>Paste and add page</Text>
                <HStack gap={1}>
                  <ShortcutHint icon={LuCommand} label={""} />
                  <ShortcutJoiner value={"/"} />
                  <ShortcutHint label={"Ctrl"} />
                  <ShortcutJoiner value={"+"} />
                  <ShortcutHint label={"V"} />
                </HStack>
              </HStack>

              <HStack justify={"space-between"}>
                <Text color={"app.fg.default"}>Undo</Text>
                <HStack gap={1}>
                  <ShortcutHint icon={LuCommand} label={""} />
                  <ShortcutJoiner value={"/"} />
                  <ShortcutHint label={"Ctrl"} />
                  <ShortcutJoiner value={"+"} />
                  <ShortcutHint label={"Z"} />
                </HStack>
              </HStack>

              <HStack justify={"space-between"} align={"start"}>
                <Text color={"app.fg.default"}>Redo</Text>
                <HStack gap={1} wrap={"wrap"} justify={"end"}>
                  <ShortcutHint icon={LuCommand} label={""} />
                  <ShortcutJoiner value={"/"} />
                  <ShortcutHint label={"Ctrl"} />
                  <ShortcutJoiner value={"+"} />
                  <ShortcutHint label={"Shift"} />
                  <ShortcutJoiner value={"+"} />
                  <ShortcutHint label={"Z"} />
                  <ShortcutJoiner value={"or"} />
                  <ShortcutHint label={"Ctrl"} />
                  <ShortcutJoiner value={"+"} />
                  <ShortcutHint label={"Y"} />
                </HStack>
              </HStack>
            </VStack>
          </SiteDialogSection>
        </VStack>
      </SiteDialogContent>
    </SiteDialogRoot>
  );
}
