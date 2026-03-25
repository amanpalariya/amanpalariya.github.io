import {
  Box,
  Button,
  FileUpload,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { type ChangeEvent, type ClipboardEvent, useRef, useState } from "react";
import { LuFilePlus, LuUpload } from "react-icons/lu";
import type { PageDraft } from "../types";
import { PageDraftCard } from "./PageDraftCard";

export function PageDraftGrid({
  pages,
  isAdding,
  onRemove,
  onRename,
  onReorder,
  onAddFromClipboard,
  onAddFromFiles,
  pastedInput,
  onPastedInputChange,
  onPaste,
  onAddFromFallback,
}: {
  pages: PageDraft[];
  isAdding: boolean;
  onRemove: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onReorder: (draggedId: string, targetIndex: number) => void;
  onAddFromClipboard: () => Promise<void>;
  onAddFromFiles: (files: FileList | File[]) => Promise<void>;
  pastedInput: string;
  onPastedInputChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onAddFromFallback: () => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [isGhostDropTarget, setIsGhostDropTarget] = useState(false);
  const ghostUploadInputRef = useRef<HTMLInputElement | null>(null);

  function handleGhostUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    void onAddFromFiles(files);
    event.target.value = "";
  }

  const dragIndex =
    draggedId == null ? -1 : pages.findIndex((page) => page.id === draggedId);

  const previewPages =
    draggedId && dropIndex !== null && dragIndex >= 0
      ? (() => {
          const draggedPage = pages[dragIndex];
          const remaining = pages.filter((page) => page.id !== draggedId);
          const insertionIndex = Math.max(0, Math.min(dropIndex, remaining.length));
          const next = [...remaining];
          next.splice(insertionIndex, 0, draggedPage);
          return next;
        })()
      : pages;

  function handleDrop() {
    if (!draggedId) return;
    onReorder(draggedId, dropIndex ?? dragIndex);
    setDraggedId(null);
    setDropIndex(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropIndex(null);
    setIsGhostDropTarget(false);
  }

  function effectiveDropIndex(index: number) {
    if (!draggedId) return null;
    return dropIndex === index ? index : null;
  }

  async function handleGhostDrop(files: FileList | null) {
    setIsGhostDropTarget(false);
    if (!files || files.length === 0) return;
    await onAddFromFiles(files);
  }

  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 3 }}
      gap={2}
      alignItems={"start"}
    >
      {previewPages.map((page, index) => {
        const isDraggedCard = draggedId === page.id;
        const isDropTarget = effectiveDropIndex(index) !== null;

        return (
          <Box
            key={page.id}
            onDragOver={(event) => {
              event.preventDefault();
              if (!draggedId) return;
              if (draggedId === page.id) return;
              setDropIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop();
            }}
          >
            <PageDraftCard
              page={page}
              chapterNumber={index + 1}
              onRemove={onRemove}
              onRename={onRename}
              onDragStart={(id) => {
                setDraggedId(id);
                setDropIndex(index);
              }}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              isDragging={isDraggedCard}
              isDropTarget={isDropTarget}
            />
          </Box>
        );
      })}

      <Box
        w={"full"}
        borderWidth={isGhostDropTarget ? "3px" : "2px"}
        borderStyle={"dashed"}
        borderColor={
          isGhostDropTarget ? "app.epub.border.accent" : "app.epub.border.default"
        }
        rounded={"2xl"}
        overflow={"hidden"}
        bg={"app.epub.bg.preview"}
        transition={"all 0.2s ease"}
        _hover={{
          borderColor: "app.epub.border.accent",
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsGhostDropTarget(true);
        }}
        onDragLeave={(event) => {
          const nextTarget = event.relatedTarget as Node | null;
          if (nextTarget && event.currentTarget.contains(nextTarget)) return;
          setIsGhostDropTarget(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleGhostDrop(event.dataTransfer.files);
        }}
      >
        <Box h={"336px"} display={"flex"} flexDirection={"column"}>
          <Box borderBottomWidth={"1px"} borderColor={"app.epub.border.muted"}>
            <FileUpload.Root maxFiles={50}>
              <FileUpload.HiddenInput
                ref={ghostUploadInputRef}
                onChange={handleGhostUploadChange}
              />
              <Button
                size={"xs"}
                w={"full"}
                rounded={"none"}
                m={0}
                display={"inline-flex"}
                justifyContent={"center"}
                gap={1.5}
                variant={"subtle"}
                loading={isAdding}
                onClick={() => ghostUploadInputRef.current?.click()}
                bg={"app.epub.button.subtle.bg"}
                color={"app.epub.button.subtle.fg"}
                _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
              >
                <Icon>
                  <LuUpload />
                </Icon>
                Upload files
              </Button>
            </FileUpload.Root>
          </Box>

          <VStack
            flex={1}
            align={"center"}
            justify={"center"}
            gap={2}
            color={"app.epub.fg.subtle"}
            opacity={0.9}
            textAlign={"center"}
            px={4}
            cursor={isAdding ? "progress" : "pointer"}
            onClick={() => {
              if (isAdding) return;
              void onAddFromClipboard();
            }}
          >
            <Icon boxSize={8}>
              <LuFilePlus />
            </Icon>
            <Text fontFamily={"ui"} fontSize={"xs"} fontWeight={"semibold"}>
              Add page
            </Text>
            <Text fontFamily={"ui"} fontSize={"xs"} color={"app.epub.fg.subtle"}>
              Click to import clipboard content, upload files, or drop files.
            </Text>
          </VStack>

          <Box
            flex={1}
            borderTopWidth={"1px"}
            borderColor={"app.epub.border.muted"}
            display={"flex"}
            flexDirection={"column"}
          >
            <Textarea
              value={pastedInput}
              onChange={(event) => onPastedInputChange(event.target.value)}
              onPaste={onPaste}
              flex={1}
              minH={0}
              rounded={"none"}
              borderWidth={0}
              resize={"none"}
              bg={"app.epub.bg.card"}
              color={"app.epub.fg.default"}
              _placeholder={{ color: "app.epub.fg.subtle" }}
              placeholder={"Paste HTML, text, or image here"}
            />
            <Button
              size={"xs"}
              w={"full"}
              rounded={"none"}
              mt={0}
              variant={"subtle"}
              onClick={onAddFromFallback}
              bg={"app.epub.button.subtle.bg"}
              color={"app.epub.button.subtle.fg"}
              _hover={{ bg: "app.epub.button.subtle.hoverBg" }}
            >
              Add pasted content
            </Button>
          </Box>
        </Box>
      </Box>
    </SimpleGrid>
  );
}
