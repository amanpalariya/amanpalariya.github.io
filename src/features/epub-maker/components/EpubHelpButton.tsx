import {
  Box,
  Dialog,
  HStack,
  IconButton,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ShortcutHint } from "@components/core/ShortcutHint";
import { DialogCloseTrigger, DialogContent } from "@components/ui/dialog";
import { Tooltip } from "@components/ui/tooltip";
import { LuCircleHelp, LuCommand } from "react-icons/lu";

function ShortcutJoiner({ value }: { value: string }) {
  return (
    <Text fontSize={"xs"} color={"app.epub.fg.subtle"} fontWeight={"medium"}>
      {value}
    </Text>
  );
}

export function EpubHelpButton() {
  return (
    <Dialog.Root>
      <Tooltip content={"Help"}>
        <Dialog.Trigger asChild>
          <IconButton
            size={"md"}
            rounded={"full"}
            variant={"ghost"}
            aria-label={"Open ePub Maker help"}
            bg={"transparent"}
            color={"app.epub.fg.muted"}
            _hover={{
              bg: "app.epub.bg.surface",
              color: "app.epub.fg.default",
            }}
          >
            <LuCircleHelp size={20} />
          </IconButton>
        </Dialog.Trigger>
      </Tooltip>

      <DialogContent
        bg={"app.epub.bg.surface"}
        color={"app.epub.fg.default"}
        rounded={"2xl"}
        borderWidth={"1px"}
        borderColor={"app.epub.border.default"}
        maxW={"560px"}
      >
        <Dialog.Header>
          <Dialog.Title fontFamily={"ui"}>EPUB Maker help</Dialog.Title>
        </Dialog.Header>

        <Dialog.Body>
          <VStack align={"stretch"} gap={5} fontFamily={"ui"} fontSize={"sm"}>
            <Box>
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
                <Text
                  as={"li"}
                  display={"list-item"}
                  color={"app.epub.fg.default"}
                >
                  Add pages from clipboard, upload files, drag and drop, or
                  paste.
                </Text>
                <Text
                  as={"li"}
                  display={"list-item"}
                  color={"app.epub.fg.default"}
                >
                  Use the cover controls to upload a custom cover image, reset to
                  the auto cover (title + author), or disable cover export.
                </Text>
                <Text
                  as={"li"}
                  display={"list-item"}
                  color={"app.epub.fg.default"}
                >
                  Rename, reorder, or remove pages in the draft grid. Cover stays
                  pinned first and cannot be dragged.
                </Text>
                <Text
                  as={"li"}
                  display={"list-item"}
                  color={"app.epub.fg.default"}
                >
                  Set book metadata and generation options.
                </Text>
                <Text
                  as={"li"}
                  display={"list-item"}
                  color={"app.epub.fg.default"}
                >
                  Click "Save EPUB" to generate and download the final EPUB.
                </Text>
              </VStack>
            </Box>

            <Separator />

            <Box>
              <Text fontWeight={"semibold"} mb={2}>
                Keyboard shortcuts
              </Text>
              <VStack align={"stretch"} gap={2}>
                <HStack justify={"space-between"}>
                  <Text color={"app.epub.fg.default"}>Paste and add page</Text>
                  <HStack gap={1}>
                    <ShortcutHint icon={LuCommand} label={""} />
                    <ShortcutJoiner value={"/"} />
                    <ShortcutHint label={"Ctrl"} />
                    <ShortcutJoiner value={"+"} />
                    <ShortcutHint label={"V"} />
                  </HStack>
                </HStack>

                <HStack justify={"space-between"}>
                  <Text color={"app.epub.fg.default"}>Undo</Text>
                  <HStack gap={1}>
                    <ShortcutHint icon={LuCommand} label={""} />
                    <ShortcutJoiner value={"/"} />
                    <ShortcutHint label={"Ctrl"} />
                    <ShortcutJoiner value={"+"} />
                    <ShortcutHint label={"Z"} />
                  </HStack>
                </HStack>

                <HStack justify={"space-between"} align={"start"}>
                  <Text color={"app.epub.fg.default"}>Redo</Text>
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
            </Box>
          </VStack>
        </Dialog.Body>

        <DialogCloseTrigger />
      </DialogContent>
    </Dialog.Root>
  );
}
