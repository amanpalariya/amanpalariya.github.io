import {
  Box,
  Dialog,
  HStack,
  Icon,
  IconButton,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { DialogCloseTrigger, DialogContent } from "@components/ui/dialog";
import { Tooltip } from "@components/ui/tooltip";
import { LuCircleHelp, LuCommand } from "react-icons/lu";
import type { IconType } from "react-icons";

function ShortcutToken({ label, icon }: { label?: string; icon?: IconType }) {
  return (
    <HStack
      minH={"1.75rem"}
      px={2}
      rounded={"md"}
      borderWidth={"1px"}
      borderColor={"app.epub.border.default"}
      bg={"app.epub.bg.surface"}
      color={"app.epub.fg.default"}
      fontSize={"xs"}
      fontWeight={"semibold"}
      gap={1}
      lineHeight={1}
    >
      {icon ? <Icon as={icon} boxSize={3.5} /> : null}
      {label ? <Text>{label}</Text> : null}
    </HStack>
  );
}

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
                  Use the cover controls to include/exclude cover, upload a custom
                  cover, or reset to auto cover (title + author).
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
                    <ShortcutToken icon={LuCommand} />
                    <ShortcutJoiner value={"/"} />
                    <ShortcutToken label={"Ctrl"} />
                    <ShortcutJoiner value={"+"} />
                    <ShortcutToken label={"V"} />
                  </HStack>
                </HStack>

                <HStack justify={"space-between"}>
                  <Text color={"app.epub.fg.default"}>Undo</Text>
                  <HStack gap={1}>
                    <ShortcutToken icon={LuCommand} />
                    <ShortcutJoiner value={"/"} />
                    <ShortcutToken label={"Ctrl"} />
                    <ShortcutJoiner value={"+"} />
                    <ShortcutToken label={"Z"} />
                  </HStack>
                </HStack>

                <HStack justify={"space-between"} align={"start"}>
                  <Text color={"app.epub.fg.default"}>Redo</Text>
                  <HStack gap={1} wrap={"wrap"} justify={"end"}>
                    <ShortcutToken icon={LuCommand} />
                    <ShortcutJoiner value={"/"} />
                    <ShortcutToken label={"Ctrl"} />
                    <ShortcutJoiner value={"+"} />
                    <ShortcutToken label={"Shift"} />
                    <ShortcutJoiner value={"+"} />
                    <ShortcutToken label={"Z"} />
                    <ShortcutJoiner value={"or"} />
                    <ShortcutToken label={"Ctrl"} />
                    <ShortcutJoiner value={"+"} />
                    <ShortcutToken label={"Y"} />
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
